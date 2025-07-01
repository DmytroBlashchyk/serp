import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';

export class KeywordTrendsRequest {
  @ApiProperty({ enum: TemporalFiltersEnum })
  @IsEnum(TemporalFiltersEnum)
  period: TemporalFiltersEnum;

  @ApiProperty({ enum: DeviceTypesEnum })
  @IsEnum(DeviceTypesEnum)
  deviceType: DeviceTypesEnum;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  top3Filter: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  fromFourToTen: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  fromElevenToTwenty: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  fromTwentyOneToFifty: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  fiftyOneToOneHundred: BooleanEnum = BooleanEnum.TRUE;

  @ApiProperty({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  @IsEnum(BooleanEnum)
  notRanked: BooleanEnum = BooleanEnum.TRUE;
}
