import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ToNumber } from 'modules/common/decorators/to-number.decorator';

export class Top100Request {
  @ApiProperty({ required: false, nullable: true })
  @IsInt()
  @Min(1)
  @ToNumber()
  @IsOptional()
  page: number;

  @ApiProperty({ required: false, nullable: true })
  @IsInt()
  @Max(100)
  @Min(1)
  @ToNumber()
  limit: number;
}
