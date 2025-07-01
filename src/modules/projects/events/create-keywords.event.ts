import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export class CreateKeywordsEvent {
  readonly keywords: string[];
  readonly projectId: IdType;
  readonly accountId: IdType;
  readonly deviceTypeName: DeviceTypesEnum;
  readonly tagIds?: IdType[];

  constructor(data: CreateKeywordsEvent) {
    Object.assign(this, data);
  }
}
