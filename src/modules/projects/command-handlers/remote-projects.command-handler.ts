import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoteProjectsCommand } from 'modules/projects/commands/remote-projects.command';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(RemoteProjectsCommand)
export class RemoteProjectsCommandHandler
  implements ICommandHandler<RemoteProjectsCommand>
{
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly projectRepository: ProjectRepository,
    private readonly projectsService: ProjectsService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}

  /**
   * Executes the given remote projects command.
   *
   * @param {RemoteProjectsCommand} command - The command containing project IDs and account ID to be processed.
   * @return {Promise<void>} A promise that resolves when the execution is complete.
   */
  async execute(command: RemoteProjectsCommand): Promise<void> {
    try {
      for (const projectId of command.projectIds) {
        const keywordIds = await this.projectRepository.getKeywordIdsForProject(
          projectId,
        );
        if (keywordIds.length === 0) {
          const project = await this.projectRepository.getProjectById(
            projectId,
          );
          await this.projectsService.bulkDelete({
            accountId: project.account.id,
            projectIds: [project.id],
          });
          await this.projectRepository.getNumberOfAccountProjects(
            command.accountId,
          );
          await this.gatewayService.handleRemoteProjects(command.accountId, [
            project.id,
          ]);
          const numberOfAccountProjects =
            await this.projectRepository.getNumberOfAccountProjects(
              command.accountId,
            );
          await this.gatewayService.handleNumberOfAccountProjects(
            command.accountId,
            numberOfAccountProjects,
          );
        }
      }
    } catch (error) {
      this.cliLoggingService.error(
        `Error: RemoteProjectsCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
