import { IdType } from 'modules/common/types/id-type.type';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { EmailResponse } from 'modules/triggers/responses/email.response';

export interface UpdateProjectTriggerType {
  accountId: IdType;
  triggerId: IdType;
  userId: IdType;
  triggerRule?: TriggerRuleEnum;
  emails?: EmailResponse[];
  threshold: number;
}
