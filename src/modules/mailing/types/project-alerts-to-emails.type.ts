import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface ProjectAlertsToEmailsType {
  projectName: string;
  domain: string;
  location: string;
  affected: string;
  rule: TriggerRuleEnum;
  threshold: string;
  date: string;
  linkToAlertByProduct: string;
  deviceType: DeviceTypesEnum;
  actionUrl: string;
  linkToListOfTriggeredAlert: string;
}
