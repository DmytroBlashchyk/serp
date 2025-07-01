import { ApiProperty } from '@nestjs/swagger';
import { ToLowerCase } from 'modules/common/decorators/to-lower-case.decorator';
import { IsValidRealDomain } from 'modules/common/decorators/is-valid-real-domain.decorator';
import { IsOptional } from 'class-validator';
import { IsValidBusinessName } from 'modules/common/decorators/is-valid-business-name.decorator';

export class CompetitorBusinessRequest {
  @ApiProperty()
  @IsValidBusinessName()
  competitorBusinessName: string;

  @ApiProperty()
  @ToLowerCase()
  @IsValidRealDomain({ nullable: false, each: false })
  @IsOptional()
  competitorUrl?: string;
}
