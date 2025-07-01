import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { IsImageFile } from 'modules/common/decorators/is-image-file.decorator';

export class ChangeAccountBrandingRequest {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  companyUrl: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tagline: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  twitterLink: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  facebookLink: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  linkedinLink: string;

  @ApiProperty({ required: false })
  @IsEnum(BooleanEnum)
  @IsOptional()
  emailReports: BooleanEnum;

  @ApiProperty({ required: false })
  @IsEnum(BooleanEnum)
  @IsOptional()
  sharedLinks: BooleanEnum;

  @ApiProperty({ required: false })
  @IsEnum(BooleanEnum)
  @IsOptional()
  validatedBySerpnest: BooleanEnum;

  @IsImageFile({
    nullable: true,
    validationOptions: {
      message: 'A companyLogo image must be in SVG, PNG, JPG or GIF format',
    },
  })
  companyLogo: Express.Multer.File;
}
