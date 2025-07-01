import { Injectable } from '@nestjs/common';
import { HandleEmailReportBounceWebhookEvent } from 'modules/email-reports/events/handle-email-report-bounce-webhook.event';
import { from, Observable } from 'rxjs';
import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { concatAll, map } from 'rxjs/operators';
import { HandleEmailReportBounceWebhookCommand } from 'modules/email-reports/commands/handle-email-report-bounce-webhook.command';

@Injectable()
export class HandleEmailReportBounceWebhookSaga {
  @Saga()
  handleEmailReportBounceWebhookBySaga = (
    events: Observable<HandleEmailReportBounceWebhookEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(HandleEmailReportBounceWebhookEvent),
        map(async (event) => {
          return new HandleEmailReportBounceWebhookCommand(
            event.email,
            event.recordType,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
