import { BaseResponse } from 'modules/common/responses/base.response';
import { AccountLimitsUsedResponse } from 'modules/accounts/responses/account-limits-used.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { DefaultAccountLimitsResponse } from 'modules/accounts/responses/default-account-limits.response';
import { BalanceAccountLimitsResponse } from 'modules/accounts/responses/balance-account-limits.response';

export class CurrentAccountLimitResponse extends BaseResponse<CurrentAccountLimitResponse> {
  @ResponseProperty({ cls: AccountLimitsUsedResponse })
  accountLimitsUsed: AccountLimitsUsedResponse;

  @ResponseProperty({ cls: DefaultAccountLimitsResponse })
  defaultAccountLimits: DefaultAccountLimitsResponse;

  @ResponseProperty({ cls: BalanceAccountLimitsResponse })
  balanceAccountLimits: BalanceAccountLimitsResponse;
}
