import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { InvitationEntity } from 'modules/invitations/entities/invitation.entity';
import { InvitationResponse } from 'modules/invitations/responses/invitation.response';
import { Injectable } from '@nestjs/common';
import { RoleResponse } from 'modules/auth/responses/role.response';
import { ProjectInvitationResponse } from 'modules/invitations/responses/project-invitation.response';
import { FolderInvitationResponse } from 'modules/invitations/responses/folder-invitation.response';
import { SystemFolderNamesEnum } from 'modules/folders/enums/system-folder-names.enum';

@Injectable()
export class InvitationResponseFactory extends BaseResponseFactory<
  InvitationEntity,
  InvitationResponse
> {
  /**
   * Creates an InvitationResponse object from the given InvitationEntity.
   *
   * @param {InvitationEntity} entity - The invitation entity containing the details
   * from which the response will be created.
   * @return {Promise<InvitationResponse> | InvitationResponse} - Returns an InvitationResponse
   * object or a Promise that resolves to an InvitationResponse object.
   */
  createResponse(
    entity: InvitationEntity,
  ): Promise<InvitationResponse> | InvitationResponse {
    const folders = [];
    for (const folder of entity.foldersInvitations) {
      if (folder.name !== SystemFolderNamesEnum.MyFolders) {
        folders.push(new FolderInvitationResponse({ ...folder }));
      }
    }
    return new InvitationResponse({
      ...entity,
      role: new RoleResponse({ ...entity.role }),
      projects: entity.projectsInvitations.map((item) => {
        return new ProjectInvitationResponse({ ...item });
      }),
      folders,
    });
  }
}
