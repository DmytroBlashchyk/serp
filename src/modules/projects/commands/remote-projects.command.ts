import { IdType } from 'modules/common/types/id-type.type';

export class RemoteProjectsCommand {
  constructor(
    public readonly accountId: IdType,
    public readonly projectIds: IdType[],
  ) {}
}
