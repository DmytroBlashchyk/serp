import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { ContentResponse } from 'modules/folders/responses/content.response';

export class FolderContentsResponse extends WithPaginatedResponse(
  ContentResponse,
) {}
