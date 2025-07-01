import { Injectable, NotFoundException } from '@nestjs/common';
import { AlertRepository } from 'modules/alerts/repositories/alert.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { GetAlertsByProjectRequest } from 'modules/alerts/requests/get-alerts-by-project.request';
import { AlertsByProjectResponseFactory } from 'modules/alerts/factories/alerts-by-project-response.factory';
import { GetAllAlertsByProjectType } from 'modules/alerts/types/get-all-alerts-by-project.type';
import { GetAllAlertsByKeywordsType } from 'modules/alerts/types/get-all-alerts-by-keywords.type';
import { GetAlertsByKeywordsRequest } from 'modules/alerts/requests/get-alerts-by-keywords.request';
import { AlertKeywordRepository } from 'modules/alerts/repositories/alert-keyword.repository';
import { AlertsByKeywordsResponseFactory } from 'modules/alerts/factories/alerts-by-keywords-response.factory';
import { AlertsByKeywordsResponse } from 'modules/alerts/responses/alerts-by-keywords.response';
import { AlertInfoResponseFactory } from 'modules/alerts/factories/alert-info-response.factory';
import { AlertInfoResponse } from 'modules/alerts/responses/alert-info.response';
import { AlertKeywordsType } from 'modules/alerts/types/alert-keywords.type';
import { GetAlertKeywordsRequest } from 'modules/alerts/requests/get-alert-keywords.request';
import { AlertKeywordsResponseFactory } from 'modules/alerts/factories/alert-keywords-response.factory';
import { AlertKeywordsResponse } from 'modules/alerts/responses/alert-keywords.response';
import { AlertKeywordViewRepository } from 'modules/alerts/repositories/alert-keyword-view.repository';
import { ViewAlertByProjectType } from 'modules/alerts/types/view-alert-by-project.type';
import { ViewAlertByKeywordsType } from 'modules/alerts/types/view-alert-by-keywords.type';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { ProjectsWithAlertsResponse } from 'modules/alerts/responses/projects-with-alerts.response';
import { ProjectWithAlertsResponse } from 'modules/alerts/responses/project-with-alerts.response';
import { AlertViewRepository } from 'modules/alerts/repositories/alert-view.repository';
import { GetAlertProjectsRequest } from 'modules/alerts/requests/get-alert-projects.request';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class AlertsServices {
  constructor(
    private readonly alertRepository: AlertRepository,
    private readonly alertsByProjectResponseFactory: AlertsByProjectResponseFactory,
    private readonly alertKeywordRepository: AlertKeywordRepository,
    private readonly alertsByKeywordsResponseFactory: AlertsByKeywordsResponseFactory,
    private readonly alertInfoResponseFactory: AlertInfoResponseFactory,
    private readonly alertKeywordsResponseFactory: AlertKeywordsResponseFactory,
    private readonly alertKeywordViewRepository: AlertKeywordViewRepository,
    private readonly projectsService: ProjectsService,
    private readonly alertViewRepository: AlertViewRepository,
  ) {}

  /**
   * Retrieves a list of projects with their associated alerts filtered by the specified query parameters.
   *
   * @param {IdType} accountId - The unique identifier for the account to retrieve projects from.
   * @param {GetAlertProjectsRequest} query - The query parameters used to filter the projects.
   * @return {Promise<ProjectsWithAlertsResponse>} A promise that resolves to a response containing the list of projects with alerts.
   */
  async getProjects(
    accountId: IdType,
    query: GetAlertProjectsRequest,
  ): Promise<ProjectsWithAlertsResponse> {
    const projects = await this.projectsService.getProjectsWithAlerts(
      accountId,
      query,
    );
    return new ProjectsWithAlertsResponse({
      items: projects.map(
        (item) =>
          new ProjectWithAlertsResponse({
            ...item,
            favicon: item.url ? getFaviconHelper(item.url) : null,
          }),
      ),
    });
  }

  /**
   * View an alert based on the provided keywords. This method checks if the alert keyword exists and if the user has already viewed it. If not, it saves the view for the user.
   *
   * @param {ViewAlertByKeywordsType} payload - The details required to identify the alert keyword and the user.
   * @return {Promise<void>} - A promise that resolves when the view action is completed.
   */
  async viewAlertByKeywords(payload: ViewAlertByKeywordsType): Promise<void> {
    const alertKeyword =
      await this.alertKeywordRepository.getAlertKeywordTypeByKeywordsById(
        payload.accountKeywordId,
      );
    if (!alertKeyword) {
      throw new NotFoundException('Alert keyword not found.');
    }
    if (!alertKeyword.views.find((view) => view.user.id == payload.user.id)) {
      await this.alertKeywordViewRepository.save({
        alertKeyword,
        user: { id: payload.user.id },
      });
    }
  }

  /**
   * Fetches and processes an alert for a specific project based on the given payload.
   * If the alert exists and the user has not viewed it yet, the view is recorded.
   *
   * @param {ViewAlertByProjectType} payload - The data needed to view the alert by project, including alertId and user information.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   * @throws {NotFoundException} - If the specified alert is not found.
   */
  async viewAlertByProject(payload: ViewAlertByProjectType): Promise<void> {
    const alert = await this.alertRepository.getAlertTypeByProject(
      payload.alertId,
    );
    if (!alert) {
      throw new NotFoundException('Alert not found.');
    }

    if (!alert.views.find((view) => view.user.id == payload.user.id)) {
      await this.alertViewRepository.save({
        alert,
        user: { id: payload.user.id },
      });
    }
  }

  /**
   * Retrieves alert keywords based on the given payload and options.
   *
   * @param {AlertKeywordsType} payload - The payload containing the criteria for filtering alert keywords.
   * @param {GetAlertKeywordsRequest} options - The options for pagination and other query parameters.
   * @return {Promise<AlertKeywordsResponse>} A promise that resolves to the response containing the alert keywords and metadata.
   */
  async getAlertKeywords(
    payload: AlertKeywordsType,
    options: GetAlertKeywordsRequest,
  ): Promise<AlertKeywordsResponse> {
    const { items, meta } =
      await this.alertKeywordRepository.paginateAlertKeywords(payload, options);
    return this.alertKeywordsResponseFactory.createResponse(items, { meta });
  }

  /**
   * Retrieves alert information for a given account and alert ID.
   *
   * @param {IdType} accountId - The ID of the account associated with the alert.
   * @param {IdType} alertId - The ID of the alert to retrieve information for.
   * @return {Promise<AlertInfoResponse>} - A promise that resolves to the alert information response.
   * @throws {NotFoundException} - Throws if the alert is not found.
   */
  async getAlertInfo(
    accountId: IdType,
    alertId: IdType,
  ): Promise<AlertInfoResponse> {
    const alert = await this.alertRepository.getAlert(accountId, alertId);
    if (!alert) {
      throw new NotFoundException('Alert not found.');
    }
    return this.alertInfoResponseFactory.createResponse(alert);
  }

  /**
   * Asynchronously retrieves all alerts based on provided keywords.
   *
   * @param {GetAllAlertsByKeywordsType} payload - The payload containing the necessary data to fetch alerts.
   * @param {GetAlertsByKeywordsRequest} options - The options for the request such as pagination and filters.
   * @return {Promise<AlertsByKeywordsResponse>} - A promise that resolves to the alerts by keywords response.
   */
  async getAllAlertsByKeywords(
    payload: GetAllAlertsByKeywordsType,
    options: GetAlertsByKeywordsRequest,
  ): Promise<AlertsByKeywordsResponse> {
    const { items, meta } =
      await this.alertKeywordRepository.paginateAlertsByKeywords(
        payload.accountId,
        options,
      );

    return this.alertsByKeywordsResponseFactory.createResponse(items, {
      meta,
      userId: payload.user.id,
    });
  }

  /**
   * Retrieves all alerts for a specific project based on the provided payload and options.
   *
   * @param {GetAllAlertsByProjectType} payload - Contains information such as accountId and user.
   * @param {GetAlertsByProjectRequest} options - Defines the options for pagination and filtering of alerts.
   * @return {Promise<AlertsByProjectResponse>} - Promise resolving with the response containing alerts data and metadata.
   */
  async getAllAlertsByProject(
    payload: GetAllAlertsByProjectType,
    options: GetAlertsByProjectRequest,
  ) {
    const { items, meta } = await this.alertRepository.paginateAlertsByProject(
      payload.accountId,
      options,
    );
    return this.alertsByProjectResponseFactory.createResponse(items, {
      meta,
      user: payload.user,
    });
  }
}
