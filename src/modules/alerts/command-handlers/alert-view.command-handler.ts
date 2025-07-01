import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AlertViewCommand } from 'modules/alerts/commands/alert-view.command';
import { AlertKeywordViewRepository } from 'modules/alerts/repositories/alert-keyword-view.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(AlertViewCommand)
export class AlertViewCommandHandler
  implements ICommandHandler<AlertViewCommand>
{
  constructor(
    private readonly alertViewRepository: AlertKeywordViewRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the given AlertViewCommand, saving the alert and user information to the repository.
   *
   * @param {AlertViewCommand} command - The command containing alertId and userId to be saved.
   * @return {Promise<void>} A promise that resolves when the command has been executed.
   */
  async execute(command: AlertViewCommand): Promise<void> {
    try {
      await this.alertViewRepository.save({
        alert: { id: command.alertId },
        user: { id: command.userId },
      });
    } catch (error) {
      this.cliLoggingService.error(
        `Error: AlertViewCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
