import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { CreateTrialEndReminderEvent } from 'modules/mailing/events/create-trial-end-reminder.event';
import { CreateTrialEndReminderCommand } from 'modules/mailing/commands/create-trial-end-reminder.command';
import { NotifyTrialEndEvent } from 'modules/mailing/events/notify-trial-end.event';
import { NotifyTrialEndCommand } from 'modules/mailing/commands/notify-trial-end.command';

@Injectable()
export class MailingSaga {
  /**
   * Handles the creation of trial end reminders based on incoming events.
   *
   * @param {Observable<CreateTrialEndReminderEvent>} events - An observable stream of CreateTrialEndReminderEvent instances.
   * @returns {Observable<ICommand>} An observable stream of ICommand instances resulting from the mapping of events.
   */
  @Saga()
  createTrialEndReminderBySaga = (
    events: Observable<CreateTrialEndReminderEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateTrialEndReminderEvent),
        map(async (event) => {
          return new CreateTrialEndReminderCommand(event.users);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * notifyTrialEndBySaga listens for NotifyTrialEndEvent events and transforms them
   * into NotifyTrialEndCommand commands.
   *
   * @param {Observable<NotifyTrialEndEvent>} events - The stream of NotifyTrialEndEvent events.
   * @return {Observable<ICommand>} An observable stream of ICommand objects.
   */
  @Saga()
  notifyTrialEndBySaga = (
    events: Observable<NotifyTrialEndEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(NotifyTrialEndEvent),
        map(async (event) => {
          return new NotifyTrialEndCommand(event.users);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
