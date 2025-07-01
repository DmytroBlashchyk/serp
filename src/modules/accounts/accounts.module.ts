import { Module } from '@nestjs/common';
import { AccountsController } from 'modules/accounts/controllers/accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { CountriesModule } from 'modules/countries/countries.module';
import { TimezonesModule } from 'modules/timezones/timezones.module';
import { CurrentResponseFactory } from 'modules/accounts/factories/current-response.factory';
import { CommonModule } from 'modules/common/common.module';
import { StorageModule } from 'modules/storage/storage.module';
import { UsersModule } from 'modules/users/users.module';
import { PostmarkMailingService } from 'modules/mailing/services/postmark-mailing.service';
import { ReasonsForAccountDeletionRepository } from 'modules/accounts/repositories/reasons-for-account-deletion.repository';
import { MailingModule } from 'modules/mailing/mailing.module';
import { AccountUserRepository } from 'modules/accounts/repositories/account-user.repository';
import { LoggingModule } from 'modules/logging/logging.module';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { FoldersModule } from 'modules/folders/folders.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from 'modules/queue/enums/queues.enum';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { AccountSearchResponseFactory } from 'modules/accounts/factories/account-search-response.factory';
import { JwtModule } from '@nestjs/jwt';
import { AccountSaga } from 'modules/accounts/sagas/account.saga';
import { CqrsModule } from '@nestjs/cqrs';
import { TariffPlansService } from 'modules/subscriptions/services/tariff-plans.service';
import { LatestProjectOverviewRepository } from 'modules/projects/repositories/latest-project-overview.repository';
import { BrandingInfoResponseFactory } from 'modules/accounts/factories/branding-info-response.factory';
import { AccountSettingsResponseFactory } from 'modules/accounts/factories/account-settings-response.factory';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { UsersInvitationsAccountFactory } from 'modules/users/factories/users-invitations-account.factory';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { CurrentAccountLimitsResponseFactory } from 'modules/accounts/factories/current-account-limits-response.factory';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { NecessaryRemovalResponseFactory } from 'modules/accounts/factories/necessary-removal-response.factory';
import { CacheModule } from 'modules/cache/cache.module';
import { HealthController } from 'modules/accounts/controllers/health.controller';
import { UserFactory } from 'modules/users/factories/user.factory';
import { AccountUsersService } from 'modules/accounts/services/account-users.service';
import { RefreshFolderTreeCommandHandler } from 'modules/accounts/command-handlers/refresh-folder-tree.command-handler';
import { CompleteAccountDeletionCommandHandler } from 'modules/accounts/command-handlers/complete-account-deletion.command-handler';
import { AccountsJobEmitter } from 'modules/accounts/job-emitters/accounts.job-emitter';
/**
 * Array that contains command handler classes responsible for various command operations.
 * Each command handler included in this list will handle a specific type of command, providing
 * the necessary logic for execution.
 * - RefreshFolderTreeCommandHandler: Handles logic for refreshing the folder tree.
 * - CompleteAccountDeletionCommandHandler: Handles logic for completing the account deletion process.
 *
 * @type {Array.<Function>}
 */
const commandHandlers = [
  RefreshFolderTreeCommandHandler,
  CompleteAccountDeletionCommandHandler,
];
/**
 * The AccountsModule is responsible for handling account-related functionality within the application.
 *
 * This module imports various other modules and repositories, which provide the necessary services and
 * functionality required by the AccountsModule.
 *
 * The following modules are imported:
 * - LoggingModule: Handles logging operations.
 * - TypeOrmModule: Integrates TypeORM for database management with specific repositories.
 * - AccountLimitsModule: Manages account-related limits.
 * - CqrsModule: Incorporates CQRS (Command Query Responsibility Segregation) pattern.
 * - CountriesModule: Provides country-related information.
 * - TimezonesModule: Provides timezone-related information.
 * - CommonModule: Includes common functionalities shared across the application.
 * - StorageModule: Handles storage operations.
 * - UsersModule: Manages user-related functionalities.
 * - MailingModule: Supports mailing operations.
 * - FoldersModule: Manages folder-related operations.
 * - GatewayModule: Handles API gateway operations.
 * - CacheModule: Provides caching capabilities.
 * - BullModule: Configures Bull queues for background processing.
 * - JwtModule: Configures JWT for authentication purposes.
 *
 * The following providers are included:
 * - AccountsService: Service handling account-related operations.
 * - CurrentResponseFactory: Factory for creating current response objects.
 * - PostmarkMailingService: Service for sending emails via Postmark.
 * - UsersInvitationsAccountFactory: Factory for creating user invitation account objects.
 * - AccountSearchResponseFactory: Factory for creating account search response objects.
 * - AccountSaga: Saga managing account-related business logic.
 * - TariffPlansService: Service for managing tariff plans.
 * - BrandingInfoResponseFactory: Factory for creating branding information response objects.
 * - AccountSettingsResponseFactory: Factory for creating account settings response objects.
 * - CurrentAccountLimitsResponseFactory: Factory for creating current account limits response objects.
 * - PaddleService: Service for handling Paddle-related operations.
 * - NecessaryRemovalResponseFactory: Factory for creating necessary removal response objects.
 * - UserFactory: Factory for creating user objects.
 * - AccountUsersService: Service for managing account users.
 * - CommandHandlers: A series of command handlers for processing commands.
 *
 * The following controllers are included:
 * - AccountsController: Controller for handling account-related API requests.
 * - HealthController: Controller for handling health check API requests.
 *
 * The following services and factories are exported:
 * - AccountsService: Service handling account-related operations.
 * - TypeOrmModule with AccountRepository: TypeORM module configured with AccountRepository.
 * - BrandingInfoResponseFactory: Factory for creating branding information response objects.
 * - AccountSettingsResponseFactory: Factory for creating account settings response objects.
 * - AccountUsersService: Service for managing account users.
 */
@Module({
  imports: [
    LoggingModule,
    TypeOrmModule.forFeature([
      AccountRepository,
      ReasonsForAccountDeletionRepository,
      AccountUserRepository,
      InvitationRepository,
      LatestProjectOverviewRepository,
      AccountLimitRepository,
      KeywordRepository,
    ]),
    AccountLimitsModule,
    CqrsModule,
    CountriesModule,
    TimezonesModule,
    CommonModule,
    StorageModule,
    UsersModule,
    MailingModule,
    FoldersModule,
    GatewayModule,
    CacheModule,
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Mailing,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(ConfigEnvEnum.SERPNEST_JWT_SECRET_KEY),
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Accounts,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        defaultJobOptions: {
          priority: 2,
        },
        redis: redisFactory(config),
      }),
    }),
  ],
  providers: [
    AccountsService,
    CurrentResponseFactory,
    PostmarkMailingService,
    UsersInvitationsAccountFactory,
    AccountSearchResponseFactory,
    AccountSaga,
    TariffPlansService,
    BrandingInfoResponseFactory,
    AccountSettingsResponseFactory,
    CurrentAccountLimitsResponseFactory,
    PaddleService,
    NecessaryRemovalResponseFactory,
    UserFactory,
    AccountUsersService,
    ...commandHandlers,
    AccountsJobEmitter,
  ],
  controllers: [AccountsController, HealthController],
  exports: [
    AccountsService,
    TypeOrmModule.forFeature([AccountRepository]),
    BrandingInfoResponseFactory,
    AccountSettingsResponseFactory,
    AccountUsersService,
    CurrentResponseFactory,
    UsersInvitationsAccountFactory,
    AccountSearchResponseFactory,
    AccountsJobEmitter,
  ],
})
export class AccountsModule {}
