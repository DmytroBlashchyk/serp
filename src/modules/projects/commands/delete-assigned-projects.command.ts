import { IdType } from 'modules/common/types/id-type.type';

export class DeleteAssignedProjectsCommand {
  constructor(public readonly projectIds: IdType[]) {}
}
