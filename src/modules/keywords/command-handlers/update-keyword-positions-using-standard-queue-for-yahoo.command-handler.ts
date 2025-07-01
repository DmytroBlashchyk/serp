import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateKeywordPositionsUsingStandardQueueForBingCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-bing.command';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { InjectQueue } from '@nestjs/bull';
import { App } from 'modules/queue/enums/app.enum';
import { Queue } from 'bull';
import { UpdateKeywordPositionsUsingStandardQueueForYahooCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-yahoo.command';
import { AppEventEnum } from 'modules/queue/enums/app-event.enum';

@CommandHandler(UpdateKeywordPositionsUsingStandardQueueForYahooCommand)
export class UpdateKeywordPositionsUsingStandardQueueForYahooCommandHandler
  implements
    ICommandHandler<UpdateKeywordPositionsUsingStandardQueueForYahooCommand>
{
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly cliLoggingService: CliLoggingService,
    @InjectQueue(App.Keywords)
    private readonly keywordQueue: Queue,
  ) {}

  /**
   * Updates keyword positions using the standard queue for Bing.
   *
   * @param {UpdateKeywordPositionsUsingStandardQueueForBingCommand} command - The command containing the keyword IDs to update.
   * @return {Promise<void>} - A promise that resolves when the update process is complete.
   * @throws {Error} - Throws an error if the keyword update process fails.
   */
  async execute(
    command: UpdateKeywordPositionsUsingStandardQueueForBingCommand,
  ): Promise<void> {
    try {
      await this.keywordRepository.startUpdating(command.keywordIds);
      await this.keywordQueue.add(AppEventEnum.StartOfKeywordUpdate, {
        keywordIds: command.keywordIds,
      });
      const keywords =
        await this.keywordRepository.getKeywordsForPlannedPositionUpdates(
          command.keywordIds,
        );
      await this.dataForSeoService.updateKeywordsUsingStandardQueueForYahoo(
        keywords,
      );
    } catch (errors) {
      this.cliLoggingService.error(
        `Error UpdateKeywordPositionsUsingStandardQueueForYahooCommandHandler (${JSON.stringify(
          command,
        )})`,
        errors,
      );
    }
  }
}
