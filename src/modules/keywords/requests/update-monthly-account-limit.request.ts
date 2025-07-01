import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IsNumber } from 'class-validator';

export class UpdateMonthlyAccountLimitRequest {
  @IsId()
  accountId: IdType;

  @IsNumber()
  accountLimitUsed: number;

  @IsNumber()
  balanceAccountLimit: number;
}
