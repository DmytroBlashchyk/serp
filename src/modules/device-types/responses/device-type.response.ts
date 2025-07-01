import { WithEnumDto } from 'modules/common/mixins/with-enum-dto.mixin';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export class DeviceTypeResponse extends WithEnumDto(DeviceTypesEnum) {}
