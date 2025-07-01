import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class RecentlyViewedSearchResponse extends BaseResponse<RecentlyViewedSearchResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty()
  domain: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;
}
