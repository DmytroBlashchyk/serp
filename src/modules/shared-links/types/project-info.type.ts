import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';

export interface ProjectInfoType {
  link: string;
  projectId: IdType;
  keywordDeviceType?: DeviceTypesEnum;
  tags: BooleanEnum;
  notes: BooleanEnum;

  keywordTags: BooleanEnum;
}
