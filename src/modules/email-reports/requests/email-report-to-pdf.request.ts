import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';

export class EmailReportToPdfRequest {
  @ApiProperty()
  @IsId()
  projectId: IdType;

  @ApiProperty({ enum: TemporalFiltersEnum })
  @IsEnum(TemporalFiltersEnum)
  period: TemporalFiltersEnum;
}
