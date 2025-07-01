import { Top100Response } from 'modules/additional-services/responses/top-100.response';
import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';

export class Top100ItemsResponse extends WithPaginatedResponse(
  Top100Response,
) {}
