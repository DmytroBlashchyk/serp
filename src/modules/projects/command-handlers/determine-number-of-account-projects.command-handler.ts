import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DetermineNumberOfAccountProjectsCommand } from 'modules/projects/commands/determine-number-of-account-projects.command';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(DetermineNumberOfAccountProjectsCommand)
export class DetermineNumberOfAccountProjectsCommandHandler
  implements ICommandHandler<DetermineNumberOfAccountProjectsCommand>
{
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly gatewayService: GatewayService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the DetermineNumberOfAccountProjectsCommand.
   *
   * @param {DetermineNumberOfAccountProjectsCommand} command - The command containing the account ID.
   * @return {Promise<void>} - A promise that resolves when the command has been processed.
   */
  async execute(
    command: DetermineNumberOfAccountProjectsCommand,
  ): Promise<void> {
    try {
      const numberOfAccountProjects =
        await this.projectRepository.getNumberOfAccountProjects(
          command.accountId,
        );
      await this.gatewayService.handleNumberOfAccountProjects(
        command.accountId,
        numberOfAccountProjects,
      );
    } catch (error) {
      this.cliLoggingService.error(
        `Error: DetermineNumberOfAccountProjectsCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
