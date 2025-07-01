import { Body, Controller, Post } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { EmailReportWebhookService } from 'modules/email-reports/services/email-report-webhook.service';
import { PostmarkAuth } from 'modules/auth/decorators/postmark-auth.decorator';

@ApiTags('Email report webhook handler')
@Controller('email-report-webhook')
export class EmailReportWebhookController {
  constructor(
    private readonly emailReportWebhookService: EmailReportWebhookService,
  ) {}

  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post('paddle-bounce')
  async handlePaddleBounceEmail(@Body() payload: any): Promise<void> {
    await this.emailReportWebhookService.handlePaddleBounceEmail(payload);
  }
}
