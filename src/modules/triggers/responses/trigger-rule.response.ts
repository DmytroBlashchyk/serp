import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';

export class TriggerRuleResponse extends WithEnumDto(TriggerRuleEnum) {}
