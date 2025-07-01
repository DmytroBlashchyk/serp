import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateKeywordPositionsUsingStandardQueueCommand } from 'modules/keywords/commands/update-keyword-positions-using-standard-queue.command';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { App } from 'modules/queue/enums/app.enum';
import { AppEventEnum } from 'modules/queue/enums/app-event.enum';
import { CreateTriggerInitializationEvent } from 'modules/triggers/events/create-trigger-initialization.event';

@CommandHandler(UpdateKeywordPositionsUsingStandardQueueCommand)
export class UpdateKeywordPositionsUsingStandardQueueCommandHandler
  implements ICommandHandler<UpdateKeywordPositionsUsingStandardQueueCommand>
{
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly cliLoggingService: CliLoggingService,
    @InjectQueue(App.Keywords)
    private readonly keywordQueue: Queue,
  ) {}
  /**
   * Executes the given `UpdateKeywordPositionsUsingStandardQueueCommand` to update keyword positions.
   *
   * @param {UpdateKeywordPositionsUsingStandardQueueCommand} command - The command containing keyword IDs to update.
   * @return {Promise<void>} A promise that resolves when the execution is complete.
   */
  async execute(
    command: UpdateKeywordPositionsUsingStandardQueueCommand,
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
      await this.dataForSeoService.updateKeywordsUsingStandardQueue(keywords);
    } catch (errors) {
      this.cliLoggingService.error(
        `Error UpdateKeywordPositionsUsingStandardQueueCommandHandler (${JSON.stringify(
          command,
        )})`,
        errors,
      );
    }
  }
}
