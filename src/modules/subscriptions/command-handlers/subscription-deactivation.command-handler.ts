import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SubscriptionDeactivationCommand } from 'modules/subscriptions/commands/subscription-deactivation.command';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(SubscriptionDeactivationCommand)
export class SubscriptionDeactivationCommandHandler
  implements ICommandHandler<SubscriptionDeactivationCommand>
{
  constructor(
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the deactivation of subscriptions by changing their status to 'deactivated'.
   *
   * @param {SubscriptionDeactivationCommand} command - The command containing subscription IDs to be deactivated.
   * @return {Promise<void>} Resolves when the operation is complete.
   */
  async execute(command: SubscriptionDeactivationCommand): Promise<void> {
    try {
      const status =
        await this.subscriptionStatusRepository.getSubscriptionStatusByName(
          SubscriptionStatusesEnum.deactivated,
        );
      await this.subscriptionRepository.save(
        command.subscriptionIds.map((id) => {
          return { id, status };
        }),
      );
    } catch (error) {
      this.cliLoggingService.error(
        `Error: SubscriptionDeactivationCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
