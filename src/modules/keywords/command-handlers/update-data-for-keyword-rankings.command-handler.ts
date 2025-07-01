import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDataForKeywordRankingsCommand } from 'modules/keywords/commands/update-data-for-keyword-rankings.command';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { RedisPublisherService } from 'modules/redis/services/redis-publisher.service';

@CommandHandler(UpdateDataForKeywordRankingsCommand)
export class UpdateDataForKeywordRankingsCommandHandler
  implements ICommandHandler<UpdateDataForKeywordRankingsCommand>
{
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly redisPublisherService: RedisPublisherService,
  ) {}
  /**
   * Executes the given command to update data for keyword rankings.
   *
   * @param {UpdateDataForKeywordRankingsCommand} command - The command containing keyword IDs to update.
   * @return {Promise<void>} A promise that resolves when the command execution is complete.
   */
  async execute(command: UpdateDataForKeywordRankingsCommand): Promise<void> {
    this.cliLoggingService.log(
      'Start: UpdateDataForKeywordRankingsCommandHandler',
    );
    try {
      const result = await this.keywordRepository.getUpToDateKeywordDataByIds(
        command.keywordIds,
      );
      await this.redisPublisherService.publish('handle-updated-position', {
        result,
      });
    } catch (e) {
      this.cliLoggingService.error(
        `Error: UpdateDataForKeywordRankingsCommandHandler (${JSON.stringify(
          command,
        )})`,
        e,
      );
    }
  }
}
