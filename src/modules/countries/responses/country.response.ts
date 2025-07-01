import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';
import { ToLowerCase } from 'modules/common/decorators/to-lower-case.decorator';

export class CountryResponse extends BaseResponse<CountryResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty()
  image: string;

  @ResponseProperty()
  @ToLowerCase()
  code: string;

  @ResponseProperty({ nullable: true })
  location?: string;

  @ResponseProperty()
  emailReport: number;

  @ResponseProperty()
  alert: number;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty()
  url: string;

  @ResponseProperty({ each: true })
  keywords: string[];
}
