import { BadRequestException, Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { hash, verify } from 'argon2';

import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import crypto from 'crypto';
import { UserEntity } from 'modules/users/entities/user.entity';

@Injectable()
export class CryptoUtilsService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Generates a universally unique identifier (UUID).
   *
   * @return {string} A randomly generated UUID.
   */
  generateUUID(): string {
    return nanoid();
  }

  /**
   * Generates a hash for the given password string.
   *
   * @param {string} source - The plain text password to be hashed.
   * @return {Promise<string>} A promise that resolves to the hashed password.
   */
  generatePasswordHash(source: string): Promise<string> {
    return hash(source);
  }

  /**
   * Verifies if the given source password matches the provided hash.
   *
   * @param {string} source - The plaintext password to verify.
   * @param {string} hash - The hashed password to compare against.
   * @return {Promise<boolean>} A promise that resolves to a boolean indicating whether the password matches the hash.
   * @throws {BadRequestException} If the hash is not provided or is empty.
   */
  verifyPasswordHash(source: string, hash: string): Promise<boolean> {
    if (!hash) {
      throw new BadRequestException('User account not confirmed');
    }
    return verify(hash, source);
  }

  /**
   * Encrypts the provided data using the RC4 algorithm and a secret key.
   *
   * @param {string} data - The data to be encrypted.
   * @return {string} The encrypted data with slashes replaced by underscores.
   */
  encryptData(data: string): string {
    const encrypted = CryptoJS.RC4.encrypt(
      data,
      this.configService.get(ConfigEnvEnum.CRYPTO_JS_SECRET_KEY),
    ).toString();
    return encrypted.replace(/\//g, '_');
  }

  /**
   * Decrypts the provided encrypted data string using the configured RC4 secret key.
   *
   * @param {string} encryptedData - The string of data that needs to be decrypted. This string should be encoded in a form where `_` characters replace `/` characters.
   * @return {string} - The decrypted data string in UTF-8 format.
   */
  decryptData(encryptedData: string): string {
    const processedEncryptedData = encryptedData.replace(/_/g, '/');
    const bytes = CryptoJS.RC4.decrypt(
      processedEncryptedData,
      this.configService.get(ConfigEnvEnum.CRYPTO_JS_SECRET_KEY),
    );
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Generates a Help Scout signature for the specified user.
   *
   * @param {UserEntity} user - The user entity containing user details.
   * @return {Promise<string>} A promise that resolves to a hexadecimal string representing the Help Scout signature.
   */
  async getHelpScoutSignature(user: UserEntity): Promise<string> {
    return crypto
      .createHmac(
        'sha256',
        this.configService.get(ConfigEnvEnum.HELP_SCOUT_SECRET_KEY),
      )
      .update(user.email)
      .digest('hex');
  }
}
