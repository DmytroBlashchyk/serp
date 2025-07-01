import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionCreatedCommand } from 'modules/payments/commands/transaction-created.command';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { TransactionStatusRepository } from 'modules/transactions/repositories/transaction-status.repository';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(TransactionCreatedCommand)
export class TransactionCreatedCommandHandler
  implements ICommandHandler<TransactionCreatedCommand>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transactionStatusRepository: TransactionStatusRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly accountRepository: AccountRepository,
  ) {}
  /**
   * Handles the execution of the TransactionCreatedCommand.
   * This method logs the start and end of the transaction processing, looks up the account,
   * gets the transaction status, saves the transaction, and handles errors if they occur.
   *
   * @param {TransactionCreatedCommand} command - The command containing the transaction details.
   * @return {Promise<void>} - A promise that resolves when the transaction is created.
   */
  @Transactional()
  async execute(command: TransactionCreatedCommand): Promise<void> {
    try {
      this.cliLoggingService.log(`START: TransactionCreatedCommandHandler`);
      const account = await this.accountRepository.findOne({
        where: { id: command.accountId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
      const status = await this.transactionStatusRepository.getStatusByName(
        TransactionStatusesEnum.created,
      );
      await this.transactionRepository.save({
        account: { id: command.accountId },
        transactionId: command.transactionId,
        status,
      });
      this.cliLoggingService.log('END: TransactionCreatedCommandHandler');
    } catch (error) {
      this.cliLoggingService.error(
        `TransactionCreatedCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
