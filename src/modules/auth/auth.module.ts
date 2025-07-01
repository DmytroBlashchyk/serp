import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'modules/auth/controllers/auth.controller';
import { UserAuthService } from 'modules/auth/services/user-auth.service';
import { RoleRepository } from 'modules/auth/repositories/role.repository';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { CommonModule } from 'modules/common/common.module';
import { UserStatusRepository } from 'modules/users/repositories/user-status.repository';
import { PostmarkMailingService } from 'modules/mailing/services/postmark-mailing.service';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { UserAuthGuard } from 'modules/auth/guards/user-auth.guard';
import { LoggingModule } from 'modules/logging/logging.module';
import { InvitationsModules } from 'modules/invitations/invitations.modules';
import { LoginAccountResponseFactory } from 'modules/auth/factories/login-account-response.factory';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { FoldersModule } from 'modules/folders/folders.module';
import { ProjectsModule } from 'modules/projects/projects.module';
import { SubscriptionsModule } from 'modules/subscriptions/subscriptions.module';
import { BullModule } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { CqrsModule } from '@nestjs/cqrs';
import { UserFactory } from 'modules/users/factories/user.factory';
import { LoginResponseFactory } from 'modules/auth/factories/login-response.factory';
import { GoogleStrategy } from 'modules/auth/strategies/google.strategy';
import { PostmarkAuthGuard } from 'modules/auth/guards/postmark-auth.guard';

/**
 * The AuthModule class provides the necessary configuration for authentication in the application.
 * It imports various modules required for authentication, including logging, passport, JWT,
 * and TypeOrm support for various repositories. It also sets up queues using BullModule for
 * handling background tasks related to mailing.
 *
 * The class registers AuthController as the controller responsible for handling authentication-related
 * requests and provides various services and guards necessary for authenticating users.
 * These include UserAuthService, PostmarkMailingService, UserAuthGuard, and various factories
 * for handling user data and response formats.
 *
 * It also exports several services, guards, and modules for use in other parts of the application,
 * ensuring the authentication logic is encapsulated and reusable.
 */
@Global()
@Module({
  imports: [
    LoggingModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(ConfigEnvEnum.SERPNEST_JWT_SECRET_KEY),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      RoleRepository,
      UserRepository,
      UserStatusRepository,
      InvitationRepository,
    ]),
    CommonModule,
    AccountsModule,
    InvitationsModules,
    FoldersModule,
    ProjectsModule,
    SubscriptionsModule,
    CqrsModule,
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
  controllers: [AuthController],
  providers: [
    UserAuthService,
    PostmarkMailingService,
    UserAuthGuard,
    LoginAccountResponseFactory,
    UserFactory,
    LoginResponseFactory,
    GoogleStrategy,
    PostmarkAuthGuard,
  ],
  exports: [
    UserAuthService,
    UserAuthGuard,
    TypeOrmModule.forFeature([RoleRepository]),
    CqrsModule,
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Mailing,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
    LoginResponseFactory,
    UserFactory,
  ],
})
export class AuthModule {}
