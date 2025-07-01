import { EmailUserType } from 'modules/mailing/types/email-user.type';

export class CreateTrialEndReminderCommand {
  constructor(public readonly users: EmailUserType[]) {}
}
