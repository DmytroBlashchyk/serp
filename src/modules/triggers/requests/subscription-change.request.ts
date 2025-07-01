import { IsBoolean, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionChangeRequest {
  @ApiProperty()
  @IsString()
  RecordType: string;

  @ApiProperty()
  @IsString()
  MessageID: string;

  @ApiProperty()
  @IsString()
  MessageStream: string;

  @ApiProperty()
  @IsString()
  ChangedAt: Date;

  @ApiProperty()
  @IsEmail()
  Recipient: string;

  @ApiProperty()
  @IsString()
  Origin: string;

  @ApiProperty()
  @IsBoolean()
  SuppressSending: boolean;
}
