import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';

export class CheckFrequencyResponse extends WithEnumDto(CheckFrequencyEnum) {}
