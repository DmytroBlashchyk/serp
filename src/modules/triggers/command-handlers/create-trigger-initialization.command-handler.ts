import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTriggerInitializationCommand } from 'modules/triggers/commands/create-trigger-initialization.command';
import { TriggerKeywordRepository } from 'modules/triggers/repositories/trigger-keyword.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(CreateTriggerInitializationCommand)
export class CreateTriggerInitializationCommandHandler
  implements ICommandHandler<CreateTriggerInitializationCommand>
{
  constructor(
    private readonly triggerKeywordRepository: TriggerKeywordRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the command to initialize trigger keywords.
   *
   * @param {CreateTriggerInitializationCommand} command - The command containing the keyword IDs to initialize.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async execute(command: CreateTriggerInitializationCommand): Promise<void> {
    try {
      await this.triggerKeywordRepository.changeTriggerInitialization(
        command.keywordIds,
        true,
      );
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateTriggerInitializationCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
