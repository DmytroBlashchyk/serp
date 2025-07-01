import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class RefreshTokenResponse extends BaseResponse {
  @ResponseProperty()
  accessToken: string;

  @ResponseProperty()
  refreshToken: string;

  @ResponseProperty()
  refreshTokenExpiresAt: Date;

  @ResponseProperty()
  accessTokenExpiresAt: Date;
}
