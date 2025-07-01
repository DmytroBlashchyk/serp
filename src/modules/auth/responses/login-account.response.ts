import { LoginResponse } from 'modules/auth/responses/login.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { AccountResponse } from 'modules/accounts/responses/account.response';

export class LoginAccountResponse extends LoginResponse {
  @ResponseProperty({ cls: AccountResponse })
  currentAccount: AccountResponse;

  @ResponseProperty({ cls: AccountResponse, each: true })
  availableAccounts: AccountResponse[];
}
