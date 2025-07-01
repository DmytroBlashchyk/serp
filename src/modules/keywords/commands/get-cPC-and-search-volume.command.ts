import { IdType } from 'modules/common/types/id-type.type';

export class GetCPCAndSearchVolumeCommand {
  constructor(
    public readonly keywordIds: IdType[],
    public readonly projectId: IdType,
  ) {}
}
