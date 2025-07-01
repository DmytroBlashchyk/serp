import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AdditionOfKeywordsCommand } from 'modules/keywords/commands/addition-of-keywords.command';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

/**
 * Handles the addition of keywords to an account.
 *
 * @implements ICommandHandler<AdditionOfKeywordsCommand>
 */
@CommandHandler(AdditionOfKeywordsCommand)
export class AdditionOfKeywordsCommandHandler
  implements ICommandHandler<AdditionOfKeywordsCommand>
{
  /**
   * Constructor for initializing the services.
   *
   * @param {AccountLimitsService} accountLimitsService - The service to manage account limits.
   * @param {GatewayService} gatewayService - The service to handle gateway operations.
   * @param {CliLoggingService} cliLoggingService - The service to handle CLI logging.
   *
   * @return {void}
   */
  constructor(
    private readonly accountLimitsService: AccountLimitsService,
    private readonly gatewayService: GatewayService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}

  /**
   * Executes the AdditionOfKeywordsCommand. This method logs the start of the command,
   * retrieves the daily and monthly account limits, updates the limits with the new
   * keywords count, and handles both the daily and monthly keyword updates using the
   * gateway service. If an error occurs, it logs the error.
   *
   * @param {AdditionOfKeywordsCommand} command - The command containing the details
   *                                              for adding keywords, including the
   *                                              account ID and the number of keywords
   *                                              to be added.
   * @return {Promise<void>} - A promise that resolves when the command execution
   *                           is complete.
   */
  async execute(command: AdditionOfKeywordsCommand): Promise<void> {
    this.cliLoggingService.log('Start: AdditionOfKeywordsCommandHandler');
    try {
      const limits =
        await this.accountLimitsService.getDailyAndMonthlyAccountLimits(
          command.accountId,
        );
      await this.gatewayService.handleAdditionOfKeywords({
        accountId: command.accountId,
        accountLimitUsed:
          limits.numberOfKeywords + command.numberOfKeywordsToBeAdded,
        balanceAccountLimit:
          limits.balanceAccountLimitNumberOfDailyUpdatesOfKeywordPositions -
          command.numberOfKeywordsToBeAdded,
      });
      await this.gatewayService.handleMonthlyKeywordUpdate({
        accountId: command.accountId,
        accountLimitUsed:
          limits.numberOfKeywords + command.numberOfKeywordsToBeAdded,
        balanceAccountLimit:
          limits.balanceAccountLimitNumberOfMonthlyUpdatesOfKeywordPositions -
          command.numberOfKeywordsToBeAdded,
      });
    } catch (error) {
      this.cliLoggingService.error(
        `Error: AdditionOfKeywordsCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
