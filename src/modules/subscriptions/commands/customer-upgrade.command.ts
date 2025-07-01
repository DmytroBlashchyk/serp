import { IdType } from 'modules/common/types/id-type.type';

export class CustomerUpgradeCommand {
  constructor(
    public readonly userId: IdType,
    public readonly newEmail: string,
  ) {}
}
