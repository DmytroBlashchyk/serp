import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { KeywordPositionInfoResponse } from 'modules/keywords/responses/keyword-position-info.response';

export class PaginatedKeywordPositionsInfoResponse extends WithPaginatedResponse(
  KeywordPositionInfoResponse,
) {}
