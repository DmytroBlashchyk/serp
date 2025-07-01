import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { ImprovedVsDeclinedResponse } from 'modules/projects/responses/improved-vs-declined.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class ImprovedVsDeclinedArrayResponse extends WithArrayResponse(
  ImprovedVsDeclinedResponse,
) {}
