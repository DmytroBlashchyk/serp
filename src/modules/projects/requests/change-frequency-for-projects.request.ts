import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { IsEnum } from 'class-validator';

export class ChangeFrequencyForProjectsRequest {
  @ApiProperty()
  @IsId({ each: true })
  projectIds: IdType[];

  @ApiProperty({ enum: CheckFrequencyEnum })
  @IsEnum(CheckFrequencyEnum)
  frequency: CheckFrequencyEnum;
}
