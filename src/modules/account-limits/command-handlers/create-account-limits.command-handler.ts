import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAccountLimitsCommand } from 'modules/account-limits/commands/create-account-limits.command';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(CreateAccountLimitsCommand)
export class CreateAccountLimitsCommandHandler
  implements ICommandHandler<CreateAccountLimitsCommand>
{
  constructor(
    private readonly defaultTariffPlanLimitRepository: DefaultTariffPlanLimitRepository,
    private readonly accountLimitRepository: AccountLimitRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the CreateAccountLimitsCommand to update account limits based on the tariff plan.
   *
   * @param {CreateAccountLimitsCommand} command - The command containing the tariff plan name and account ID.
   * @return {Promise<void>} A promise that resolves when the account limits have been updated.
   */
  async execute(command: CreateAccountLimitsCommand): Promise<void> {
    this.cliLoggingService.log('Start: CreateAccountLimitsCommandHandler');
    try {
      const tariffPlanLimits =
        await this.defaultTariffPlanLimitRepository.getAllLimitsByTariffPlan(
          command.tariffPlanName,
        );
      await this.accountLimitRepository.updateAccountLimits(
        tariffPlanLimits,
        command.accountId,
      );
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateAccountLimitsCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
