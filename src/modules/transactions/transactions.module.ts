import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { TransactionStatusRepository } from 'modules/transactions/repositories/transaction-status.repository';
import { TransactionsService } from 'modules/transactions/services/transactions.service';
import { CardRepository } from 'modules/transactions/repositories/card.repository';
import { TransactionsController } from 'modules/transactions/controllers/transactions.controller';
import { InvoicesResponseFactory } from 'modules/transactions/factories/invoices-response.factory';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { LoggingModule } from 'modules/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionRepository,
      TransactionStatusRepository,
      CardRepository,
    ]),
    LoggingModule,
  ],
  providers: [TransactionsService, InvoicesResponseFactory, PaddleService],
  exports: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
