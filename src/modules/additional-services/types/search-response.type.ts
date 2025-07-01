import { OrganicResultType } from 'modules/additional-services/types/organic-result.type';
import { SearchParametersType } from 'modules/additional-services/types/search-parameters.type';

export interface SearchResponseType {
  organic_results: OrganicResultType[];
  search_parameters: SearchParametersType;
}
