import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand } from 'modules/projects/commands/update-data-from-data-for-seo-for-all-keywords-of-project.command';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

@CommandHandler(UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand)
export class UpdateDataFromDataForSeoForAllKeywordsOfProjectCommandHandler
  implements
    ICommandHandler<UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand>
{
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand.
   *
   * @param {UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand} command - The command containing the project details.
   * @returns {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async execute(
    command: UpdateDataFromDataForSeoForAllKeywordsOfProjectCommand,
  ): Promise<void> {
    try {
      const project =
        await this.projectRepository.getProjectByIdWithKeywordsAndLanguageAndLocation(
          command.projectId,
        );
      let data = [];
      if (project.searchEngine.name === SearchEnginesEnum.Google) {
        for (const keyword of project.keywords) {
          if (keyword.name.length >= 1) {
            data.push(keyword.name);
          }

          if (data.length === 100) {
            await this.dataForSeoService.createTask(
              data,
              project.language.name,
              project.location.locationCode,
              project.id,
            );
            data = [];
          }
        }
        if (data.length > 0) {
          await this.dataForSeoService.createTask(
            data,
            project.language.name,
            project.location.locationCode,
            project.id,
          );
        }
      } else if (project.searchEngine.name === SearchEnginesEnum.Bing) {
        for (const keyword of project.keywords) {
          if (keyword.name.length >= 1) {
            data.push(keyword.name);
          }

          if (data.length === 100) {
            await this.dataForSeoService.createTaskForBing(
              data,
              project.language.name,
              project.location.locationCode,
              project.id,
            );
            data = [];
          }
        }
        if (data.length > 0) {
          await this.dataForSeoService.createTaskForBing(
            data,
            project.language.name,
            project.location.locationCode,
            project.id,
          );
        }
      }
    } catch (error) {
      this.cliLoggingService.error(
        `Error: UpdateDataFromDataForSeoForAllKeywordsOfProjectCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
