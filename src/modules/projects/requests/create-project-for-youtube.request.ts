import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyStringDecorator } from 'modules/common/decorators/is-not-empty-string.decorator';
import { ToLowerCase } from 'modules/common/decorators/to-lower-case.decorator';
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
  Validate,
} from 'class-validator';
import { IsValidKeyword } from 'modules/common/decorators/is-valid-keyword.decorator';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { IsYoutubeVideo } from 'modules/common/decorators/is-youtube-video.decorator';

export class CreateProjectForYoutubeRequest {
  @ApiProperty()
  @IsNotEmptyStringDecorator({
    invalidErrorMessage: 'Project name is invalid.',
    requiredErrorMessage: 'Project name is required.',
  })
  projectName: string;

  @ApiProperty()
  @Validate(IsYoutubeVideo)
  videoUrl: string;

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

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @Validate(IsYoutubeVideo)
  @IsOptional()
  competitorsVideoUrl?: string[];

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
