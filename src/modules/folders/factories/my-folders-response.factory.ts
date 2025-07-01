import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { GetMyFoldersType } from 'modules/folders/types/get-my-folders.type';
import { MyFoldersResponse } from 'modules/folders/responses/my-folders.response';
import { Injectable } from '@nestjs/common';
import { MyFolderResponse } from 'modules/folders/responses/my-folder.response';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { FolderRepository } from 'modules/folders/repositories/folder.repository';

@Injectable()
export class MyFoldersResponseFactory extends BaseResponseFactory<
  GetMyFoldersType[],
  MyFoldersResponse
> {
  constructor(private readonly folderRepository: FolderRepository) {
    super();
  }
  /**
   * Creates a response object that includes metadata and a list of folder response objects.
   *
   * @param {GetMyFoldersType[]} entity - The array of folder entities.
   * @param {Record<string, unknown>} [options] - Optional parameters for additional configurations.
   * @param {string} [options.userId] - The ID of the user requesting the folders.
   * @param {Object} [options.meta] - Metadata associated with the folders response.
   *
   * @return {Promise<MyFoldersResponse>} A promise that resolves to the folders response object.
   */
  async createResponse(
    entity: GetMyFoldersType[],
    options?: Record<string, unknown>,
  ): Promise<MyFoldersResponse> {
    return new MyFoldersResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          const keywordCount = item.keyword_count;
          const numberOfKeywordsInInternalFolders =
            await this.folderRepository.getNumberOfKeywordsInAllInternalFolders(
              item.id,
            );
          return new MyFolderResponse({
            ...item,
            createdBy:
              item.owner_id === options.userId ? 'me' : `${item.owner_name}`,
            createdAt: dateHelper(item.created_at),
            createdAtFullFormat: formatGoogleStyleDate(item.created_at),
            updatedAt: dateHelper(item.updated_at),
            updatedAtFullFormat: formatGoogleStyleDate(item.updated_at),
            keywordCount: keywordCount + numberOfKeywordsInInternalFolders,
          });
        }),
      ),
      meta: options.meta,
    });
  }
}
