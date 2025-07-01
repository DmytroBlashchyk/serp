import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';

export class SearchEnginesResponse extends WithArrayResponse(
  SearchEngineResponse,
) {}
