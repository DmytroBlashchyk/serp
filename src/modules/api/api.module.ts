import { Module } from '@nestjs/common';
import { ApiV1Controller } from 'modules/api/controllers/api-v1.controller';
import { ApiService } from 'modules/api/services/api.service';
import { ProjectsModule } from 'modules/projects/projects.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { ApiProjectsFactory } from 'modules/api/factories/api-projects.factory';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { ApiAccountInfoResponseFactory } from 'modules/api/factories/api- account-info-response.factory';

/**
 * The ApiModule class is a part of the NestJS application and is responsible for configuring and
 * providing the necessary modules, providers, and controllers for the API functionality.
 *
 * This module imports the following modules:
 * - ProjectsModule
 * - KeywordsModule
 * - AccountsModule
 * - JwtModule: Configured asynchronously using the ConfigService to set the secret key for JWT.
 *
 * It provides the following services and factories:
 * - ApiService
 * - ApiProjectsFactory
 * - ApiAccountInfoResponseFactory
 *
 * The module also includes the following controller:
 * - ApiV1Controller
 *
 * Finally, the module exports the ApiService to be used in other parts of the application.
 */
@Module({
  imports: [
    ProjectsModule,
    KeywordsModule,
    AccountsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(ConfigEnvEnum.SERPNEST_JWT_SECRET_KEY),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ApiService, ApiProjectsFactory, ApiAccountInfoResponseFactory],
  controllers: [ApiV1Controller],
  exports: [ApiService],
})
export class ApiModule {}
