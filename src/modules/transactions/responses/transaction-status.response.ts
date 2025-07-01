import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';

export class TransactionStatusResponse extends WithEnumDto(
  TransactionStatusesEnum,
) {}
