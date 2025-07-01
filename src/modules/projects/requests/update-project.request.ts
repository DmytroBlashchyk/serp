import { ApiProperty } from '@nestjs/swagger';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { IsValidKeyword } from 'modules/common/decorators/is-valid-keyword.decorator';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { IsNotEmptyStringDecorator } from 'modules/common/decorators/is-not-empty-string.decorator';
import { IsValidRealDomain } from 'modules/common/decorators/is-valid-real-domain.decorator';
import { CompetitorBusinessRequest } from 'modules/projects/requests/competitor-business.request';
import { Type } from 'class-transformer';

export class UpdateProjectRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsNotEmptyStringDecorator({
    invalidErrorMessage: 'Project name is invalid.',
    requiredErrorMessage: 'Project name is required.',
  })
  @IsOptional()
  projectName?: string;

  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ enum: CheckFrequencyEnum, required: false, nullable: true })
  @IsEnum(CheckFrequencyEnum)
  @IsOptional()
  checkFrequency?: CheckFrequencyEnum;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsValidRealDomain({ nullable: true, each: true })
  @IsOptional()
  competitors?: string[];

  @ApiProperty({ required: false, type: [CompetitorBusinessRequest] })
  @ValidateNested({ each: true })
  @Type(() => CompetitorBusinessRequest)
  @IsOptional()
  businessCompetitors?: CompetitorBusinessRequest[];

  @ApiProperty({ isArray: true, required: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  competitorIds: IdType[];

  @ApiProperty({ required: false, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  tags?: string[];

  @ApiProperty({ required: false, isArray: true })
  @IsId({ nullable: true, each: true })
  tagIds?: IdType[];

  @ApiProperty({ required: false })
  @IsNotEmptyStringDecorator({
    invalidErrorMessage: 'Note is invalid.',
    requiredErrorMessage: 'Note is required.',
  })
  @IsOptional()
  note?: string;

  @ApiProperty({ isArray: true, required: false, nullable: true })
  @IsString({ each: true })
  @IsValidKeyword({ nullable: true, each: true })
  @ArrayMaxSize(1000)
  @MaxLength(700, {
    each: true,
    message:
      'Keywords must not exceed 700 characters. Please reduce the length of keywords exceeding this limit.',
  })
  @MinLength(1, { each: true })
  @IsOptional()
  keywords?: string[];

  @ApiProperty({ enum: DeviceTypesEnum, required: false, nullable: true })
  @IsEnum(DeviceTypesEnum)
  @IsOptional()
  deviceType?: DeviceTypesEnum;
}
