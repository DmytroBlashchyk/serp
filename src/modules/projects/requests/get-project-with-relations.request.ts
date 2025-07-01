import { IsEnum, IsOptional } from 'class-validator';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { ApiProperty } from '@nestjs/swagger';

export class GetProjectWithRelationsRequest {
  @ApiProperty({ nullable: true, required: false, enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  @IsOptional()
  deviceType?: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ nullable: true, required: false, enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  @IsOptional()
  tags?: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ nullable: true, required: false, enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  @IsOptional()
  frequency?: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ nullable: true, required: false, enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  @IsOptional()
  region?: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ nullable: true, required: false, enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  @IsOptional()
  language?: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ nullable: true, required: false, enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  @IsOptional()
  searchEngine?: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ nullable: true, required: false, enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  @IsOptional()
  competitors?: BooleanEnum = BooleanEnum.FALSE;

  @ApiProperty({ nullable: true, required: false, enum: BooleanEnum })
  @IsEnum(BooleanEnum)
  @IsOptional()
  notes?: BooleanEnum = BooleanEnum.FALSE;
}
