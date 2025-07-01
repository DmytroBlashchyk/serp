import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { TimezoneResponse } from 'modules/timezones/responses/timezone.response';

export class TimezonesResponse extends WithArrayResponse(TimezoneResponse) {}
