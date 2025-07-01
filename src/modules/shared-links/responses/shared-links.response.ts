import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { SharedLinkResponse } from 'modules/shared-links/responses/shared-link.response';

export class SharedLinksResponse extends WithPaginatedResponse(
  SharedLinkResponse,
) {}
