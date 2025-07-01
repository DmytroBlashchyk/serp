import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class AccountUsageResponse extends BaseResponse<AccountUsageResponse> {
  @ResponseProperty()
  dailyLimit: number;

  @ResponseProperty()
  dailyRefreshUsed: number;

  @ResponseProperty()
  monthlyKeywordLimit: number;

  @ResponseProperty()
  keywordsUsed: number;
}
