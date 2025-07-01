import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TriggerRuleResponse } from 'modules/triggers/responses/trigger-rule.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class AlertInfoResponse extends BaseResponse<AlertInfoResponse> {
  @ResponseProperty()
  date: Date;

  @IdProperty()
  id: IdType;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty()
  favicon?: string;

  @ResponseProperty()
  url: string;

  @ResponseProperty({ cls: TriggerRuleResponse })
  rule: TriggerRuleResponse;

  @QuantityProperty()
  threshold: number;

  @QuantityProperty()
  affectedKeywords: number;
}
