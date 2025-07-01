import { IdType } from 'modules/common/types/id-type.type';

export interface DeleteTriggersByProjectsType {
  accountId: IdType;
  ids: IdType[];
}
