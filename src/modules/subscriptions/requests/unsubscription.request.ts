import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TypesOfReasonsForUnsubscriptionEnum } from 'modules/subscriptions/enums/types-of-reasons-for-unsubscription.enum';

export class UnsubscriptionRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsString()
  reason?: string;

  @ApiProperty({ enum: TypesOfReasonsForUnsubscriptionEnum })
  @IsEnum(TypesOfReasonsForUnsubscriptionEnum)
  typeOfReason: TypesOfReasonsForUnsubscriptionEnum;
}
