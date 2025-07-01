import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { RoleResponse } from 'modules/auth/responses/role.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { InvitedResponse } from 'modules/invitations/responses/invited.response';
import { OwnerResponse } from 'modules/accounts/responses/owner.response';

export class AccountResponse extends BaseResponse<AccountResponse> {
  @IdProperty()
  accountId: IdType;

  @ResponseProperty()
  byDefault: boolean;

  @ResponseProperty({ cls: RoleResponse })
  role: RoleResponse;

  @ResponseProperty({ cls: InvitedResponse })
  invited: InvitedResponse;

  @ResponseProperty({ cls: OwnerResponse })
  owner: OwnerResponse;

  @ResponseProperty()
  isMyAccount: boolean;
}
