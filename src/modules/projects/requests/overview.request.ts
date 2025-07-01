import { ApiProperty } from '@nestjs/swagger';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class OverviewRequest {
  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiProperty({ enum: DeviceTypesEnum })
  @IsEnum(DeviceTypesEnum)
  deviceType: DeviceTypesEnum;
}
