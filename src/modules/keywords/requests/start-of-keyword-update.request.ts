import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class StartOfKeywordUpdateRequest {
  @IsId({ nullable: false, each: true })
  keywordIds: IdType[];
}
