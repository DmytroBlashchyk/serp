import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export class ProjectPerformanceRequest {
  @ApiProperty({ enum: TemporalFiltersEnum })
  @IsEnum(TemporalFiltersEnum)
  period: TemporalFiltersEnum;

  @ApiProperty({ isArray: true })
  @IsId({ each: true, nullable: true })
  competitorIds?: IdType[];

  @ApiProperty({ enum: DeviceTypesEnum, default: DeviceTypesEnum.Desktop })
  @IsEnum(DeviceTypesEnum)
  deviceType: DeviceTypesEnum = DeviceTypesEnum.Desktop;
}
