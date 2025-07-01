import { IdType } from 'modules/common/types/id-type.type';

export class CreateTriggerInitializationCommand {
  constructor(public readonly keywordIds: IdType[]) {}
}
