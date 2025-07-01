import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { AlertViewEvent } from 'modules/alerts/events/alert-view.event';
import { AlertViewCommand } from 'modules/alerts/commands/alert-view.command';
import { CreateAlertEvent } from 'modules/alerts/events/create-alert.event';
import { CreateAlertsCommand } from 'modules/alerts/commands/create-alerts.command';

@Injectable()
export class AlertSaga {
  /**
   * Function to convert a stream of AlertViewEvent events into a stream of ICommand objects.
   *
   * @param {Observable<AlertViewEvent>} events - The source Observable stream of AlertViewEvent objects.
   *
   * @returns {Observable<ICommand>} - An Observable stream of ICommand objects generated from the AlertViewEvent stream.
   */
  @Saga()
  alertViewBySaga = (
    events: Observable<AlertViewEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(AlertViewEvent),
        map(async (event) => {
          return new AlertViewCommand(event.alertId, event.userId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };

  /**
   * A function that listens for `CreateAlertEvent` events and processes them into `CreateAlertsCommand` commands using observables.
   *
   * @param {Observable<CreateAlertEvent>} events - An observable stream of `CreateAlertEvent` events.
   * @returns {Observable<ICommand>} An observable stream of `ICommand` results derived from the input events.
   */
  @Saga()
  createAlertsBySaga = (
    events: Observable<CreateAlertEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(CreateAlertEvent),
        map(async (event) => {
          return new CreateAlertsCommand(event.triggerId);
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
