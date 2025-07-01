import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';

export class UpdateRequest {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  enableSharing?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  requiredPassword?: boolean;

  @ApiProperty()
  @IsValidPassword()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  position?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  oneDayChange?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  sevenDayChange?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  thirtyDayChange?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  startingRank?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  bestRank?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  lifeTimeChange?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  volume?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  url?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  updated?: boolean;

  @ApiProperty({ isArray: true, type: Number, nullable: true, required: false })
  @IsId({ nullable: true, each: true })
  projectIds?: IdType[];
}
