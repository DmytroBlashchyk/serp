import { ApiProperty } from '@nestjs/swagger';
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
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { EmailResponse } from 'modules/triggers/responses/email.response';
import { Type } from 'class-transformer';

export class UpdateKeywordsTriggerRequest {
  @ApiProperty({ enum: TriggerRuleEnum, nullable: true, required: false })
  @IsEnum(TriggerRuleEnum)
  @IsOptional()
  triggerRule?: TriggerRuleEnum;

  @ApiProperty({ isArray: true })
  @IsId({ each: true })
  keywordIds: IdType[];

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
