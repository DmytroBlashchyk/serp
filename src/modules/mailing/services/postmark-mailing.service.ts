import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectPostmark, PostmarkClient } from 'nestjs-postmark';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { EmailLetterTemplateType } from 'modules/mailing/types/email-letter-template.type';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from 'modules/logging/services/logging.service';
import {
  RateLimiterWrapperFactoryService,
  RateLimiterWrapperFunction,
} from 'modules/common/services/rate-limiter-factory.service';
import { Bounces, SuppressionStatuses } from 'postmark/dist/client/models';

const MIN_REQUEST_PERIOD = 1000 / 60 / 2; // 2 requests per 1minute
@Injectable()
export class PostmarkMailingService {
  /**
   * A function that wraps a given function into a rate limiter.
   * This wrapper ensures that the wrapped function adheres to specified rate limits,
   * preventing it from being called too frequently within a given time frame.
   *
   * @type {RateLimiterWrapperFunction}
   */
  private readonly wrapIntoRateLimiter: RateLimiterWrapperFunction;

  /**
   * Constructor for the mailing service.
   * Initializes the mailing service with required dependencies and sets up
   * rate limiting for email-related methods.
   *
   * @param {PostmarkClient} postmarkClient - The client to interact with Postmark service.
   * @param {ConfigService} configService - Service to access configuration settings.
   * @param {LoggingService} loggingService - Service to handle logging of activities and errors.
   * @param {RateLimiterWrapperFactoryService} rateLimiterFactory - Factory service to create rate limiter instances.
   * @return {void}
   */
  constructor(
    @InjectPostmark() private readonly postmarkClient: PostmarkClient,
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly rateLimiterFactory: RateLimiterWrapperFactoryService,
  ) {
    this.wrapIntoRateLimiter = rateLimiterFactory.spawnInstance({
      minTime: MIN_REQUEST_PERIOD,
      id: 'mailing',
    });
    this.sendManyPersonalizedLetters = this.wrapIntoRateLimiter(
      this.sendManyPersonalizedLetters.bind(this),
    );
    this.sendEmail = this.wrapIntoRateLimiter(this.sendEmail.bind(this));
  }

  /**
   * Sends multiple personalized letters via email using pre-defined templates.
   *
   * @param {Array<Object>} messages - An array of message objects, each containing
   *                                   `TemplateId`, `To`, `From`, and `TemplateModel`.
   * @param {number} messages[].TemplateId - The template ID to be used for the email.
   * @param {string} messages[].To - The recipient's email address.
   * @param {string} messages[].From - The sender's email address.
   * @param {Object} messages[].TemplateModel - A dictionary containing model data for the email template.
   *
   * @return {Promise<void>} - A promise that resolves when the emails have been sent, or rejects with an error.
   */
  async sendManyPersonalizedLetters(
    messages: {
      TemplateId: number;
      To: string;
      From: string;
      TemplateModel: Record<string, string>;
    }[],
  ): Promise<void> {
    await this.postmarkClient
      .sendEmailBatchWithTemplates(messages)
      .then((success) => {
        this.loggingService.log(success);
      })
      .catch((err) => {
        this.loggingService.log('Error sening email');
        this.loggingService.error(err);
        throw new BadRequestException('Error sending email');
      });
  }

  /**
   * Sends a PDF email report to multiple recipients.
   *
   * @param {any} file - The PDF file to be attached to the email.
   * @param {string[]} emails - An array of recipient email addresses.
   * @param {string} projectName - The name of the project for which the report is being sent.
   * @return {Promise<void>} - A promise that resolves when the email(s) are sent.
   */
  async sendPdfEmailReport(
    file: any,
    emails: string[],
    projectName: string,
  ): Promise<void> {
    try {
      const data = [];
      for (const email of emails) {
        data.push({
          From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
          To: email,
          TemplateId: this.configService.get(
            ConfigEnvEnum.EMAIL_REPORT_TEMPLATE_ID,
          ),
          TemplateModel: { project_name: projectName },
          Attachments: [
            {
              ContentID: null,
              Name: `${projectName}.pdf`,
              Content: Buffer.from(file).toString('base64'),
              ContentType: 'application/pdf',
            },
          ],
        });
      }

      const result = await this.postmarkClient.sendEmailBatchWithTemplates(
        data,
      );
      if (result[0]?.ErrorCode > 0) {
        this.loggingService.error(
          `sendPdfEmailReport ${projectName}`,
          result[0]?.Message,
        );
      }
    } catch (sendErr) {
      this.loggingService.error(sendErr);
      throw new BadRequestException('Error sending email');
    }
  }
  /**
   * Sends a CSV email report to a list of provided email addresses.
   *
   * @param {any} file - The CSV file to be attached to the email.
   * @param {string[]} emails - The list of email addresses to send the report to.
   * @param {string} projectName - The name of the project to be included in the email template.
   * @return {Promise<void>} A promise that resolves when emails have been sent.
   */
  async sendCsvEmailReport(
    file: any,
    emails: string[],
    projectName: string,
  ): Promise<void> {
    const data = [];
    for (const email of emails) {
      data.push({
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        To: email,
        TemplateId: this.configService.get(
          ConfigEnvEnum.EMAIL_REPORT_TEMPLATE_ID,
        ),
        TemplateModel: { project_name: projectName },
        Attachments: [
          {
            ContentID: null,
            Name: `${projectName}.csv`,
            Content: Buffer.from(file).toString('base64'),
            ContentType: 'text/csv',
          },
        ],
      });
    }
    try {
      await this.postmarkClient.sendEmailBatchWithTemplates(data);
    } catch (sendErr) {
      this.loggingService.error(sendErr);
      throw new BadRequestException('Error sending email');
    }
  }

  /**
   * Sends an email with the specified template.
   *
   * @param {string} email - The recipient's email address.
   * @param {EmailLetterTemplateType} letter - The email template containing the content to be sent.
   * @return {Promise<void>} A promise that resolves when the email has been sent.
   */
  async sendEmail(
    email: string,
    letter: EmailLetterTemplateType,
  ): Promise<void> {
    await this.postmarkClient
      .sendEmailWithTemplate({
        TemplateId: letter.templateId,
        To: email,
        From: this.configService.get(ConfigEnvEnum.POSTMARK_SUPPORT_EMAIL),
        TemplateModel: letter.templateModel,
      })
      .then((success) => {
        this.loggingService.log(success);
      })
      .catch((err) => {
        this.loggingService.log('Error sening email');
        this.loggingService.error(err);
        throw new BadRequestException('Error sending email');
      });
  }

  public async fetchBouncesByEmail(email: string): Promise<Bounces> {
    return await this.postmarkClient.getBounces({ emailFilter: email });
  }

  public async createSuppressions(
    emails: string[],
  ): Promise<SuppressionStatuses> {
    try {
      if (
        !Array.isArray(emails) ||
        (Array.isArray(emails) && emails.length < 1)
      )
        return;

      const suppressions = emails.map((email) => ({
        EmailAddress: email,
      }));
      const options = {
        Suppressions: suppressions,
      };

      return await this.postmarkClient.createSuppressions('outbound', options);
    } catch (error) {
      this.loggingService.error(error);
      throw error;
    }
  }
}
