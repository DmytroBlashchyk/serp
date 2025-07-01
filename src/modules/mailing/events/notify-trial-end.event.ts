import { EmailUserType } from 'modules/mailing/types/email-user.type';

export class NotifyTrialEndEvent {
  readonly users: EmailUserType[];
  constructor(data: NotifyTrialEndEvent) {
    Object.assign(this, data);
  }
}
