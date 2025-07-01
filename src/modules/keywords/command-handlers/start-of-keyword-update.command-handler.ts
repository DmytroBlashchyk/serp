import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartOfKeywordUpdateCommand } from 'modules/keywords/commands/start-of-keyword-update.command';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(StartOfKeywordUpdateCommand)
export class StartOfKeywordUpdateCommandHandler
  implements ICommandHandler<StartOfKeywordUpdateCommand>
{
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly keywordRepository: KeywordRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the StartOfKeywordUpdateCommand by fetching grouped keywords by account
   * and handling the start of keyword updates for each account.
   *
   * @param {StartOfKeywordUpdateCommand} command - The command containing keyword IDs for updating.
   * @return {Promise<void>} A promise that resolves when the command has been executed.
   */
  async execute(command: StartOfKeywordUpdateCommand): Promise<void> {
    this.cliLoggingService.log('Start: StartOfKeywordUpdateCommandHandler');
    try {
      const accountKeywords =
        await this.keywordRepository.getGroupedKeywordsByAccount(
          command.keywordIds,
        );
      for (const account of accountKeywords) {
        await this.gatewayService.handleStartOfKeywordUpdate(
          account.accountId,
          account.keywordIds,
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        `Error: StartOfKeywordUpdateCommandHandler (${JSON.stringify(
          command,
        )})`,
        error,
      );
    }
  }
}
