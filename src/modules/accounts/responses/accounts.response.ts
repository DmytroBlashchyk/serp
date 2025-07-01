import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { AccountResponse } from 'modules/accounts/responses/account.response';

export class AccountsResponse extends WithArrayResponse(AccountResponse) {}
