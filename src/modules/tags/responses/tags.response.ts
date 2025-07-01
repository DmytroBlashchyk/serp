import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { TagResponse } from 'modules/tags/responses/tag.response';

export class TagsResponse extends WithArrayResponse(TagResponse) {}
