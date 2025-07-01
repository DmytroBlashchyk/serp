import { IdType } from 'modules/common/types/id-type.type';

export class UpdateDataForProjectsCommand {
  constructor(public readonly projectId: IdType) {}
}
