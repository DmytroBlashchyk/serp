import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TransactionReadyCommand } from 'modules/payments/commands/transaction-ready.command';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { TransactionStatusRepository } from 'modules/transactions/repositories/transaction-status.repository';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(TransactionReadyCommand)
export class TransactionReadyCommandHandler
  implements ICommandHandler<TransactionReadyCommand>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transactionStatusRepository: TransactionStatusRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the TransactionReadyCommand.
   *
   * @param {TransactionReadyCommand} command - The command object containing the transaction ID.
   * @return {Promise<void>} - A promise that resolves when the transaction status is updated.
   */
  @Transactional()
  async execute(command: TransactionReadyCommand): Promise<void> {
    this.cliLoggingService.log(`START: TransactionReadyCommandHandler`);
    try {
      const status = await this.transactionStatusRepository.getStatusByName(
        TransactionStatusesEnum.ready,
      );
      const transaction =
        await this.transactionRepository.getTransactionByTransactionId(
          command.transactionId,
        );
      await this.transactionRepository.save({ ...transaction, status });
      this.cliLoggingService.log(`END: TransactionReadyCommandHandler`);
    } catch (error) {
      this.cliLoggingService.error(
        `TransactionReadyCommandHandler ${JSON.stringify(command)}`,
        error,
      );
    }
  }
}
