import { Module } from '@nestjs/common';
import { TariffPlansService } from 'modules/subscriptions/services/tariff-plans.service';
import { SubscriptionsController } from 'modules/subscriptions/controllers/subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffPlanRepository } from 'modules/subscriptions/repositories/tariff-plan.repository';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { SubscriptionsService } from 'modules/subscriptions/services/subscriptions.service';
import { BillingResponseFactory } from 'modules/subscriptions/factories/billing-response.factory';
import { CacheModule } from 'modules/cache/cache.module';
import { ReasonsForUnsubscriptionRepository } from 'modules/subscriptions/repositories/reasons-for-unsubscription.repository';
import { TypesOfReasonsForUnsubscriptionRepository } from 'modules/subscriptions/repositories/types-of-reasons-for-unsubscription.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { UpdateReviewResponseFactory } from 'modules/subscriptions/factories/update-review-response.factory';
import { CreateTrialPlanCommandHandler } from 'modules/subscriptions/command-handlers/create-trial-plan.command-handler';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { LoggingModule } from 'modules/logging/logging.module';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { UnsubscriptionCommandHandler } from 'modules/subscriptions/command-handlers/unsubscription.command-handler';
import { SubscriptionsSaga } from 'modules/subscriptions/sagas/subscriptions.saga';
import { SubscriptionDeactivationCommandHandler } from 'modules/subscriptions/command-handlers/subscription-deactivation.command-handler';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { CustomerUpgradeCommandHandler } from 'modules/subscriptions/command-handlers/customer-upgrade.command-handler';
import { TariffPlanTypeRepository } from 'modules/subscriptions/repositories/tariff-plan-type.repository';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from 'modules/queue/enums/queues.enum';
import { redisFactory } from 'modules/common/utils/redisFactory';

/**
 * An array of command handler classes used to manage subscription-related operations.
 *
 * Each entry in the array should be a class designed to handle a specific command,
 * such as creating a trial plan, handling unsubscription, deactivating a subscription,
 * or upgrading a customer.
 *
 * The command handler classes included are:
 * - `CreateTrialPlanCommandHandler`
 * - `UnsubscriptionCommandHandler`
 * - `SubscriptionDeactivationCommandHandler`
 * - `CustomerUpgradeCommandHandler`
 *
 * These handlers are responsible for executing their respective commands and encapsulate
 * the business logic required for each operation.
 */
const commandHandlers = [
  CreateTrialPlanCommandHandler,
  UnsubscriptionCommandHandler,
  SubscriptionDeactivationCommandHandler,
  CustomerUpgradeCommandHandler,
];
/**
 * The SubscriptionsModule class is responsible for grouping related
 * functionalities and dependencies for managing subscriptions within the application.
 *
 * This module imports several other modules and repositories for working with accounts,
 * caching, CQRS, logging, and data persistence through TypeORM.
 *
 * Providers registered in this module include services for handling tariff plans,
 * subscriptions, and billing responses, among others. Additionally, it includes a
 * saga for managing long-running subscription processes.
 *
 * The module also exports key services and repositories that can be utilized in other
 * parts of the application.
 *
 * Controllers within this module handle incoming HTTP requests related to subscriptions.
 */
@Module({
  imports: [
    AccountsModule,
    CacheModule,
    CqrsModule,
    LoggingModule,
    TypeOrmModule.forFeature([
      TariffPlanRepository,
      SubscriptionStatusRepository,
      SubscriptionRepository,
      ReasonsForUnsubscriptionRepository,
      TypesOfReasonsForUnsubscriptionRepository,
      TariffPlanSettingRepository,
      DefaultTariffPlanLimitRepository,
      TransactionRepository,
      TariffPlanTypeRepository,
    ]),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Mailing,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
  ],
  providers: [
    TariffPlansService,
    ...commandHandlers,
    SubscriptionsService,
    BillingResponseFactory,
    UpdateReviewResponseFactory,
    PaddleService,
    SubscriptionsSaga,
  ],
  controllers: [SubscriptionsController],
  exports: [
    TariffPlansService,
    SubscriptionsService,
    TypeOrmModule.forFeature([
      TariffPlanRepository,
      TariffPlanSettingRepository,
    ]),
  ],
})
export class SubscriptionsModule {}
