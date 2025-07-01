import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface AddKeywordsType {
  accountId: IdType;
  projectId: IdType;
  user: UserPayload;
  keywords: string[];
  deviceType: DeviceTypesEnum;
  tags?: string[];
  tagIds?: IdType[];
}
