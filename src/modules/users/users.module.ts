import { Module } from '@nestjs/common';
import { UsersService } from 'modules/users/services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { UserStatusRepository } from 'modules/users/repositories/user-status.repository';
import { CommonModule } from 'modules/common/common.module';
import { UsersController } from 'modules/users/controllers/users.controller';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { CountriesService } from 'modules/countries/services/countries.service';
import { TimezonesService } from 'modules/timezones/services/timezones.service';
import { CurrentResponseFactory } from 'modules/accounts/factories/current-response.factory';
import { StorageService } from 'modules/storage/services/storage.service';
import { ReasonsForAccountDeletionRepository } from 'modules/accounts/repositories/reasons-for-account-deletion.repository';
import { CountryRepository } from 'modules/countries/repositories/country.repository';
import { TimezoneRepository } from 'modules/timezones/repositories/timezone.repository';
import { StorageItemRepository } from 'modules/storage/repositories/storage-item.repository';
import { EmailTemplateService } from 'modules/mailing/services/email-template.service';
import { PostmarkMailingService } from 'modules/mailing/services/postmark-mailing.service';
import { AccountUserRepository } from 'modules/accounts/repositories/account-user.repository';
import { UsersAccountFactory } from 'modules/users/factories/users-account.factory';
import { RolesController } from 'modules/users/controllers/roles.controller';
import { RolesService } from 'modules/users/services/roles.service';
import { LoggingModule } from 'modules/logging/logging.module';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { RateLimiterWrapperFactoryService } from 'modules/common/services/rate-limiter-factory.service';
import { FoldersModule } from 'modules/folders/folders.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from 'modules/queue/enums/queues.enum';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { AccountSearchResponseFactory } from 'modules/accounts/factories/account-search-response.factory';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { UserSearchRepository } from 'modules/users/repositories/user-search.repository';
import { UserSearchesService } from 'modules/users/services/user-searches.service';
import { UserSearchesController } from 'modules/users/controllers/user-searches.controller';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { TariffPlansService } from 'modules/subscriptions/services/tariff-plans.service';
import { TariffPlanRepository } from 'modules/subscriptions/repositories/tariff-plan.repository';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { RoleRepository } from 'modules/auth/repositories/role.repository';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { UsersInvitationsAccountFactory } from 'modules/users/factories/users-invitations-account.factory';
import { MailingModule } from 'modules/mailing/mailing.module';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { CurrentAccountLimitsResponseFactory } from 'modules/accounts/factories/current-account-limits-response.factory';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { NecessaryRemovalResponseFactory } from 'modules/accounts/factories/necessary-removal-response.factory';
import { CacheModule } from 'modules/cache/cache.module';
import { UserFactory } from 'modules/users/factories/user.factory';
import { TimezonesResponseFactory } from 'modules/timezones/factories/timezones-response.factory';

/**
 * The UsersModule class is responsible for encapsulating and managing user-related functionality,
 * including controllers, repositories, services, and external module integrations.
 *
 * The module integrates with various controllers:
 * - UsersController
 * - RolesController
 * - UserSearchesController
 *
 * The module imports several other modules and configurations:
 * - LoggingModule: Handles logging mechanisms.
 * - TypeOrmModule: Deals with database connections and repositories.
 * - CommonModule: Shared common functionalities.
 * - FoldersModule: File and folder management.
 * - CqrsModule: Command Query Responsibility Segregation.
 * - MailingModule: Emailing services and configurations.
 * - GatewayModule: Handles WebSocket connections and configurations.
 * - CacheModule: Caching mechanisms.
 * - BullModule: Handles asynchronous job queues.
 * - JwtModule: Manages JSON Web Token (JWT) authentication.
 *
 * The providers within this module are responsible for handling the core business logic:
 * - UserSearchesService: Manages user search-related functionalities.
 * - UsersService: Core service for managing user operations.
 * - AccountsService: Handles account-related operations.
 * - CountriesService: Manages country-specific information.
 * - TimezonesService: Handles timezone-related functionalities.
 * - CurrentResponseFactory: Generates the current response for user operations.
 * - StorageService: Deals with storage operations.
 * - EmailTemplateService: Manages email templates.
 * - PostmarkMailingService: Integration with Postmark mailing service.
 * - UsersAccountFactory: Factory for building user accounts.
 * - UsersInvitationsAccountFactory: Factory for handling user invitations and accounts.
 * - RolesService: Manages roles and permissions.
 * - RateLimiterWrapperFactoryService: Handles rate limiting.
 * - AccountSearchResponseFactory: Generates responses for account searches.
 * - TariffPlansService: Manages tariff plans and related operations.
 * - AccountLimitsService: Handles account limits configurations.
 * - CurrentAccountLimitsResponseFactory: Generates the current account limits response.
 * - NecessaryRemovalResponseFactory: Generates necessary removal responses.
 * - UserFactory: Factory for creating user instances.
 * - TimezonesResponseFactory: Generates responses related to timezones.
 *
 * The module also exports selected services and repositories for use in other modules:
 * - UsersService
 * - RolesService
 * - UserSearchesService
 * - TypeOrmModule with UserRepository and UserStatusRepository
 */
@Module({
  controllers: [UsersController, RolesController, UserSearchesController],
  imports: [
    LoggingModule,
    TypeOrmModule.forFeature([
      UserRepository,
      UserStatusRepository,
      RoleRepository,
      AccountRepository,
      ReasonsForAccountDeletionRepository,
      CountryRepository,
      TimezoneRepository,
      StorageItemRepository,
      AccountUserRepository,
      InvitationRepository,
      TariffPlanSettingRepository,
      UserSearchRepository,
      ProjectRepository,
      TariffPlanRepository,
      SubscriptionRepository,
      AccountLimitRepository,
      DefaultTariffPlanLimitRepository,
    ]),
    CommonModule,
    FoldersModule,
    CqrsModule,
    MailingModule,
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
  ],
  providers: [
    UserSearchesService,
    UsersService,
    AccountsService,
    CountriesService,
    TimezonesService,
    CurrentResponseFactory,
    StorageService,
    EmailTemplateService,
    PostmarkMailingService,
    // UserAccountFactory,
    UsersAccountFactory,
    UsersInvitationsAccountFactory,
    RolesService,
    RateLimiterWrapperFactoryService,
    AccountSearchResponseFactory,
    TariffPlansService,
    AccountLimitsService,
    CurrentAccountLimitsResponseFactory,
    NecessaryRemovalResponseFactory,
    UserFactory,
    TimezonesResponseFactory,
  ],
  exports: [
    UsersService,
    RolesService,
    UserSearchesService,
    TypeOrmModule.forFeature([UserRepository, UserStatusRepository]),
  ],
})
export class UsersModule {}
