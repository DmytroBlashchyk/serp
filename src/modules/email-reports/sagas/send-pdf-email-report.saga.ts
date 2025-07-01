import { ICommand, ofType, Saga } from '@nestjs/cqrs';
import { from, Observable } from 'rxjs';
import { SendPdfEmailReportEvent } from 'modules/email-reports/events/send-pdf-email-report.event';
import { concatAll, map } from 'rxjs/operators';
import { SendPdfEmailReportCommand } from 'modules/email-reports/commands/send-pdf-email-report.command';
import { Injectable } from '@nestjs/common';
import { ProjectsService } from 'modules/projects/services/projects.service';

@Injectable()
export class SendPdfEmailReportSaga {
  constructor(private readonly projectsService: ProjectsService) {}
  /**
   * Function to handle PDF email report sending via saga pattern.
   *
   * @param events - Stream of SendPdfEmailReportEvent objects that trigger
   *                 the command to generate and send PDF email reports.
   * @returns Observable stream of ICommand objects representing the actions
   *          to be dispatched based on the received events.
   */
  @Saga()
  sendPdfEmailReportBySaga = (
    events: Observable<SendPdfEmailReportEvent>,
  ): Observable<ICommand> => {
    return events
      .pipe(
        ofType(SendPdfEmailReportEvent),
        map(async (event) => {
          const project = await this.projectsService.getProjectById(
            event.projectId,
          );
          return new SendPdfEmailReportCommand(
            event.recipients,
            event.projectId,
            project.projectName,
            event.period,
            event.emailReportId,
          );
        }),
        map((promise) => from(promise)),
      )
      .pipe(concatAll());
  };
}
