import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export class CreateKeywordsForYoutubeEvent {
  readonly keywords: string[];
  readonly projectId: IdType;
  readonly accountId: IdType;
  readonly deviceTypeName: DeviceTypesEnum;
  readonly tagIds?: IdType[];

  constructor(data: CreateKeywordsForYoutubeEvent) {
    Object.assign(this, data);
  }
}
