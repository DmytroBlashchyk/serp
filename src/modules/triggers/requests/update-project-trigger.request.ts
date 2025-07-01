import { ApiProperty } from '@nestjs/swagger';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { EmailResponse } from 'modules/triggers/responses/email.response';
import { Type } from 'class-transformer';

export class UpdateProjectTriggerRequest {
  @ApiProperty({ enum: TriggerRuleEnum, nullable: true, required: false })
  @IsEnum(TriggerRuleEnum)
  @IsOptional()
  triggerRule?: TriggerRuleEnum;

  @ApiProperty({
    required: false,
    isArray: true,
    type: EmailResponse,
    nullable: true,
  })
  @IsArray({ message: 'emails must be an array' })
  @ArrayMinSize(1, {
    message: 'emails array must contain at least one element',
  })
  @ValidateNested({ each: true })
  @Type(() => EmailResponse)
  emails?: EmailResponse[];

  @ApiProperty({ nullable: true, required: false })
  @IsNumber()
  @IsOptional()
  threshold: number;
}
