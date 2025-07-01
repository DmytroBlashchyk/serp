import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class NoteResponse extends BaseResponse<NoteResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  text: string;

  @ResponseProperty()
  date: Date;

  @ResponseProperty()
  dateFullFormat: string;

  @ResponseProperty({ nullable: true })
  author?: string;

  @IdProperty({ nullable: true, each: false })
  projectId?: IdType;

  @ResponseProperty({ nullable: true })
  editOption?: boolean;
}
