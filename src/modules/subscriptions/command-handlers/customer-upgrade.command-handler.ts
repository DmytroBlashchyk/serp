import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CustomerUpgradeCommand } from 'modules/subscriptions/commands/customer-upgrade.command';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';

@CommandHandler(CustomerUpgradeCommand)
export class CustomerUpgradeCommandHandler
  implements ICommandHandler<CustomerUpgradeCommand>
{
  constructor(
    private readonly paddleService: PaddleService,
    private readonly cliLoggingService: CliLoggingService,
    private readonly accountRepository: AccountRepository,
  ) {}
  /**
   * Executes the customer upgrade command.
   *
   * @param {CustomerUpgradeCommand} command - The command containing user ID and new email information.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async execute(command: CustomerUpgradeCommand) {
    this.cliLoggingService.log('Start: CustomerUpgradeCommandHandler');
    try {
      const account =
        await this.accountRepository.getYourOwnAccountWithASubscription(
          command.userId,
        );

      if (account.subscription?.customerId) {
        await this.paddleService.updateCustomerEmail(
          account.subscription?.customerId,
          command.newEmail,
        );
      }
    } catch (errors) {
      this.cliLoggingService.log(
        `Error: CustomerUpgradeCommand (${JSON.stringify(command)})`,
        errors,
      );
    }
  }
}
