import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';

export class DeviceTypesResponse extends WithArrayResponse(
  DeviceTypeResponse,
) {}
