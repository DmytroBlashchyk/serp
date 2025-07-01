import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { IdProperty } from 'modules/common/decorators/id-property';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';

export class ProjectKeywordRequest extends BaseResponse<ProjectKeywordRequest> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty({ cls: DeviceTypeResponse })
  deviceType: DeviceTypeResponse;
}
