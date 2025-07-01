import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse } from '@nestjs/swagger';
import { InvoicesResponse } from 'modules/subscriptions/responses/invoices.response';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { GetInvoicesRequest } from 'modules/subscriptions/requests/get-invoices.request';
import { TransactionsService } from 'modules/transactions/services/transactions.service';
import { PdfInvoiceResponse } from 'modules/transactions/responses/pdf-invoice.response';

@Controller('accounts')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  /**
   * Retrieves invoices for a specific account.
   *
   * @param {IdType} id - The unique identifier of the account.
   * @param {GetInvoicesRequest} query - The query parameters for fetching invoices.
   * @return {Promise<InvoicesResponse>} Returns a promise that resolves with the invoices.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: InvoicesResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Get(':id/invoices')
  getInvoices(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Query() query: GetInvoicesRequest,
  ): Promise<InvoicesResponse> {
    return this.transactionsService.paginatedTransactions(
      { accountId: id },
      query,
    );
  }

  /**
   * Generates a PDF invoice for a specific transaction.
   *
   * @param {IdType} id - The ID of the user or entity.
   * @param {string} transactionId - The unique identifier of the transaction.
   * @return {Promise<PdfInvoiceResponse>} A promise that resolves to the PDF invoice response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: PdfInvoiceResponse })
  @Get(':id/invoices/:transactionId')
  pdfInvoice(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('transactionId') transactionId: string,
  ): Promise<PdfInvoiceResponse> {
    return this.transactionsService.getInvoicePdf(transactionId);
  }
}
