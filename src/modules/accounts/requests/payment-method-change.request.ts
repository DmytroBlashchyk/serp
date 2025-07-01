import { IsString } from 'class-validator';
import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class PaymentMethodChangeRequest {
  @IsId()
  accountId: IdType;

  @IsString()
  type: string;

  @IsString()
  last4: string;

  @IsString()
  expiryMonth: string;

  @IsString()
  expiryYear: string;
}
