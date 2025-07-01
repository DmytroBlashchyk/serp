import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class AccessResponse extends BaseResponse<AccessResponse> {
  @ResponseProperty({ nullable: true })
  numberOfAvailableProjects: number;

  @ResponseProperty({ nullable: true })
  numberOfAvailableFolders: number;
}
