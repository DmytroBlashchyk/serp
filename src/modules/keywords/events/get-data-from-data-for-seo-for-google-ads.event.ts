import { IdType } from 'modules/common/types/id-type.type';

export class GetDataFromDataForSeoForGoogleAdsEvent {
  readonly keywordIds: IdType[];
  readonly projectId: IdType;
  constructor(data: GetDataFromDataForSeoForGoogleAdsEvent) {
    Object.assign(this, data);
  }
}
