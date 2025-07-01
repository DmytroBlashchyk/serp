import { IdType } from 'modules/common/types/id-type.type';

export interface KeywordsAlertsToEmailsForGoogleLocalType {
  affected: string;
  businessName: string;
  businessUrl: string;
  actionUrl: string;
  alertKeywordsLink: string;
  linkToAlerts: string;
  projectName: string;
  location: string;
  rule: string;
  alertId: IdType;
  threshold: string;
  date: string;
  previousDate: string;
  currentDate: string;
  numberOfRemainingKeywords: string;
}
