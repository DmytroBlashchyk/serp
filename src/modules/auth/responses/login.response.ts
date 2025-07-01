import { RefreshTokenResponse } from 'modules/auth/responses/refresh-token.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { CurrentUserResponse } from 'modules/users/responses/current-user.response';

export class LoginResponse extends RefreshTokenResponse {
  @ResponseProperty({ cls: CurrentUserResponse })
  user: CurrentUserResponse;
}
