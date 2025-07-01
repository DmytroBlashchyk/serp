import { BaseResponse } from 'modules/common/responses/base.response';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class CreateTriggerResponse extends BaseResponse<CreateTriggerResponse> {
  @ApiProperty()
  @ResponseProperty()
  duplicateTriggersForKeywordsHaveBeenOmitted: boolean;
}
