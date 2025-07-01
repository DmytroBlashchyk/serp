import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { CheckFrequencyResponse } from 'modules/check-frequency/responses/check-frequency.response';

export class CheckFrequenciesResponse extends WithArrayResponse(
  CheckFrequencyResponse,
) {}
