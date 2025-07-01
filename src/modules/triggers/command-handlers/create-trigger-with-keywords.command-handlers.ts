import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTriggerWithKeywordsCommand } from 'modules/triggers/commands/create-trigger-with-keywords.command';
import { TriggerKeywordRepository } from 'modules/triggers/repositories/trigger-keyword.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(CreateTriggerWithKeywordsCommand)
export class CreateTriggerWithKeywordsCommandHandlers
  implements ICommandHandler<CreateTriggerWithKeywordsCommand>
{
  constructor(
    private readonly triggerKeywordRepository: TriggerKeywordRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the CreateTriggerWithKeywordsCommand by saving the provided keywords and trigger association.
   *
   * @param {CreateTriggerWithKeywordsCommand} command - The command containing the necessary data to create trigger and keyword associations.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async execute(command: CreateTriggerWithKeywordsCommand): Promise<void> {
    try {
      await this.triggerKeywordRepository.save(
        command.keywordIds.map((id) => {
          return {
            trigger: { id: Number(command.triggerId) },
            keyword: { id: id },
          };
        }),
      );
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateTriggerWithKeywordsCommandHandlers (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
