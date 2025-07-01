import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { CreateEmailReportRequest } from 'modules/email-reports/requests/create-email-report.request';
import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { IdType } from 'modules/common/types/id-type.type';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { EmailReportsRequest } from 'modules/email-reports/requests/email-reports.request';
import { EmailReportsResponse } from 'modules/email-reports/responses/email-reports.response';
import { ReportResponse } from 'modules/email-reports/responses/report.response';
import { UpdateEmailReportRequest } from 'modules/email-reports/requests/update-email-report.request';
import { BulkDeleteRequest } from 'modules/email-reports/requests/bulk-delete.request';

@ApiTags('Email Reports')
@Controller('accounts')
export class EmailReportsController {
  constructor(private readonly emailReportsService: EmailReportsService) {}

  /**
   * Handles the request to get email reports based on the provided query and user ID.
   *
   * @param {EmailReportsRequest} query - The request parameters for fetching email reports.
   * @param {IdType} id - The unique identifier of the user, parsed as an integer.
   * @return {Promise<EmailReportsResponse>} - A promise that resolves to the response containing email reports.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: EmailReportsResponse })
  @Get(':id/email-reports')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  emailReports(
    @Query() query: EmailReportsRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<EmailReportsResponse> {
    return this.emailReportsService.getEmailReports(id, { ...query });
  }

  /**
   * Handles the creation of an email report for the specified user account.
   *
   * @param {CreateEmailReportRequest} body - The request payload containing email report details.
   * @param {IdType} id - The unique identifier of the account for which the report is created. Parsed as an integer.
   * @param {SerpnestUserTokenData} tokenData - The data extracted from the user's token, which includes user information.
   * @return {Promise<void>} A promise that resolves to void upon successful creation of the email report.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse()
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/email-reports')
  create(
    @Body() body: CreateEmailReportRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.emailReportsService.create({
      accountId: id,
      ...body,
      userId: tokenData.user.id,
    });
  }

  /**
   * Updates an email report specified by the emailReportId for a given user account.
   *
   * @param {UpdateEmailReportRequest} body - The data to update the email report with.
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information.
   * @param {IdType} id - The account ID.
   * @param {IdType} emailReportId - The ID of the email report to update.
   * @return {Promise<void>} A promise that resolves when the update is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Patch(':id/email-reports/:emailReportId')
  update(
    @Body() body: UpdateEmailReportRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('emailReportId', new ParseIntPipe()) emailReportId: IdType,
  ): Promise<void> {
    return this.emailReportsService.update({
      accountId: id,
      userId: tokenData.user.id,
      emailReportId,
      ...body,
    });
  }

  /**
   * Sends an email report based on the provided report ID and email report ID.
   *
   * @param {SerpnestUserTokenData} tokenData - The token data of the user.
   * @param {IdType} id - The ID of the report.
   * @param {IdType} emailReportId - The ID of the email report.
   *
   * @return {Promise<ReportResponse>} - A promise that resolves to a ReportResponse object.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ReportResponse })
  @Get(':id/email-reports/:emailReportId')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  emailReport(
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('emailReportId', new ParseIntPipe()) emailReportId: IdType,
  ): Promise<ReportResponse> {
    return this.emailReportsService.getEmailReport(emailReportId);
  }

  /**
   * Deletes multiple email reports associated with a specific account.
   *
   * @param {BulkDeleteRequest} body - The request body containing the details of the email reports to be deleted.
   * @param {IdType} id - The account ID to which the email reports belong.
   * @return {Promise<void>} A promise that resolves when the deletion is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/email-reports/bulk-delete')
  bulkDelete(
    @Body() body: BulkDeleteRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<void> {
    return this.emailReportsService.bulkDelete({ ...body, accountId: id });
  }
}
