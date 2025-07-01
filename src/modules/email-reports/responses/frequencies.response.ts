import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { FrequencyResponse } from 'modules/email-reports/responses/frequency.response';

export class FrequenciesResponse extends WithArrayResponse(FrequencyResponse) {}
