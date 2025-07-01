import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateKeywordDataWithDataForSeoCommand } from 'modules/keywords/commands/update-keyword-data-with-data-for-seo.command';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(UpdateKeywordDataWithDataForSeoCommand)
export class UpdateKeywordDataWithDataForSeoCommandHandler
  implements ICommandHandler<UpdateKeywordDataWithDataForSeoCommand>
{
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly projectRepository: ProjectRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}

  /**
   * Executes the given command to update keyword data with data from the DataForSeo service.
   *
   * @param {UpdateKeywordDataWithDataForSeoCommand} command - The command containing the project ID for which to update the keyword data.
   * @return {Promise<void>} - Returns a promise that resolves when the keyword data has been successfully updated.
   */
  async execute(
    command: UpdateKeywordDataWithDataForSeoCommand,
  ): Promise<void> {
    try {
      const project =
        await this.projectRepository.getProjectByIdWithKeywordsAndLanguageAndLocation(
          command.projectId,
        );

      const result = await this.dataForSeoService.getDataForSeoResults(
        project.keywords.map((keyword) => keyword.name),
        project,
      );
      if (result && result.length > 0) {
        for (const keyword of project.keywords) {
          const data = result.find((item) => item.keyword === keyword.name);
          if (data) {
            keyword.cpc = data.cpc ?? 0;
            keyword.searchVolume =
              data.monthly_searches && data.monthly_searches.length > 0
                ? data.monthly_searches[0].search_volume
                : 0;
            keyword.competitionIndex = data.competition_index ?? 0;
          }
        }
        await this.keywordRepository.save(
          project.keywords.map((item) => {
            return {
              id: item.id,
              cpc: item.cpc,
              searchVolume: item.searchVolume,
              competitionIndex: item.competitionIndex,
            };
          }),
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        `Error: UpdateKeywordDataWithDataForSeoCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
