import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { TriggerTypeResponse } from 'modules/triggers/responses/trigger-type.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TriggerRuleResponse } from 'modules/triggers/responses/trigger-rule.response';
import { AvailableProjectResponse } from 'modules/projects/responses/available-project.response';
import { KeywordResponse } from 'modules/keywords/responses/keyword.response';
import { BaseResponse } from 'modules/common/responses/base.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';
import { RecipientResponse } from 'modules/triggers/responses/recipient.response';

export class TriggerResponse extends BaseResponse<TriggerResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty({ cls: TriggerTypeResponse })
  type: TriggerTypeResponse;

  @ResponseProperty({ cls: TriggerRuleResponse })
  rule: TriggerRuleResponse;

  @ResponseProperty({ cls: AvailableProjectResponse })
  project: AvailableProjectResponse;

  @ResponseProperty({ cls: KeywordResponse })
  keywords: KeywordResponse;

  @QuantityProperty()
  threshold: number;

  @ResponseProperty({ each: true, nullable: true, cls: RecipientResponse })
  recipients?: RecipientResponse[];

  @QuantityProperty()
  totalKeywords: number;
}
