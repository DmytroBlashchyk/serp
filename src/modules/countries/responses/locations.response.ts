import { LocationResponse } from 'modules/countries/responses/location.response';
import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';

export class LocationsResponse extends WithPaginatedResponse(
  LocationResponse,
) {}
