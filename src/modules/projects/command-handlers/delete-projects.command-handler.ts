import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteProjectsCommand } from 'modules/projects/commands/delete-projects.command';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(DeleteProjectsCommand)
export class DeleteProjectsCommandHandler
  implements ICommandHandler<DeleteProjectsCommand>
{
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the delete projects command by invoking the bulk delete method from the projects service.
   *
   * @param {DeleteProjectsCommand} command - The command object containing account ID and project IDs to be deleted.
   * @return {Promise<void>} A promise that resolves when the deletion process is complete.
   */
  async execute(command: DeleteProjectsCommand): Promise<void> {
    try {
      await this.projectsService.bulkDelete({
        accountId: command.accountId,
        projectIds: command.projectIds,
      });
    } catch (errors) {
      this.cliLoggingService.error(
        `Error: DeleteProjectsCommandHandler (${JSON.stringify(command)})`,
        errors,
      );
    }
  }
}
