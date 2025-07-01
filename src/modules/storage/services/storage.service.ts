import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageItemDataType } from 'modules/storage/types/storage-item-data.type';
import { StorageItemEntity } from 'modules/storage/entities/storage-item.entity';
import { BucketStoragePathsEnum } from 'modules/storage/enums/bucket-storage-paths.enum';
import { StorageItemRepository } from 'modules/storage/repositories/storage-item.repository';
import { sanitize } from 'sanitize-filename-ts';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { GetStorageItemUrlOptionsType } from 'modules/storage/types/get-storage-item-url-options.type';
import { StorageItemUrlExpiryEnum } from 'modules/storage/enums/storage-item-url-expiry.enum';
import { join } from 'path';

@Injectable()
export class StorageService {
  /**
   * s3 instance is used to interact with Amazon Simple Storage Service (Amazon S3).
   * It provides methods to upload, download, and manage data in the S3 cloud storage.
   *
   * Methods such as `putObject`, `getObject`, and `listBuckets` can be used for various operations
   * on the S3 service, to store, retrieve, and organize data across the cloud infrastructure.
   *
   * The configuration, such as access keys and region, should be defined before utilizing the s3 instance.
   * This instance is crucial for any operations involving cloud data storage and retrieval using the AWS SDK in your application.
   */
  private s3: AWS.S3;

  /**
   * Maps expiration durations to different storage item URL expiry types.
   *
   * @type {Object}
   * @property {number} Short   - Expiry time in seconds for short-lived URLs (120 seconds).
   * @property {number} Medium  - Expiry time in seconds for medium-lived URLs (900 seconds).
   * @property {number} Long    - Expiry time in seconds for long-lived URLs (3600 seconds).
   * @property {number} Maximum - Expiry time in seconds for maximum-lived URLs (86400 seconds).
   */
  private expiryMappers = {
    [StorageItemUrlExpiryEnum.Short]: 120,
    [StorageItemUrlExpiryEnum.Medium]: 900,
    [StorageItemUrlExpiryEnum.Long]: 3600,
    [StorageItemUrlExpiryEnum.Maximum]: 3600 * 24,
  };

  /**
   * Constructs an instance of the class with dependencies and initializes AWS S3 SDK.
   *
   * @param {StorageItemRepository} storageItemRepository - Repository for managing storage items.
   * @param {CryptoUtilsService} cryptoUtilsService - Service for cryptographic utilities.
   * @param {ConfigService} configService - Service for accessing configuration settings.
   * @return {void} Does not return anything.
   */
  constructor(
    private readonly storageItemRepository: StorageItemRepository,
    private readonly cryptoUtilsService: CryptoUtilsService,
    private readonly configService: ConfigService,
  ) {
    this.s3 = new AWS.S3({
      credentials: {
        accessKeyId: configService.get<string>(ConfigEnvEnum.AWS_KEY_ID),
        secretAccessKey: configService.get<string>(ConfigEnvEnum.AWS_SECRET),
      },
      signatureVersion: 'v4',
      region: this.configService.get(ConfigEnvEnum.AWS_REGION_NAME),
    });
  }

