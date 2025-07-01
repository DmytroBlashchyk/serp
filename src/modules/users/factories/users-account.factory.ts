import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { PaginatedUsersAccountResponse } from 'modules/users/responses/paginated-users-account.response';
import { Injectable } from '@nestjs/common';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';

@Injectable()
export class UsersAccountFactory extends BaseResponseFactory<
  AccountUserEntity[],
  PaginatedUsersAccountResponse
> {
  /**
   * Creates a response object containing a paginated list of user accounts.
   *
   * @param {AccountUserEntity[]} entity - An array of account user entities.
   * @param {Record<string, unknown>} [options] - An optional object containing additional options.
   * @return {Promise<PaginatedUsersAccountResponse> | PaginatedUsersAccountResponse} A paginated response object with user account details.
   */
  createResponse(
    entity: AccountUserEntity[],
    options?: Record<string, unknown>,
  ): Promise<PaginatedUsersAccountResponse> | PaginatedUsersAccountResponse {
    return new PaginatedUsersAccountResponse({
      items: entity.map((item) => {
        return {
          id: item.user.id,
          name: item.user.username,
          email: item.user.email,
          role: item.role,
          dateAdded: dateHelper(item.createdAt),
          dateAddedFullFormat: formatGoogleStyleDate(item.createdAt),
          lastActivity: dateHelper(item.updatedAt),
          lastActivityFullFormat: formatGoogleStyleDate(item.updatedAt),
        };
      }),
      meta: options.meta,
    });
  }
}
