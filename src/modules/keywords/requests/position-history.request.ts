import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';

export class PositionHistoryRequest {
  @ApiProperty({ enum: TemporalFiltersEnum })
  @IsEnum(TemporalFiltersEnum)
  period: TemporalFiltersEnum;

  @ApiProperty({ isArray: true })
  @IsId({ each: true, nullable: true })
  competitorIds?: IdType[];
}
