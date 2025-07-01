import { ApiProperty } from '@nestjs/swagger';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { IsEnum } from 'class-validator';

export class KeywordRankingsExportToCsvRequest {
  @ApiProperty({ enum: DeviceTypesEnum, default: DeviceTypesEnum.Desktop })
  @IsEnum(DeviceTypesEnum)
  deviceType: DeviceTypesEnum = DeviceTypesEnum.Desktop;
}
