import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';

export class GetAlertProjectsRequest {
  @ApiProperty({ enum: TriggerTypeEnum, required: false, nullable: false })
  @IsOptional()
  @IsEnum(TriggerTypeEnum)
  type?: TriggerTypeEnum;
}
