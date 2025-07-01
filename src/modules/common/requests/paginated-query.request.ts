import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { ToNumber } from 'modules/common/decorators/to-number.decorator';

export class PaginatedQueryRequest {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @ToNumber()
  page: number;

  @ApiProperty()
  @IsInt()
  @Max(100)
  @Min(1)
  @ToNumber()
  limit: number;
}
