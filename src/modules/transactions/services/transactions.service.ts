import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedTransactionsType } from 'modules/transactions/types/paginated-transactions.type';
import { GetInvoicesRequest } from 'modules/subscriptions/requests/get-invoices.request';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { InvoicesResponseFactory } from 'modules/transactions/factories/invoices-response.factory';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { PdfInvoiceResponse } from 'modules/transactions/responses/pdf-invoice.response';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly invoicesResponseFactory: InvoicesResponseFactory,
    private readonly paddleService: PaddleService,
  ) {}
  /**
   * Generates a PDF invoice for a given transaction.
   *
   * @param {string} transactionId - The unique identifier for the transaction.
   * @return {Promise<PdfInvoiceResponse>} A promise that resolves with the PDF invoice response.
   */
  async getInvoicePdf(transactionId: string): Promise<PdfInvoiceResponse> {
    const transaction =
      await this.transactionRepository.getTransactionByTransactionId(
        transactionId,
      );
    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }
    const invoice = await this.paddleService.getInvoice(transactionId);

    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }
    return new PdfInvoiceResponse({ url: invoice.url });
  }

  /**
   * Fetches paginated transactions for a given account and returns a formatted response.
   *
   * @param {PaginatedTransactionsType} payload - The payload containing details such as accountId and pagination information.
   * @param {GetInvoicesRequest} options - The options containing filters and sorting criteria for retrieving the transactions.
   * @return {Promise<Object>} - A promise that resolves to an object containing the formatted paginated transactions response.
   */
  async paginatedTransactions(
    payload: PaginatedTransactionsType,
    options: GetInvoicesRequest,
  ) {
    const { items, meta } =
      await this.transactionRepository.paginatedAccountTransactions(
        payload.accountId,
        options,
      );
    return this.invoicesResponseFactory.createResponse(items, meta);
  }
}
