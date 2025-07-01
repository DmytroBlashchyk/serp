import { IdType } from 'modules/common/types/id-type.type';

export class GetCPCAndSearchVolumeEvent {
  readonly projectId: IdType;
  keywordIds: IdType[];
  constructor(data: GetCPCAndSearchVolumeEvent) {
    Object.assign(this, data);
  }
}
