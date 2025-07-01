import { Module } from '@nestjs/common';
import { PaymentsController } from 'modules/payments/controllers/payments.controller';
import { PaymentsSaga } from 'modules/payments/sagas/payments.saga';
import { SubscriptionActivationCommandHandler } from 'modules/payments/command-handlers/subscription-activation.command-handler';
import { TransactionUpdatedCommandHandler } from 'modules/payments/command-handlers/transaction-updated.command-handler';
import { TransactionCreatedCommandHandler } from 'modules/payments/command-handlers/transaction-created.command-handler';
import { TransactionReadyCommandHandler } from 'modules/payments/command-handlers/transaction-ready.command-handler';
import { TransactionCompletedCommandHandler } from 'modules/payments/command-handlers/transaction-completed.command-handler';
import { TransactionPaymentFailedCommandHandler } from 'modules/payments/command-handlers/transaction-payment-failed.command-handler';
import { SubscriptionUpdatedCommandHandler } from 'modules/payments/command-handlers/subscription-updated.command-handler';
import { SubscriptionCanceledCommandHandler } from 'modules/payments/command-handlers/subscription-canceled.command-handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { KeywordPositionsForDayRepository } from 'modules/keywords/repositories/keyword-positions-for-day.repository';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { TriggerKeywordRepository } from 'modules/triggers/repositories/trigger-keyword.repository';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { TransactionStatusRepository } from 'modules/transactions/repositories/transaction-status.repository';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { CardRepository } from 'modules/transactions/repositories/card.repository';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { LoggingModule } from 'modules/logging/logging.module';
import { PaymentsService } from 'modules/payments/services/payments.service';
import { CqrsModule } from '@nestjs/cqrs';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { CommonModule } from 'modules/common/common.module';
import { PaymentMethodRepository } from 'modules/payments/repositories/payment-method.repository';
import { BillingResponseFactory } from 'modules/subscriptions/factories/billing-response.factory';
/**
 * An array of command handler classes that are responsible for handling various command events
 * within the application. Each handler in the array corresponds to a specific type of command
 * and contains the logic to process that command accordingly.
 *
 * Command Handlers included are:
 * - SubscriptionActivationCommandHandler: Handles subscription activation commands.
 * - TransactionUpdatedCommandHandler: Handles updated transaction commands.
 * - TransactionCreatedCommandHandler: Handles newly created transaction commands.
 * - TransactionReadyCommandHandler: Handles commands when a transaction is ready for the next step.
 * - TransactionCompletedCommandHandler: Handles transaction completion commands.
 * - TransactionPaymentFailedCommandHandler: Handles commands for failed transaction payments.
 * - SubscriptionUpdatedCommandHandler: Handles updates to existing subscriptions.
 * - SubscriptionCanceledCommandHandler: Handles subscription cancellation commands.
 */
const commandHandlers = [
  SubscriptionActivationCommandHandler,
  TransactionUpdatedCommandHandler,
  TransactionCreatedCommandHandler,
  TransactionReadyCommandHandler,
  TransactionCompletedCommandHandler,
  TransactionPaymentFailedCommandHandler,
  SubscriptionUpdatedCommandHandler,
  SubscriptionCanceledCommandHandler,
];
/**
 * PaymentsModule serves as the main entry point for the payments feature.
 * It imports various repositories, services, and other related modules
 * to support payment processing functionalities.
 *
 * The following modules are imported:
 * - TypeOrmModule with various repositories related to payment processing.
 * - LoggingModule for centralized logging.
 * - CqrsModule for implementing CQRS pattern.
 * - GatewayModule for managing external payment gateways.
 * - CommonModule for shared utilities and services.
 *
 * Controllers:
 * - PaymentsController: Handles HTTP requests related to payment operations.
 *
 * Providers:
 * - PaymentsSaga: Coordinates long-running payment processes.
 * - PaddleService: Service for handling integration with the Paddle payment gateway.
 * - PaymentsService: Main service for processing payments.
 * - BillingResponseFactory: Factory for creating standardized billing responses.
 * - Command Handlers: A dynamic array of command handlers involved in payment operations.
 *
 * Note: No exports are defined for this module.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentMethodRepository,
      ProjectRepository,
      KeywordRepository,
      KeywordPositionsForDayRepository,
      SearchResultRepository,
      CompetitorKeywordPositionRepository,
      TriggerKeywordRepository,
      SubscriptionRepository,
      SubscriptionStatusRepository,
      TariffPlanSettingRepository,
      AccountLimitRepository,
      DefaultTariffPlanLimitRepository,
      TransactionRepository,
      TransactionStatusRepository,
      AccountRepository,
      CardRepository,
    ]),
    LoggingModule,
    CqrsModule,
    GatewayModule,
    CommonModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsSaga,
    ...commandHandlers,
    PaddleService,
    PaymentsService,
    BillingResponseFactory,
  ],
  exports: [],
})
export class PaymentsModule {}
