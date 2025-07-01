import { BaseResponse } from 'modules/common/responses/base.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { IdType } from 'modules/common/types/id-type.type';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { RoleResponse } from 'modules/auth/responses/role.response';
import { ProjectInvitationResponse } from 'modules/invitations/responses/project-invitation.response';
import { FolderInvitationResponse } from 'modules/invitations/responses/folder-invitation.response';

export class InvitedUserResponse extends BaseResponse<InvitedUserResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty({ cls: RoleResponse })
  role: RoleResponse;

  @ResponseProperty({
    cls: ProjectInvitationResponse,
    nullable: true,
    each: true,
  })
  projects: ProjectInvitationResponse[];

  @ResponseProperty({
    cls: FolderInvitationResponse,
    nullable: true,
    each: true,
  })
  folders: FolderInvitationResponse[];
}
