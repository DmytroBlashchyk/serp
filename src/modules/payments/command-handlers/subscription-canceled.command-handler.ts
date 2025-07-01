import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SubscriptionCanceledCommand } from 'modules/payments/commands/subscription-canceled.command';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { NotFoundException } from '@nestjs/common';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { CardRepository } from 'modules/transactions/repositories/card.repository';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { GatewayService } from 'modules/gateway/services/gateway.service';

@CommandHandler(SubscriptionCanceledCommand)
export class SubscriptionCanceledCommandHandler
  implements ICommandHandler<SubscriptionCanceledCommand>
{
  constructor(
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly cardRepository: CardRepository,
    private readonly accountRepository: AccountRepository,
    private readonly gatewayService: GatewayService,
  ) {}
  /**
   * Executes the SubscriptionCanceledCommand to handle the cancellation of a subscription.
   *
   * @param {SubscriptionCanceledCommand} command - The command containing the subscription ID that needs to be canceled.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  @Transactional()
  async execute(command: SubscriptionCanceledCommand): Promise<void> {
    this.cliLoggingService.log(`START: SubscriptionCanceledCommand`);
    try {
      const subscription =
        await this.subscriptionRepository.getSubscriptionBySubscriptionId(
          command.subscriptionId,
        );
      if (!subscription) {
        throw new NotFoundException('Subscription not found.');
      }
      const status =
        await this.subscriptionStatusRepository.getSubscriptionStatusByName(
          SubscriptionStatusesEnum.deactivated,
        );
      await this.subscriptionRepository.save({
        ...subscription,
        status,
        paymentMethod: null,
        card: null,
      });
      if (subscription.card) {
        await this.cardRepository.remove(subscription.card);
      }

      const account = await this.accountRepository.getAccountBySubscriptionId(
        subscription.id,
      );

      await this.gatewayService.handlePaymentMethodChange(
        account.id,
        null,
        null,
      );
      this.cliLoggingService.log(`END: SubscriptionCanceledCommand`);
    } catch (error) {
      this.cliLoggingService.error(
        `SubscriptionCanceledCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
