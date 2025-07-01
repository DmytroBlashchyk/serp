import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue-for-google-local.command';
import { AppEventEnum } from 'modules/queue/enums/app-event.enum';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { InjectQueue } from '@nestjs/bull';
import { App } from 'modules/queue/enums/app.enum';
import { Queue } from 'bull';

@CommandHandler(UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommand)
export class UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommandHandler
  implements
    ICommandHandler<UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommand>
{
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly cliLoggingService: CliLoggingService,
    @InjectQueue(App.Keywords)
    private readonly keywordQueue: Queue,
  ) {}
  /**
   * Executes the update of keyword positions using the standard queue for Google Local.
   *
   * @param {UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommand} command - The command containing keyword IDs to update.
   * @return {Promise<void>} - A Promise that resolves when the update process has been completed.
   */
  async execute(
    command: UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommand,
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
      await this.dataForSeoService.updateKeywordsUsingStandardQueueForGoogleLocal(
        keywords,
      );
    } catch (errors) {
      this.cliLoggingService.error(
        `Error UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommandHandler (${JSON.stringify(
          command,
        )})`,
        errors,
      );
    }
  }
}
