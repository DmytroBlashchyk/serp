import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { InvoicesResponse } from 'modules/subscriptions/responses/invoices.response';
import { Injectable } from '@nestjs/common';
import { InvoiceResponse } from 'modules/subscriptions/responses/invoice.response';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';
import { TariffPlanSettingsResponse } from 'modules/subscriptions/responses/tariff-plan-settings.response';
import { TariffPlanTypeResponse } from 'modules/subscriptions/responses/tariff-plan-type.response';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { TransactionEntity } from 'modules/transactions/entities/transaction.entity';

@Injectable()
export class InvoicesResponseFactory extends BaseResponseFactory<
  TransactionEntity[],
  InvoicesResponse
> {
  /**
   * Generates an InvoicesResponse object based on the provided TransactionEntity array and optional metadata.
   *
   * @param {TransactionEntity[]} entity - An array of TransactionEntity objects used to create the response.
   * @param {Record<string, unknown>} [options] - Optional metadata to include in the response.
   * @return {Promise<InvoicesResponse>} A promise that resolves to an InvoicesResponse object containing the mapped transaction data and metadata.
   */
  async createResponse(
    entity: TransactionEntity[],
    options?: Record<string, unknown>,
  ): Promise<InvoicesResponse> {
    return new InvoicesResponse({
      items: entity.map((item) => {
        return new InvoiceResponse({
          id: item.id,
          billingDate: dateHelper(item.createdAt),
          billingDateFullFormat: formatGoogleStyleDate(item.createdAt),
          transactionId: item.transactionId,
          amount: item.amount,
          plan: new TariffPlanResponse({
            id: item.tariffPlanSetting.tariffPlan.id,
            name: item.tariffPlanSetting.tariffPlan.name,
            settings: new TariffPlanSettingsResponse({
              id: item.tariffPlanSetting.id,
              price: item.tariffPlanSetting.price,
              type: new TariffPlanTypeResponse({
                id: item.tariffPlanSetting.type.id,
                name: item.tariffPlanSetting.type.name,
              }),
            }),
          }),
        });
      }),

      meta: options,
    });
  }
}
