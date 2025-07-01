import { IdType } from 'modules/common/types/id-type.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class TagsRequest {
  @ApiProperty({ required: false })
  @IsId({ each: true, nullable: true })
  tagIds?: IdType[];
}
