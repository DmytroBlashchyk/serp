import { IdType } from 'modules/common/types/id-type.type';

export interface GetMyFoldersType {
  id: IdType;
  created_at: Date;
  updated_at: Date;
  name: string;
  nsleft: number;
  nsright: number;
  parent_id: IdType;
  account_id: IdType;
  owner_id: IdType;
  owner_name: string;
  keyword_count: number;
}
