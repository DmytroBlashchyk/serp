import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { IsValidPassword } from 'modules/common/decorators/is-valid-password.decorators';

export class CreateRequest {
  @ApiProperty({ nullable: true, required: false })
  @IsId({ each: true, nullable: false })
  projectIds?: IdType[];

  @ApiProperty({ nullable: true, required: false })
  @IsId({ each: true, nullable: true })
  folderIds?: IdType[];

  @ApiProperty()
  @IsBoolean()
  enableSharing: boolean;

  @ApiProperty()
  @IsBoolean()
  requiredPassword: boolean;

  @ApiProperty()
  @IsValidPassword()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsBoolean()
  position: boolean;

  @ApiProperty()
  @IsBoolean()
  oneDayChange: boolean;

  @ApiProperty()
  @IsBoolean()
  sevenDayChange: boolean;

  @ApiProperty()
  @IsBoolean()
  thirtyDayChange: boolean;

  @ApiProperty()
  @IsBoolean()
  startingRank: boolean;

  @ApiProperty()
  @IsBoolean()
  bestRank: boolean;

  @ApiProperty()
  @IsBoolean()
  lifeTimeChange: boolean;

  @ApiProperty()
  @IsBoolean()
  volume: boolean;

  @ApiProperty()
  @IsBoolean()
  url: boolean;

  @ApiProperty()
  @IsBoolean()
  updated: boolean;
}
