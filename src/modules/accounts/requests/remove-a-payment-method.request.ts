import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class RemoveAPaymentMethodRequest {
  @IsId()
  accountId: IdType;
}
