import { IdType } from 'modules/common/types/id-type.type';

export interface NoteType {
  accountId: IdType;
  projectId: IdType;
  noteId: IdType;
  userId: IdType;
}
