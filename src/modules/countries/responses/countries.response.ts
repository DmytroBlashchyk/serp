import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { CountryResponse } from 'modules/countries/responses/country.response';

export class CountriesResponse extends WithArrayResponse(CountryResponse) {}
