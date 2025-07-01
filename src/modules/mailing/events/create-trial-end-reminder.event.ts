import { EmailUserType } from 'modules/mailing/types/email-user.type';

export class CreateTrialEndReminderEvent {
  readonly users: EmailUserType[];
  constructor(data: CreateTrialEndReminderEvent) {
    Object.assign(this, data);
  }
}
