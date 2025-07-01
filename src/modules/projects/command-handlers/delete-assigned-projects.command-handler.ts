import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteAssignedProjectsCommand } from 'modules/projects/commands/delete-assigned-projects.command';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(DeleteAssignedProjectsCommand)
export class DeleteAssignedProjectsCommandHandler
  implements ICommandHandler<DeleteAssignedProjectsCommand>
{
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the DeleteAssignedProjectsCommand by deleting all assigned projects
   * and any orphaned invitations.
   *
   * @param {DeleteAssignedProjectsCommand} command - The command containing the project IDs to delete.
   * @return {Promise<void>} A promise that resolves when the execution is complete.
   */
  async execute(command: DeleteAssignedProjectsCommand): Promise<void> {
    this.cliLoggingService.log('Start: DeleteAssignedProjectsCommandHandler');
    try {
      await this.projectRepository.deleteAllAssignedProjects(
        command.projectIds,
      );
      await this.invitationRepository.deleteInvitationsWithoutProjectsAndFolders();
    } catch (error) {
      this.cliLoggingService.error(
        `Error: DeleteAssignedProjectsCommandHandler ${JSON.stringify(
          command,
        )}`,
        error,
      );
    }
  }
}
