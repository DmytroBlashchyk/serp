import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class AddTagsRequest {
  @ApiProperty({ isArray: true, required: true })
  @IsId({ each: true })
  projectIds: IdType[];

  @ApiProperty({ isArray: true, nullable: true, required: false })
  @IsId({ each: true, nullable: true })
  tagIds?: IdType[];

  @ApiProperty({ required: false, isArray: true })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  tags?: string[];
}
