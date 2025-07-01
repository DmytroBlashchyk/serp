import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class SharedAccessTokenResponse extends BaseResponse<SharedAccessTokenResponse> {
  @ResponseProperty()
  accessToken: string;

  @ResponseProperty()
  accessTokenExpiresAt: Date;
}
