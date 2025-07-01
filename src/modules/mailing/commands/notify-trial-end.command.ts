import { EmailUserType } from 'modules/mailing/types/email-user.type';

export class NotifyTrialEndCommand {
  constructor(public readonly users: EmailUserType[]) {}
}
