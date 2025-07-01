import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { EmailResponse } from 'modules/triggers/responses/email.response';
import { Type } from 'class-transformer';

export class CreateTriggerRequest {
  @ApiProperty({ enum: TriggerTypeEnum })
  @IsEnum(TriggerTypeEnum)
  triggerType: TriggerTypeEnum;

  @ApiProperty({ enum: TriggerRuleEnum })
  @IsEnum(TriggerRuleEnum)
  triggerRule: TriggerRuleEnum;

  @ApiProperty()
  @IsId()
  projectId: IdType;

  @ApiProperty({ isArray: true })
  @IsId({ each: true, nullable: true })
  keywordIds?: IdType[];

  @ApiProperty({ required: false, isArray: true, type: EmailResponse })
  @IsArray()
  @IsObject({ each: true, context: EmailResponse })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EmailResponse)
  emails?: EmailResponse[];

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(100)
  threshold: number;
}
