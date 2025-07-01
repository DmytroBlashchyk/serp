import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssigningAChildFolderToParentFolderManagerCommand } from 'modules/invitations/commands/assigning-a-child-folder-to-parent-folder-manager.command';
import { FolderRepository } from 'modules/folders/repositories/folder.repository';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(AssigningAChildFolderToParentFolderManagerCommand)
export class AssigningAChildFolderToParentFolderManagerCommandHandler
  implements ICommandHandler<AssigningAChildFolderToParentFolderManagerCommand>
{
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: UserRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the AssigningAChildFolderToParentFolderManagerCommand.
   *
   * @param {AssigningAChildFolderToParentFolderManagerCommand} command - The command object containing the folderId and accountId.
   * @return {Promise<void>} A promise that resolves when the command has been executed.
   */
  async execute(
    command: AssigningAChildFolderToParentFolderManagerCommand,
  ): Promise<void> {
    this.cliLoggingService.log(
      'Start: AssigningAChildFolderToParentFolderManagerCommandHandler',
    );
    try {
      const folders = await this.folderRepository.folderTreeByIds(
        [command.folderId],
        command.accountId,
      );
      const invitations =
        await this.invitationRepository.getInvitationsAssignedToFolder(
          command.folderId,
        );
      const users = await this.invitationRepository.getUsersWhoManageFolder(
        command.folderId,
      );

      for (const folder of folders) {
        for (const invitation of invitations) {
          await this.invitationRepository.addFoldersToAnInvitedUser(
            invitation.id,
            [folder.id],
          );
        }
        for (const user of users) {
          await this.userRepository.addFoldersToAnInvitedUser(user.id, [
            folder.id,
          ]);
        }
      }
    } catch (errors) {
      this.cliLoggingService.error(
        `Error: AssigningAChildFolderToParentFolderManagerCommandHandler (${JSON.stringify(
          command,
        )})`,
        errors,
      );
    }
  }
}
