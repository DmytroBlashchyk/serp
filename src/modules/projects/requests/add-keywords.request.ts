import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { IsValidKeyword } from 'modules/common/decorators/is-valid-keyword.decorator';

export class AddKeywordsRequest {
  @ApiProperty({ isArray: true })
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @IsValidKeyword({ nullable: false, each: true })
  @MaxLength(700, {
    each: true,
    message:
      'Keywords must not exceed 700 characters. Please reduce the length of keywords exceeding this limit.',
  })
  @MinLength(1, { each: true })
  keywords: string[];

  @ApiProperty({ enum: DeviceTypesEnum })
  @IsEnum(DeviceTypesEnum)
  deviceType: DeviceTypesEnum;

  @ApiProperty({ required: false, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false, isArray: true })
  @IsId({ nullable: true, each: true })
  tagIds?: IdType[];
}
