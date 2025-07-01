import { IsOptional, IsString, MinLength } from 'class-validator';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';
import { ApiProperty } from '@nestjs/swagger';

export class SearchLocationsRequest extends PaginatedQueryRequest {
  @ApiProperty({ required: false })
  @IsString()
  @MinLength(2)
  @IsOptional()
  search?: string;
}
