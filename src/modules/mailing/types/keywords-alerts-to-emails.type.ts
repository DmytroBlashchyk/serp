import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { IdType } from 'modules/common/types/id-type.type';
export interface KeywordsAlertsToEmailsType {
  affected: string;
  domain: string;
  location: string;
  rule: TriggerRuleEnum;
  threshold: string;
  date: string;
  alertId: IdType;
  previousDate: string;
  currentDate: string;
  numberOfRemainingKeywords: string;
  actionUrl: string;
  projectName: string;
  linkToAlerts: string;
  alertKeywordsLink: string;
}
