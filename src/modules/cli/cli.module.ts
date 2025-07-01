import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvValidationSchema } from 'modules/common/utils/joi-validation-for-env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormFactory } from 'modules/common/utils/typeormFactory';
import { RedisModule } from 'nestjs-redis';
import { CliService } from 'modules/cli/services/cli.service';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { LoggingModule } from 'modules/logging/logging.module';
import { CountriesModule } from 'modules/countries/countries.module';
import { CommandModule } from 'nestjs-command';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { AccountsJobEmitter } from 'modules/accounts/job-emitters/accounts.job-emitter';
import { BullModule } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: EnvValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeormFactory,
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: redisFactory,
    }),
    CommandModule,
    LoggingModule,
    CountriesModule,
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
  providers: [CliService, AccountsJobEmitter],
})
export class CliModule {
  /**
   * This method is called when a module is initialized.
   * It logs the PID of the current process to the console.
   *
   * @return {void} This method does not return anything.
   */
  onModuleInit() {
    // eslint-disable-next-line no-console
    console.log('Cli thread is started. PID: ', process.pid);
  }
}
