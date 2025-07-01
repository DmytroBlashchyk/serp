import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { TariffPlanTypesEnum } from 'modules/subscriptions/enums/tariff-plan-types.enum';

export class TariffPlanTypeResponse extends WithEnumDto(TariffPlanTypesEnum) {}
