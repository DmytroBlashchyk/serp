import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenRequest {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
