import { IdType } from 'modules/common/types/id-type.type';
import { BaseResponse } from 'modules/common/responses/base.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { AvailableProjectResponse } from 'modules/projects/responses/available-project.response';
import { SharedLinkTypeResponse } from 'modules/shared-links/responses/shared-link-type.response';
import { SharedLinkSettingResponse } from 'modules/shared-links/responses/shared-link-setting.response';

export class SingleSharedLinkResponse extends BaseResponse<SingleSharedLinkResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  enableSharing: boolean;

  @ResponseProperty()
  requirePassword: boolean;

  @ResponseProperty()
  link: string;

  @ResponseProperty({ each: true, cls: AvailableProjectResponse })
  projects: AvailableProjectResponse[];

  @ResponseProperty({ cls: SharedLinkTypeResponse })
  type: SharedLinkTypeResponse;

  @ResponseProperty({ cls: SharedLinkSettingResponse })
  settings: SharedLinkSettingResponse;
}
