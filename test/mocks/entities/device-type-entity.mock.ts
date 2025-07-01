import { DeviceTypeEntity } from 'modules/device-types/entities/device-type.entity';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export const deviceTypeDesktopAndMobile = {
  id: 1,
  name: DeviceTypesEnum.DesktopAndMobile,
  keywords: [],
} as DeviceTypeEntity;

export const deviceTypeDesktop = {
  id: 2,
  name: DeviceTypesEnum.Desktop,
  keywords: [],
} as DeviceTypeEntity;

export const deviceTypeMobile = {
  id: 3,
  name: DeviceTypesEnum.Mobile,
  keywords: [],
} as DeviceTypeEntity;
