import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'nestjs-redis';

import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { typeormFactory } from 'modules/common/utils/typeormFactory';
import { PostmarkModule } from 'nestjs-postmark';
import { postmarkFactory } from 'modules/common/utils/postmarkFactory';
import { CommonModule } from 'modules/common/common.module';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { typeormTestFactory } from './typeOrmTestFactory';
import { JwtModule } from '@nestjs/jwt';
import { ProjectsModule } from 'modules/projects/projects.module';
import { AuthModule } from 'modules/auth/auth.module';

export const testImports = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: typeormTestFactory,
    inject: [ConfigService],
  }),
  PostmarkModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: postmarkFactory,
    inject: [ConfigService],
  }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get(ConfigEnvEnum.SERPNEST_JWT_SECRET_KEY),
    }),
    inject: [ConfigService],
  }),
  RedisModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      host: config.get(ConfigEnvEnum.REDIS_HOST),
      port: config.get(ConfigEnvEnum.REDIS_PORT),
      db: config.get(ConfigEnvEnum.REDIS_DB),
    }),
  }),
  AuthModule,
  ProjectsModule,
];
