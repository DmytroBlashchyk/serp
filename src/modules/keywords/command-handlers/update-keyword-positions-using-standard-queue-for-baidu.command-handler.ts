import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { InjectQueue } from '@nestjs/bull';
import { App } from 'modules/queue/enums/app.enum';
import { Queue } from 'bull';
import { UpdateKeywordPositionsUsingStandardQueueForBaiduCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-baidu.command';
import { AppEventEnum } from 'modules/queue/enums/app-event.enum';

@CommandHandler(UpdateKeywordPositionsUsingStandardQueueForBaiduCommand)
export class UpdateKeywordPositionsUsingStandardQueueForBaiduCommandHandler
  implements
    ICommandHandler<UpdateKeywordPositionsUsingStandardQueueForBaiduCommand>
{
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly cliLoggingService: CliLoggingService,
    @InjectQueue(App.Keywords)
    private readonly keywordQueue: Queue,
  ) {}

  /**
   * Executes the given command to update keyword positions using the standard queue for Baidu.
   *
   * @param {UpdateKeywordPositionsUsingStandardQueueForBaiduCommand} command - The command containing the keyword IDs to update.
   * @return {Promise<void>} A promise that resolves when the update process is complete.
   */
  async execute(
    command: UpdateKeywordPositionsUsingStandardQueueForBaiduCommand,
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
      await this.dataForSeoService.updateKeywordsUsingStandardQueueForBaidu(
        keywords,
      );
    } catch (errors) {
      this.cliLoggingService.error(
        `Error UpdateKeywordPositionsUsingStandardQueueForBaiduCommandHandler (${JSON.stringify(
          command,
        )})`,
        errors,
      );
    }
  }
}
