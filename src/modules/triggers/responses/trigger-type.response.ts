import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';

export class TriggerTypeResponse extends WithEnumDto(TriggerTypeEnum) {}
