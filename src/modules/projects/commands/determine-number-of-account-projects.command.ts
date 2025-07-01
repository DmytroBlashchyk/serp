import { IdType } from 'modules/common/types/id-type.type';

export class DetermineNumberOfAccountProjectsCommand {
  constructor(public readonly accountId: IdType) {}
}
