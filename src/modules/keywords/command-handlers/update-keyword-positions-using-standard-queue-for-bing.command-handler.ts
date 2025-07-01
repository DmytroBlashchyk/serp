import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { InjectQueue } from '@nestjs/bull';
import { App } from 'modules/queue/enums/app.enum';
import { Queue } from 'bull';
import { UpdateKeywordPositionsUsingStandardQueueForBingCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-bing.command';
import { AppEventEnum } from 'modules/queue/enums/app-event.enum';

@CommandHandler(UpdateKeywordPositionsUsingStandardQueueForBingCommand)
export class UpdateKeywordPositionsUsingStandardQueueForBingCommandHandler
  implements
    ICommandHandler<UpdateKeywordPositionsUsingStandardQueueForBingCommand>
{
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly cliLoggingService: CliLoggingService,
    @InjectQueue(App.Keywords)
    private readonly keywordQueue: Queue,
  ) {}
  /**
   * Executes the command to update keyword positions using the standard queue for Bing.
   *
   * @param {UpdateKeywordPositionsUsingStandardQueueForBingCommand} command - The command containing keyword IDs to be updated.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
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
      await this.dataForSeoService.updateKeywordsUsingStandardQueueForBing(
        keywords,
      );
    } catch (errors) {
      this.cliLoggingService.error(
        `Error UpdateKeywordPositionsUsingStandardQueueForBingCommandHandler (${JSON.stringify(
          command,
        )})`,
        errors,
      );
    }
  }
}
