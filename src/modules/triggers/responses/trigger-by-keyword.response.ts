import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TriggerRuleResponse } from 'modules/triggers/responses/trigger-rule.response';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class TriggerByKeywordResponse extends BaseResponse<TriggerByKeywordResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @ResponseProperty({ cls: TriggerRuleResponse })
  rule: TriggerRuleResponse;

  @QuantityProperty()
  threshold: number;

  @QuantityProperty()
  keywordCount: number;
}
