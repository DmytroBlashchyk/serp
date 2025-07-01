import { Injectable } from '@nestjs/common';
import { UsersInvitationsType } from 'modules/accounts/types/users-invitations.type';
import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { PaginatedUsersAccountResponse } from 'modules/users/responses/paginated-users-account.response';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { UserAccountResponse } from 'modules/users/responses/user-account.response';

@Injectable()
export class UsersInvitationsAccountFactory extends BaseResponseFactory<
  UsersInvitationsType[],
  PaginatedUsersAccountResponse
> {
  /**
   * Creates a PaginatedUsersAccountResponse from an array of UsersInvitationsType.
   *
   * @param {UsersInvitationsType[]} entity - The array of user invitation entities to transform.
   * @param {Record<string, unknown>} [options] - Optional parameters for additional response metadata.
   * @return {Promise<PaginatedUsersAccountResponse>} A promise that resolves to the paginated users account response.
   */
  async createResponse(
    entity: UsersInvitationsType[],
    options?: Record<string, unknown>,
  ): Promise<PaginatedUsersAccountResponse> {
    return new PaginatedUsersAccountResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          return new UserAccountResponse({
            id: item.id,
            name: item.username || '-',
            email: item.registered ? item.email : `${item.email} (Pending)`,
            role: { id: item.role_id, name: item.role_name },
            dateAdded: item.created_at ? dateHelper(item.created_at) : '-',
            dateAddedFullFormat: item.created_at
              ? formatGoogleStyleDate(item.created_at)
              : '-',
            lastActivity: item.updated_at ? dateHelper(item.updated_at) : '-',
            lastActivityFullFormat: item.updated_at
              ? formatGoogleStyleDate(item.updated_at)
              : '-',
            registered: !!item.registered,
          });
        }),
      ),

      meta: options.meta,
    });
  }
}
