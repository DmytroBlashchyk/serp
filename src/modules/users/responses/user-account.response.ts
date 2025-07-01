import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { RoleResponse } from 'modules/auth/responses/role.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { AccessResponse } from 'modules/users/responses/access.response';

export class UserAccountResponse extends BaseResponse<UserAccountResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty()
  email: string;

  @ResponseProperty({ cls: RoleResponse })
  role: RoleResponse;

  @ResponseProperty({ nullable: true, cls: AccessResponse })
  access: AccessResponse;

  @ResponseProperty()
  dateAdded: string;

  @ResponseProperty()
  dateAddedFullFormat: string;

  @ResponseProperty({ nullable: true })
  lastActivity: string;

  @ResponseProperty({ nullable: true })
  lastActivityFullFormat: string;

  @ResponseProperty({ nullable: true })
  registered: boolean;
}
