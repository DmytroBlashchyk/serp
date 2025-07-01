import { Injectable } from '@nestjs/common';
import { AccountUserRepository } from 'modules/accounts/repositories/account-user.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';

@Injectable()
export class AccountUsersService {
  constructor(private readonly accountUserRepository: AccountUserRepository) {}

  /**
   * Retrieves the account user associated with the given account ID and user ID.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {IdType} userId - The unique identifier for the user.
   * @return {Promise<AccountUserEntity>} - A Promise that resolves to the account user entity object.
   */
  async getAccountUser(
    accountId: IdType,
    userId: IdType,
  ): Promise<AccountUserEntity> {
    return await this.accountUserRepository.getAccountUser(accountId, userId);
  }
}
