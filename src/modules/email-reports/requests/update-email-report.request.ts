import { IdType } from 'modules/common/types/id-type.type';
import { EmailReportFrequencyEnum } from 'modules/email-reports/enums/email-report-frequency.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReportTypeEnum } from 'modules/email-reports/enums/report-type.enum';

export class UpdateEmailReportRequest {
  @ApiProperty()
  @IsId({ nullable: true })
  projectId?: IdType;

  @ApiProperty({ isArray: true, type: String, nullable: true, required: false })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  recipients?: string[];

  @ApiProperty({
    enum: EmailReportFrequencyEnum,
    nullable: true,
    required: false,
  })
  @IsEnum(EmailReportFrequencyEnum)
  @IsOptional()
  frequency?: EmailReportFrequencyEnum;

  @ApiProperty({ enum: ReportTypeEnum, nullable: true, required: false })
  @IsEnum(ReportTypeEnum)
  @IsOptional()
  reportType?: ReportTypeEnum;

  @ApiProperty({ required: false, nullable: true })
  @IsId({ nullable: true })
  @IsOptional()
  reportDeliveryTimeId?: IdType;
}
