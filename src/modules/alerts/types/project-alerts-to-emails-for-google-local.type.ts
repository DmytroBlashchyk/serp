import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface ProjectAlertsToEmailsForGoogleLocalType {
  projectName: string;
  businessName: string;
  businessUrl?: string;
  location: string;
  affected: string;
  rule: string;
  threshold: string;
  date: string;
  linkToAlertByProduct: string;
  linkToListOfTriggeredAlert: string;
  deviceType: DeviceTypesEnum;
  actionUrl: string;
}
