import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { InvitedUserResponse } from 'modules/invitations/responses/invited-user.response';
import { Injectable } from '@nestjs/common';
import { RoleResponse } from 'modules/auth/responses/role.response';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { ProjectInvitationResponse } from 'modules/invitations/responses/project-invitation.response';
import { SystemFolderNamesEnum } from 'modules/folders/enums/system-folder-names.enum';

@Injectable()
export class InvitedUserResponseFactory extends BaseResponseFactory<
  AccountUserEntity,
  InvitedUserResponse
> {
  /**
   * Creates a response object for an invited user based on the provided AccountUserEntity.
   *
   * @param {AccountUserEntity} entity - The entity representing the account user.
   * @return {Promise<InvitedUserResponse> | InvitedUserResponse} The response object containing user details, role, projects, and folders.
   */
  createResponse(
    entity: AccountUserEntity,
  ): Promise<InvitedUserResponse> | InvitedUserResponse {
    return new InvitedUserResponse({
      id: entity.user.id,
      role: new RoleResponse({ id: entity.role.id, name: entity.role.name }),
      projects: entity.user.projects.map(
        (project) => new ProjectInvitationResponse({ ...project }),
      ),
      folders: entity.user.folders.filter(
        (folder) =>
          ![
            SystemFolderNamesEnum.MyFolders.toString(),
            SystemFolderNamesEnum.UncategorizedProjects.toString(),
          ].includes(folder.name),
      ),
    });
  }
}
