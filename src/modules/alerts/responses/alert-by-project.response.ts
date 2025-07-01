import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TriggerRuleResponse } from 'modules/triggers/responses/trigger-rule.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class AlertByProjectResponse extends BaseResponse<AlertByProjectResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  date: string;

  @ResponseProperty()
  dateFullFormat: string;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @ResponseProperty()
  numberOfKeywords: number;

  @ResponseProperty({ cls: TriggerRuleResponse })
  rule: TriggerRuleResponse;

  @QuantityProperty()
  threshold: number;

  @ResponseProperty()
  viewed: boolean;
}
