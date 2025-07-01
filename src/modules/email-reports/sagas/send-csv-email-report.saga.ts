import { Injectable } from '@nestjs/common';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { concatAll, map } from 'rxjs/operators';
import { SendCsvEmailReportEvent } from 'modules/email-reports/events/send-csv-email-report.event';
import { SendCsvEmailReportCommand } from 'modules/email-reports/commands/send-csv-email-report.command';

@Injectable()
export class SendCsvEmailReportSaga {
  /**
   * sendCsvEmailReportBySaga is an observable function that listens for
   * SendCsvEmailReportEvent events and maps them to SendCsvEmailReportCommand commands.
   *
   * @param {Observable<SendCsvEmailReportEvent>} events - The observable stream of SendCsvEmailReportEvent events.
   * @returns {Observable<ICommand>} An observable stream of ICommand instances generated from the events.
   */
  @Saga()
  sendCsvEmailReportBySaga = (
    events: Observable<SendCsvEmailReportEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(SendCsvEmailReportEvent),
        map(async (event) => {
          return new SendCsvEmailReportCommand(
            event.projectId,
            event.recipients,
            event.emailReportId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
