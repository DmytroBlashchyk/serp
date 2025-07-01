import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class LocationResponse extends BaseResponse<LocationResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  locationName: string;
}
