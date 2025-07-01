import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';
import { EmailReportFrequencyEnum } from 'modules/email-reports/enums/email-report-frequency.enum';
import { ReportTypeEnum } from 'modules/email-reports/enums/report-type.enum';

export class CreateEmailReportRequest {
  @ApiProperty()
  @IsId()
  projectId: IdType;

  @ApiProperty({ isArray: true, type: String })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  recipients: string[];

  @ApiProperty({ enum: EmailReportFrequencyEnum })
  @IsEnum(EmailReportFrequencyEnum)
  frequency: EmailReportFrequencyEnum;

  @ApiProperty({ enum: ReportTypeEnum })
  @IsEnum(ReportTypeEnum)
  reportType: ReportTypeEnum;

  @ApiProperty()
  @IsId()
  reportDeliveryTimeId: IdType;
}