  /**
   * Generates a signed URL for accessing a storage item.
   *
   * @param {StorageItemEntity|Pick<StorageItemEntity, 'storedFileName' | 'storagePath'>} [storageItem] - The storage item entity or a subset of it containing 'storedFileName' and 'storagePath'.
   * @param {GetStorageItemUrlOptionsType} [options={ expiryType: StorageItemUrlExpiryEnum.Maximum }] - Configuration options for URL expiration.
   * @return {Promise<string>} A promise that resolves to a signed URL for accessing the storage item.
   */
  async getStorageItemUrl(
    storageItem?:
      | StorageItemEntity
      | Pick<StorageItemEntity, 'storedFileName' | 'storagePath'>,
    options: GetStorageItemUrlOptionsType = {
      expiryType: StorageItemUrlExpiryEnum.Maximum,
    },
  ) {
    if (!storageItem) return;
    return await this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get(ConfigEnvEnum.AWS_BUCKET_NAME),
      Key: join(storageItem.storagePath, storageItem.storedFileName),
      Expires: this.expiryMappers[options.expiryType],
    });
  }

  /**
   * Removes the specified storage items from the database.
   *
   * @param {StorageItemEntity[]} storageItems - An array of StorageItemEntity instances to be removed from the database.
   * @return {Promise<void>} A promise that resolves when the removal operation is complete.
   */
  async removeFromDatabase(storageItems: StorageItemEntity[]) {
    await this.storageItemRepository.remove(storageItems);
  }

  /**
   * Deletes an object from AWS S3 Blob Storage.
   *
   * @param {string} objectKey - The key of the object to delete from S3.
   * @return {Promise<void>} - A promise that resolves when the object is deleted.
   */
  async removeFromBlobStorage(objectKey: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.configService.get<string>(ConfigEnvEnum.AWS_BUCKET_NAME),
        Key: objectKey,
      })
      .promise();
  }

  /**
   * Removes a given storage item from both the database and blob storage.
   *
   * @param {StorageItemEntity} storageItem - The storage item to be removed.
   * @return {Promise<void>} - A promise that resolves when the storage item is removed.
   */
  async remove(storageItem: StorageItemEntity) {
    await this.removeFromDatabase([storageItem]);
    await this.removeFromBlobStorage(this.toObjectKey(storageItem));
  }

  /**
   * Converts a storage item to an object key by combining the storage path and stored file name.
   *
   * @param {Object} storageItem - The storage item containing storage path and stored file name.
   * @param {BucketStoragePathsEnum} storageItem.storagePath - The storage path of the item.
   * @param {string} storageItem.storedFileName - The name of the stored file.
   * @return {string} The concatenated object key.
   */
  toObjectKey(storageItem: {
    storagePath: BucketStoragePathsEnum;
    storedFileName: string;
  }): string {
    return storageItem.storagePath + storageItem.storedFileName;
  }

  /**
   * Uploads a file to blob storage using AWS S3.
   *
   * @param {StorageItemDataType} params - The parameters needed to upload a file.
   * @param {string} params.fileName - The name of the file to upload.
   * @param {ReadableStream} params.fileStream - The file stream of the file to upload.
   * @param {string} params.storagePath - The storage path where the file will be uploaded.
   *
   * @return {Promise<void>} A promise that resolves once the file has been uploaded.
   * @throws {BadRequestException} Throws if there is an error during the upload process.
   */
  async uploadToBlobStorage(params: StorageItemDataType): Promise<void> {
    const { fileName, fileStream, storagePath } = params;
    const mimeType = this.getMimeType(fileName);
    try {
      await this.s3
        .upload({
          Bucket: this.configService.get<string>(ConfigEnvEnum.AWS_BUCKET_NAME),
          Key: this.toObjectKey({ storagePath, storedFileName: fileName }),
          Body: fileStream,
          ContentType: mimeType,
        })
        .promise();
    } catch (errors) {
      throw new BadRequestException(errors);
    }
  }

  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'svg':
        return 'image/svg+xml';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Creates a new storage item in the repository with a sanitized file name and optional size.
   *
   * @param {string} fileName - The original file name of the item to be stored.
   * @param {BucketStoragePathsEnum} storagePath - The storage path enum indicating where the item will be stored.
   * @param {number} [sizeInBytes] - The optional size of the file in bytes.
   * @return {StorageItemEntity} - The newly created storage item entity.
   */
  createStorageItem(
    fileName: string,
    storagePath: BucketStoragePathsEnum,
    sizeInBytes?: number,
  ): StorageItemEntity {
    return this.storageItemRepository.create({
      originalFileName: fileName,
      storedFileName: sanitize(
        `${this.cryptoUtilsService.generateUUID()}__${fileName}`,
      ),
      sizeInBytes,
      storagePath,
    });
  }

  /**
   * Uploads a file to blob storage and saves the storage item entity.
   *
   * @param {StorageItemDataType} params - The parameters required for uploading the file.
   * @param {string} params.fileName - The name of the file to upload.
   * @param {string} params.storagePath - The path in the storage where the file will be saved.
   * @param {number} params.sizeInBytes - The size of the file in bytes.
   * @returns {Promise<StorageItemEntity>} - A promise that resolves to the saved storage item entity.
   */
  async upload(params: StorageItemDataType): Promise<StorageItemEntity> {
    const { fileName, storagePath, sizeInBytes } = params;
    const storageItem = this.createStorageItem(
      fileName,
      storagePath,
      sizeInBytes,
    );

    await this.uploadToBlobStorage({
      ...params,
      fileName: storageItem.storedFileName,
    });

    return this.storageItemRepository.save(storageItem);
  }

  /**
   * Removes multiple storage items from S3 and optionally from the database.
   *
   * @param {StorageItemEntity[]} storageItems - The array of storage items to be removed.
   * @param {Object} options - Options for removal.
   * @param {boolean} [options.removeFromDB=false] - Whether to remove the items from the database.
   * @return {Promise<void>} A promise that resolves when the items are removed.
   */
  async removeMultiple(
    storageItems: StorageItemEntity[],
    { removeFromDB = false } = {},
  ): Promise<void> {
    await this.s3
      .deleteObjects({
        Bucket: this.configService.get<string>(ConfigEnvEnum.AWS_BUCKET_NAME),
        Delete: {
          Objects: storageItems.map((item) => ({
            Key: this.toObjectKey(item),
          })),
        },
      })
      .promise();

    if (removeFromDB) {
      await this.storageItemRepository.remove(storageItems);
    }
  }
}
