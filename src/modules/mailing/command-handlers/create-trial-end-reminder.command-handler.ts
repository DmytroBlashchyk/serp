import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTrialEndReminderCommand } from 'modules/mailing/commands/create-trial-end-reminder.command';
import { MailingService } from 'modules/mailing/services/mailing.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(CreateTrialEndReminderCommand)
export class CreateTrialEndReminderCommandHandler
  implements ICommandHandler<CreateTrialEndReminderCommand>
{
  constructor(
    private readonly mailingService: MailingService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the command to send an email reminder indicating the trial period is ending.
   *
   * @param {CreateTrialEndReminderCommand} command - The command containing the list of users to notify.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  async execute(command: CreateTrialEndReminderCommand): Promise<void> {
    try {
      await this.mailingService.sendAnEmailThatTrialPeriodIsEnding(
        command.users,
      );
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateTrialEndReminderCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
