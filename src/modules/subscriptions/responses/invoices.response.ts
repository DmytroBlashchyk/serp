import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { InvoiceResponse } from 'modules/subscriptions/responses/invoice.response';

export class InvoicesResponse extends WithPaginatedResponse(InvoiceResponse) {}
