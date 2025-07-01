import { BaseResponse } from 'modules/common/responses/base.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { RoleResponse } from 'modules/auth/responses/role.response';
import { TimezoneResponse } from 'modules/timezones/responses/timezone.response';
import { UserStatusResponse } from 'modules/users/responses/user-status.response';

export class UserResponse extends BaseResponse<UserResponse> {
  @IdProperty()
  id: number;

  @ResponseProperty()
  createdAt: Date;

  @ResponseProperty()
  updatedAt: Date;

  @ResponseProperty({ nullable: true })
  username?: string;

  @ResponseProperty()
  email: string;

  @ResponseProperty({ each: true, cls: RoleResponse })
  roles: RoleResponse[];

  @ResponseProperty()
  timezone: TimezoneResponse;
  @ResponseProperty({ nullable: true, cls: UserStatusResponse })
  status?: UserStatusResponse;

  @ResponseProperty()
  passwordExists: boolean;

  @ResponseProperty()
  helpScoutSignature: string;
}
