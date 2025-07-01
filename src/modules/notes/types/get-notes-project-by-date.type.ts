import { IdType } from 'modules/common/types/id-type.type';

export interface GetNotesProjectByDateType {
  projectId: IdType;
  fromDate: string;
  toDate: string;
}
