import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { FolderResponse } from 'modules/folders/responses/folder.response';

export class FoldersResponse extends WithArrayResponse(FolderResponse) {}
