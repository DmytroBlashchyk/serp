import { IdType } from 'modules/common/types/id-type.type';

export interface SharedPayloadType {
  id: IdType;
  verification: boolean;
  password: string;
}
