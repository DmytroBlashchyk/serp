import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export class CreateKeywordsCommand {
  constructor(
    public readonly projectId: IdType,
    public readonly accountId: IdType,
    public readonly keywords: string[],
    public readonly deviceTypeName: DeviceTypesEnum,
    public readonly tagIds: IdType[],
  ) {}
}
