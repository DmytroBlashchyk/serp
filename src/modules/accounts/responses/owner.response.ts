import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';

export class OwnerResponse extends BaseResponse<OwnerResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  ownerUserFirstName: string;

  @ResponseProperty()
  ownerUserLastName: string;

  @ResponseProperty()
  ownerEmail: string;
}
