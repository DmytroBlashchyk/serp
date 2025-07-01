import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';

export class GetProjectRequest {
  @ApiProperty({ enum: DeviceTypesEnum, required: true, nullable: true })
  @IsEnum(DeviceTypesEnum)
  @IsOptional()
  keywordDeviceType: DeviceTypesEnum;

  @ApiProperty({ enum: BooleanEnum, required: false, nullable: true })
  @IsEnum(BooleanEnum)
  @IsOptional()
  tags: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum, required: false, nullable: true })
  @IsEnum(BooleanEnum)
  @IsOptional()
  notes: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ enum: BooleanEnum, required: false, nullable: true })
  @IsEnum(BooleanEnum)
  @IsOptional()
  keywordTags: BooleanEnum = BooleanEnum.FALSE;
}
