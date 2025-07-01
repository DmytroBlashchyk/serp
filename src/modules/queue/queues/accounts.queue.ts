import { BaseQueue } from 'modules/queue/queues/base.queue';
import { Process, Processor } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';

import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';

@Processor(Queues.Accounts)
export class AccountsQueue extends BaseQueue {
  constructor(
    protected readonly cliLoggingService: CliLoggingService,
    private readonly accountRepository: AccountRepository,
    private readonly defaultTariffPlanLimitRepository: DefaultTariffPlanLimitRepository,
    private readonly accountLimitRepository: AccountLimitRepository,
  ) {
    super(cliLoggingService);
  }

  @Process({
    name: QueueEventEnum.AssignALimitOfNumberOfLiveModeUpdatesForKeywordsPerDayToExistingAccounts,
    concurrency: 5,
  })
  async assignALimitOfNumberOfLiveModeUpdatesForKeywordsPerDayToExistingAccounts(): Promise<void> {
    const accounts =
      await this.accountRepository.getAllAccountsWithTariffPlan();
    for (const account of accounts) {
      const limits =
        await this.defaultTariffPlanLimitRepository.getAllLimitsByTariffPlan(
          account.subscription.tariffPlanSetting.tariffPlan.name,
        );
      const limitOfNumberOfLiveModeUpdatesForKeywordsPerDay = limits.find(
        (limit) =>
          limit.limitType.name ===
          LimitTypesEnum.NumberOfLiveModeUpdatesForKeywordsPerDay,
      );
      await this.accountLimitRepository.updateAccountLimits(
        [limitOfNumberOfLiveModeUpdatesForKeywordsPerDay],
        account.id,
      );
    }
  }
}
