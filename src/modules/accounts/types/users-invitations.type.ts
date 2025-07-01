import { IdType } from 'modules/common/types/id-type.type';

export interface UsersInvitationsType {
  id: IdType;
  email: string;
  username: string | null;
  role_id: IdType | null;
  role_name: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  registered: number;
}
