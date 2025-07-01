import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { MyFolderResponse } from 'modules/folders/responses/my-folder.response';

export class MyFoldersResponse extends WithPaginatedResponse(
  MyFolderResponse,
) {}
