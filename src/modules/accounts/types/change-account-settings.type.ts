import { UserPayload } from 'modules/common/types/user-payload.type';
import { IdType } from 'modules/common/types/id-type.type';

export interface ChangeAccountSettingsType {
  user: UserPayload;
  firstName: string;
  lastName: string;
  countryId: IdType;
  timezoneId: IdType;
  currentPassword?: string;
  newPassword?: string;
  accountId: IdType;
}
