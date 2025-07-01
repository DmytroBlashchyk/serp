import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

export class SearchEngineResponse extends WithEnumDto(SearchEnginesEnum) {}
