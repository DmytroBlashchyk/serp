import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { NoteResponse } from 'modules/notes/responses/note.response';

export class GetNotesResponse extends WithPaginatedResponse(NoteResponse) {}
