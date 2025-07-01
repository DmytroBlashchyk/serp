import { TariffPlanTypesEnum } from 'modules/subscriptions/enums/tariff-plan-types.enum';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class GetTariffPlanRequest {
  @ApiProperty({ enum: TariffPlanTypesEnum })
  @IsEnum(TariffPlanTypesEnum)
  type: TariffPlanTypesEnum;

  @ApiProperty({ required: false, nullable: true })
  @IsId({ nullable: true })
  accountId?: IdType;
}
