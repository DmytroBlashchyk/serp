import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyStringDecorator } from 'modules/common/decorators/is-not-empty-string.decorator';
import { IsValidRealDomain } from 'modules/common/decorators/is-valid-real-domain.decorator';
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
import { IsValidKeyword } from 'modules/common/decorators/is-valid-keyword.decorator';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdLiteralType, IdType } from 'modules/common/types/id-type.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { IsValidBusinessName } from 'modules/common/decorators/is-valid-business-name.decorator';
import { ToLowerCase } from 'modules/common/decorators/to-lower-case.decorator';
import { Type } from 'class-transformer';
import { CompetitorBusinessRequest } from 'modules/projects/requests/competitor-business.request';

export class CreateProjectForGoogleLocalRequest {
  @ApiProperty()
  @IsNotEmptyStringDecorator({
    invalidErrorMessage: 'Project name is invalid.',
    requiredErrorMessage: 'Project name is required.',
  })
  projectName: string;

  @ApiProperty()
  @IsValidBusinessName()
  businessName: string;

  @ApiProperty()
  @ToLowerCase()
  @IsValidRealDomain({ nullable: false, each: false })
  @IsOptional()
  businessUrl?: string;

  @ApiProperty({ isArray: true })
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'Please enter at least one keyword' })
  @ArrayMaxSize(1000)
  @IsValidKeyword({ nullable: false, each: true })
  @MaxLength(700, {
    each: true,
    message:
      'Keywords must not exceed 700 characters. Please reduce the length of keywords exceeding this limit.',
  })
  @MinLength(1, { each: true })
  keywords: string[];

  @ApiProperty({ required: false })
  @IsId()
  locationId: IdType;

  @ApiProperty()
  @IsId()
  languageId: IdType;

  @ApiProperty({ enum: CheckFrequencyEnum })
  @IsEnum(CheckFrequencyEnum)
  checkFrequency: CheckFrequencyEnum;

  @ApiProperty({ required: false, type: [CompetitorBusinessRequest] })
  @ValidateNested({ each: true })
  @Type(() => CompetitorBusinessRequest)
  @IsOptional()
  competitors?: CompetitorBusinessRequest[];

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
}
