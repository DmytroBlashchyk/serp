import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { EmailResponse } from 'modules/triggers/responses/email.response';

export interface CreateTriggerType {
  accountId: IdType;
  user: UserPayload;
  triggerType: TriggerTypeEnum;
  triggerRule: TriggerRuleEnum;
  projectId: IdType;
  keywordIds?: IdType[];
  emails?: EmailResponse[];
  threshold: number;
}
