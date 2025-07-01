import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { SharedLinkTypeResponse } from 'modules/shared-links/responses/shared-link-type.response';
import { AvailableProjectResponse } from 'modules/projects/responses/available-project.response';

export class SharedLinkResponse extends BaseResponse<SharedLinkResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  created: string;

  @ResponseProperty()
  createdFullFormat: string;

  @ResponseProperty({ cls: SharedLinkTypeResponse })
  type: SharedLinkTypeResponse;

  @ResponseProperty()
  lastViewed: string;

  @ResponseProperty()
  lastViewedFullFormat: string;

  @ResponseProperty()
  link: string;

  @ResponseProperty()
  enableSharing: boolean;

  @ResponseProperty()
  requirePassword: boolean;

  @ResponseProperty({ each: true, cls: AvailableProjectResponse })
  projects: AvailableProjectResponse[];
}
