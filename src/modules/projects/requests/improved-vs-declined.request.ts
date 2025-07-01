import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';

export class ImprovedVsDeclinedRequest {
  @ApiProperty({ enum: TemporalFiltersEnum })
  @IsEnum(TemporalFiltersEnum)
  period: TemporalFiltersEnum;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  improvedFilter: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  declinedFilter: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  lostFilter: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  noChange: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: DeviceTypesEnum })
  @IsEnum(DeviceTypesEnum)
  deviceType: DeviceTypesEnum;
}
