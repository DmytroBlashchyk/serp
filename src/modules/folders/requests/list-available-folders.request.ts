import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListAvailableFoldersRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
