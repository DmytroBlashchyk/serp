import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetCPCAndSearchVolumeCommand } from 'modules/keywords/commands/get-cPC-and-search-volume.command';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { In } from 'typeorm';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

@CommandHandler(GetCPCAndSearchVolumeCommand)
export class GetCPCAndSearchVolumeCommandHandler
  implements ICommandHandler<GetCPCAndSearchVolumeCommand>
{
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly projectRepository: ProjectRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the GetCPCAndSearchVolumeCommand to fetch and update the CPC, search volume,
   * and competition index for a set of keywords associated with a project.
   *
   * @param {GetCPCAndSearchVolumeCommand} command - The command containing project ID and keyword IDs.
   * @return {Promise<void>} A promise that resolves once the operation is complete.
   */
  async execute(command: GetCPCAndSearchVolumeCommand): Promise<void> {
    this.cliLoggingService.log('Start: GetCPCAndSearchVolumeCommandHandler');
    try {
      const project =
        await this.projectRepository.getProjectByIdWithKeywordsAndLanguageAndLocation(
          command.projectId,
        );

      const keywords = await this.keywordRepository.find({
        id: In(command.keywordIds),
      });
      let result;
      if (project.searchEngine.name === SearchEnginesEnum.Google) {
        if (!project.language.keywordData || !project.location.keywordData) {
          return;
        }
        result = await this.dataForSeoService.getDataForSeoResults(
          project.keywords.map((keyword) => keyword.name),
          project,
        );
      } else if (project.searchEngine.name === SearchEnginesEnum.Bing) {
        if (
          !project.language.keywordDataBing ||
          !project.location.keywordDataBing
        ) {
          return;
        }
        result = await this.dataForSeoService.getDataForSeoForBingAdsResult(
          keywords.map((keyword) => keyword.name),
          project,
        );
      }
      if (result && result.length > 0) {
        for (const keyword of keywords) {
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
          keywords.map((item) => {
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
        `Error: GetCPCAndSearchVolumeCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
