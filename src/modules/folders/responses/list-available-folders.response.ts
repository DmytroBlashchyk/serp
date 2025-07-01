import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { AvailableFolderResponse } from 'modules/folders/responses/available-folder.response';

export class ListAvailableFoldersResponse extends WithArrayResponse(
  AvailableFolderResponse,
) {}
