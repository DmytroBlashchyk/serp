import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { TriggerTypeResponse } from 'modules/triggers/responses/trigger-type.response';

export class TriggerTypesResponse extends WithArrayResponse(
  TriggerTypeResponse,
) {}
