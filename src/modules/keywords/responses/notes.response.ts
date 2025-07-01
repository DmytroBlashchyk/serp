import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { NoteResponse } from 'modules/notes/responses/note.response';

export class NotesResponse extends WithArrayResponse(NoteResponse) {}
