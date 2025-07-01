import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TransactionPaymentFailedCommand } from 'modules/payments/commands/transaction-payment.failed.command';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { TransactionStatusRepository } from 'modules/transactions/repositories/transaction-status.repository';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(TransactionPaymentFailedCommand)
export class TransactionPaymentFailedCommandHandler
  implements ICommandHandler<TransactionPaymentFailedCommand>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transactionStatusRepository: TransactionStatusRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Handles the execution of the TransactionPaymentFailedCommand.
   *
   * @param {TransactionPaymentFailedCommand} command - The command containing the transaction ID whose payment has failed.
   * @return {Promise<void>} - A promise that resolves when the command execution is complete.
   */
  @Transactional()
  async execute(command: TransactionPaymentFailedCommand): Promise<void> {
    this.cliLoggingService.log(`START: TransactionPaymentFailedCommandHandler`);

    try {
      const status = await this.transactionStatusRepository.getStatusByName(
        TransactionStatusesEnum.paymentFailed,
      );
      const transaction =
        await this.transactionRepository.getTransactionByTransactionId(
          command.transactionId,
        );
      await this.transactionRepository.save({ ...transaction, status });
      this.cliLoggingService.log(`END: TransactionPaymentFailedCommandHandler`);
    } catch (error) {
      this.cliLoggingService.error(
        `TransactionPaymentFailedCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
