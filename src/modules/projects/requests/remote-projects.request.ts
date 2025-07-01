import { IdType } from 'modules/common/types/id-type.type';
import { IsId } from 'modules/common/decorators/is-id.decorator';

export class RemoteProjectsRequest {
  @IsId()
  accountId: IdType;

  @IsId({ each: true })
  projectIds: IdType[];
}
