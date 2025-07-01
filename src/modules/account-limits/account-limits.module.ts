import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { AccountLimitSaga } from 'modules/account-limits/sagas/account-limit.saga';
import { CreateAccountLimitsCommandHandler } from 'modules/account-limits/command-handlers/create-account-limits.command-handler';
import { CqrsModule } from '@nestjs/cqrs';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { LoggingModule } from 'modules/logging/logging.module';

/**
 * An array of command handler instances.
 *
 * Each element in this array is responsible for handling specific commands,
 * defined by the handler's functionality.
 */
const commandHandlers = [CreateAccountLimitsCommandHandler];

/**
 * AccountLimitsModule is responsible for registering the dependencies
 * related to account limits within the application. This module connects
 * various services, repositories, and other modules to provide a cohesive
 * structure for handling account limit functionalities.
 *
 * - controllers: No controllers are registered within this module.
 * - exports: The module exports AccountLimitsService to be used across
 *   other modules in the application.
 *
 * Imports:
 * - TypeOrmModule with repositories for DefaultTariffPlanLimitRepository,
 *   AccountLimitRepository, and KeywordRepository to interact with the database.
 * - CqrsModule for implementing command-query responsibility segregation.
 * - GatewayModule to handle communication between different services.
 * - LoggingModule for logging purposes.
 *
 * Providers:
 * - AccountLimitsService for managing account limit related operations.
 * - AccountLimitSaga for handling complex workflows related to account limits.
 * - Additional commandHandlers for executing specific commands within the module.
 */
@Module({
  controllers: [],
  exports: [AccountLimitsService],
  imports: [
    TypeOrmModule.forFeature([
      DefaultTariffPlanLimitRepository,
      AccountLimitRepository,
      KeywordRepository,
    ]),
    CqrsModule,
    GatewayModule,
    LoggingModule,
  ],
  providers: [AccountLimitsService, AccountLimitSaga, ...commandHandlers],
})
export class AccountLimitsModule {}
