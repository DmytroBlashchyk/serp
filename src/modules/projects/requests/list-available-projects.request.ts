import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListAvailableProjectsRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsString()
  @IsOptional()
  search?: string;
}
