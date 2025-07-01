import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class AccountOptionsResponse extends BaseResponse<AccountOptionsResponse> {
  @ResponseProperty()
  emailReports: boolean;

  @ResponseProperty()
  sharedLinks: boolean;

  @ResponseProperty()
  validatedBySerpnest: boolean;
}
