import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { EmailResponse } from 'modules/triggers/responses/email.response';

export interface UpdateTriggerType {
  accountId: IdType;
  triggerId: IdType;
  triggerRule?: TriggerRuleEnum;
  keywordIds: IdType[];
  emails?: EmailResponse[];
  threshold: number;
  userId: IdType;
}
