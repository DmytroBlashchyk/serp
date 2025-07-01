import { IdType } from 'modules/common/types/id-type.type';

export class UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent {
  readonly projectId: IdType;
  constructor(data: UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent) {
    Object.assign(this, data);
  }
}
