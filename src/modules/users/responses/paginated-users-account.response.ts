import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { UserAccountResponse } from 'modules/users/responses/user-account.response';

export class PaginatedUsersAccountResponse extends WithPaginatedResponse(
  UserAccountResponse,
) {}
