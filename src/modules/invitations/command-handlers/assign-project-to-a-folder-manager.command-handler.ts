import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignProjectToAFolderManagerCommand } from 'modules/invitations/commands/assign-project-to-a-folder-manager.command';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(AssignProjectToAFolderManagerCommand)
export class AssignProjectToAFolderManagerCommandHandler
  implements ICommandHandler<AssignProjectToAFolderManagerCommand>
{
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: UserRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the AssignProjectToAFolderManagerCommand, assigning the specified project
   * to all users and invitations associated with the specified folder.
   *
   * @param {AssignProjectToAFolderManagerCommand} command - The command containing
   * the folder ID and project ID to be assigned.
   * @return {Promise<void>} A promise that resolves when the execution is complete.
   */
  async execute(command: AssignProjectToAFolderManagerCommand): Promise<void> {
    this.cliLoggingService.log(
      'Start: AssignProjectToAFolderManagerCommandHandler',
    );
    try {
      const userIds = await this.invitationRepository.getUsersWhoManageFolder(
        command.folderId,
      );
      for (const item of userIds) {
        await this.userRepository.addProjectsToAnInvitedUser(item.id, [
          command.projectId,
        ]);
      }

      const invitationIds =
        await this.invitationRepository.getInvitationsAssignedToFolder(
          command.folderId,
        );
      for (const item of invitationIds) {
        await this.invitationRepository.addProjectsToAnInvitedUser(item.id, [
          command.projectId,
        ]);
      }
    } catch (errors) {
      this.cliLoggingService.error(
        `Error: AssignProjectToAFolderManagerCommandHandler (${JSON.stringify(
          command,
        )})`,
        errors,
      );
    }
  }
}
