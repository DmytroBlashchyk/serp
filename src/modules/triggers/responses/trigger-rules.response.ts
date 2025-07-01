import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { TriggerRuleResponse } from 'modules/triggers/responses/trigger-rule.response';

export class TriggerRulesResponse extends WithArrayResponse(
  TriggerRuleResponse,
) {}
