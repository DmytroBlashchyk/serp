import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotifyTrialEndCommand } from 'modules/mailing/commands/notify-trial-end.command';
import { MailingService } from 'modules/mailing/services/mailing.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(NotifyTrialEndCommand)
export class NotifyTrialEndCommandHandler
  implements ICommandHandler<NotifyTrialEndCommand>
{
  constructor(
    private readonly mailingService: MailingService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the notification process for the end of the trial period.
   *
   * @param {NotifyTrialEndCommand} command - The command containing the necessary data to notify users.
   * @return {Promise<void>} - A promise that resolves when the notification process is complete.
   */
  async execute(command: NotifyTrialEndCommand): Promise<void> {
    try {
      await this.mailingService.sendAnEmailThatTrialPeriodIsOver(command.users);
    } catch (error) {
      this.cliLoggingService.error(
        `Error: NotifyTrialEndCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
