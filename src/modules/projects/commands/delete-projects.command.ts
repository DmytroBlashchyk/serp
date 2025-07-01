import { IdType } from 'modules/common/types/id-type.type';

export class DeleteProjectsCommand {
  constructor(
    public readonly accountId: IdType,
    public readonly projectIds: IdType[],
  ) {}
}
