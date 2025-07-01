import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { KeywordRankingResponse } from 'modules/keywords/responses/keyword-ranking.response';

export class KeywordRankingsResponse extends WithPaginatedResponse(
  KeywordRankingResponse,
) {}
