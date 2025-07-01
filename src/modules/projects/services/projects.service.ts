import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectType } from 'modules/projects/types/create-project.type';
import { DeviceTypesService } from 'modules/device-types/services/device-types.service';
import { SearchEnginesService } from 'modules/search-engines/services/search-engines.service';
import { CheckFrequencyService } from 'modules/check-frequency/services/check-frequency.service';
import { LanguagesService } from 'modules/languages/services/languages.service';
import { UsersService } from 'modules/users/services/users.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { ProjectsTagsService } from 'modules/tags/services/projects-tags.service';
import { ProjectTagEntity } from 'modules/tags/entities/project-tag.entity';
import { CompetitorsService } from 'modules/competitors/services/competitors.service';
import { CompetitorEntity } from 'modules/competitors/entities/competitor.entity';
import { NotesService } from 'modules/notes/services/notes.service';
import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { GetPaginatedProjectsAvailableToUserTypeResponseFactory } from 'modules/projects/factories/get-paginated-projects-available-to-user-type-response.factory';
import { UpdateProjectType } from 'modules/projects/types/update-project.type';
import { IdType } from 'modules/common/types/id-type.type';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { GoogleDomainsService } from 'modules/google-domains/services/google-domains.service';
import { ProjectUrlTypesService } from 'modules/projects/services/project-url-types.service';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { BulkDeleteType } from 'modules/projects/types/bulk-delete.type';
import { AddKeywordsType } from 'modules/projects/types/add-keywords.type';
import { KeywordsTagsService } from 'modules/tags/services/keywords-tags.service';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { PaginatedProjectAvailableToUserResponse } from 'modules/projects/responses/paginated-project-available-to-user.response';
import { FoldersService } from 'modules/folders/services/folders.service';
import { AddProjectToFolderType } from 'modules/projects/types/add-project-to-folder.type';
import { MoveProjectsToFolderType } from 'modules/projects/types/move-projects-to-folder.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { ListAvailableProjectsResponse } from 'modules/projects/responses/list-available-projects.response';
import { ChangeFrequencyForProjectsType } from 'modules/projects/types/change-frequency-for-projects.type';
import { GetAllProjectAvailableToUserType } from 'modules/projects/types/get-all-project-available-to-user.type';
import { GetAllProjectAvailableToUserRequest } from 'modules/projects/requests/get-all-project-available-to-user.request';
import { AddTagsToProjectsType } from 'modules/projects/types/add-tags-to-projects.type';
import { ProjectOverviewType } from 'modules/projects/types/project-overview.type';
import { ProjectOverviewFactory } from 'modules/projects/factories/project-overview.factory';
import { UserEntity } from 'modules/users/entities/user.entity';
import { ImprovedVsDeclinedType } from 'modules/projects/types/improved-vs-declined.type';
import { ImprovedVsDeclinedFactory } from 'modules/projects/factories/improved-vs-declined.factory';
import { SystemFolderNamesEnum } from 'modules/folders/enums/system-folder-names.enum';
import { GetKeywordTrendsType } from 'modules/projects/types/get-keyword-trends.type';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { KeywordTrendsRequest } from 'modules/projects/requests/keyword-trends.request';
import { EventBus } from '@nestjs/cqrs';
import { CreateKeywordsEvent } from 'modules/projects/events/create-keywords.event';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ProjectByLinkType } from 'modules/shared-links/types/project-by-link.type';
import { GetSharedRequest } from 'modules/shared-links/requests/get-shared.request';
import { ProjectBySharedLinkType } from 'modules/projects/types/project-by-shared-link.type';
import { ProjectInfoResponseFactory } from 'modules/projects/factories/project-info-response.factory';
import { ProjectInfoResponse } from 'modules/shared-links/responses/project-info.response';
import { ProjectOverviewResponse } from 'modules/projects/responses/project-overview.response';
import { KeywordTrendsResponseFactory } from 'modules/projects/factories/keyword-trends-response.factory';
import { ApiProjectsRequest } from 'modules/api/requests/api-projects.request';
import { GetProjectKeywordsType } from 'modules/common/types/get-project-keywords.type';
import { GetProjectKeywordsResponse } from 'modules/projects/responses/get-project-keywords.response';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent } from 'modules/projects/events/update-data-from-data-for-seo-for-all-keywords-of-project.event';
import { ImprovedVsDeclinedArrayResponse } from 'modules/projects/responses/improved-vs-declined-array.response';
import { LocationsService } from 'modules/countries/services/locations.service';
import { GetNumberOfProjectKeywordsToUpdateType } from 'modules/projects/types/get-number-of-project-keywords-to-update.type';
import { GetNumberOfProjectKeywordsToUpdateResponse } from 'modules/projects/responses/get-number-of-project-keywords-to-update.response';
import { BrandingInfoResponseFactory } from 'modules/accounts/factories/branding-info-response.factory';
import { BrandingInfoResponse } from 'modules/accounts/responses/branding-info.response';
import { AccountSettingsResponseFactory } from 'modules/accounts/factories/account-settings-response.factory';
import { AccountSettingsResponse } from 'modules/shared-links/responses/account-settings.response';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { GetAlertProjectsRequest } from 'modules/alerts/requests/get-alert-projects.request';
import { PayloadProjectInfoType } from 'modules/projects/types/payload-project-info.type';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { NoteEntity } from 'modules/notes/entities/note.entity';
import { CreateProjectResponse } from 'modules/projects/responses/create-project.response';
import { DeletingEmptySharedLinksEvent } from 'modules/shared-links/events/deleting-empty-shared-links.event';
import { DetermineNumberOfAccountProjectsEvent } from 'modules/projects/events/determine-number-of-account-projects.event';
import { ListAvailableProjectsResponseFactory } from 'modules/projects/factories/list-available-projects-response.factory';
import { AdditionOfKeywordsEvent } from 'modules/keywords/events/addition-of-keywords.event';
import { CreateProjectForGoogleLocalType } from 'modules/projects/types/create-project-for-google-local.type';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { CreateKeywordsForGoogleLocalEvent } from 'modules/projects/events/create-keywords-for-google-local.event';
import { CreateKeywordsForGoogleMapsEvent } from 'modules/projects/events/create-keywords-for-google-maps.event';
import { CreateProjectForGoogleMapsType } from 'modules/projects/types/create-project-for-google-maps.type';
import { CreateProjectForYoutubeType } from 'modules/projects/types/create-project-for-youtube.type';
import { CreateKeywordsForYoutubeEvent } from 'modules/projects/events/create-keywords-for-youtube.event';
import { CreateProjectForBingType } from 'modules/projects/types/create-project-for-bing.type';
import { CreateKeywordsForBingEvent } from 'modules/projects/events/create-keywords-for-bing.event';
import { CreateProjectForYahooType } from 'modules/projects/types/create-project-for-yahoo.type';
import { CreateKeywordsForYahooEvent } from 'modules/projects/events/create-keywords-for-yahoo.event';
import { CreateProjectForBaiduType } from 'modules/projects/types/create-project-for-baidu.type';
import { CreateKeywordsForBaiduEvent } from 'modules/projects/events/create-keywords-for-baidu.event';
import { DeleteAssignedProjectsEvent } from 'modules/projects/events/delete-assigned-projects.event';

import { AssignProjectToAFolderManagerEvent } from 'modules/invitations/events/assign-project-to-a-folder-manager.event';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { CreateProjectResponseFactory } from 'modules/projects/factories/create-project-response.factory';
import { ProjectInformationInCsvFormatType } from 'modules/projects/types/project-information-in-csv-format.type';
import { SortOrderEnum } from 'modules/common/enums/sort-order.enum';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { CsvEmailReportTransformer } from 'modules/email-reports/transformers/csv-email-report.transformer';
import { CsvService } from 'modules/email-reports/services/csv.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly deviceTypesService: DeviceTypesService,
    private readonly searchEnginesService: SearchEnginesService,
    private readonly checkFrequencyService: CheckFrequencyService,
    private readonly languagesService: LanguagesService,
    private readonly usersService: UsersService,
    private readonly projectRepository: ProjectRepository,
    private readonly accountsService: AccountsService,
    private readonly tagsService: ProjectsTagsService,
    private readonly competitorsService: CompetitorsService,
    private readonly notesService: NotesService,
    private readonly keywordsService: KeywordsService,
    private readonly getPaginatedProjectsAvailableToUserTypeResponseFactory: GetPaginatedProjectsAvailableToUserTypeResponseFactory,
    private readonly googleDomainsService: GoogleDomainsService,
    private readonly projectUrlTypesService: ProjectUrlTypesService,
    private readonly keywordTagsService: KeywordsTagsService,
    private readonly foldersService: FoldersService,
    private readonly projectOverviewFactory: ProjectOverviewFactory,
    private readonly improvedVsDeclinedFactory: ImprovedVsDeclinedFactory,
    private readonly eventBus: EventBus,
    private readonly projectInfoResponseFactory: ProjectInfoResponseFactory,
    private readonly keywordTrendsResponseFactory: KeywordTrendsResponseFactory,
    private readonly listAvailableProjectsResponseFactory: ListAvailableProjectsResponseFactory,
    private readonly locationsService: LocationsService,
    private readonly brandingInfoResponseFactory: BrandingInfoResponseFactory,
    private readonly accountSettingsResponseFactory: AccountSettingsResponseFactory,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly keywordsTagsService: KeywordsTagsService,
    @InjectQueue(Queues.Projects)
    private readonly projectsQueue: Queue,
    private readonly createProjectResponseFactory: CreateProjectResponseFactory,
    private readonly keywordRepository: KeywordRepository,
    private readonly csvEmailReportTransformer: CsvEmailReportTransformer,
    private readonly csvService: CsvService,
  ) {}

  /**
   * Retrieves project information and formats it into CSV format.
   *
   * @param {ProjectInformationInCsvFormatType} payload - The payload containing the necessary data to retrieve project information in CSV format.
   * @param {string} payload.accountId - The account identifier.
   * @param {string} payload.projectId - The project identifier.
   * @param {string} payload.userId - The user identifier.
   * @returns {Promise<Object>} Returns a promise that resolves to an object containing the CSV data and project name.
   * @returns {Promise<string>} returns.csvData - The generated CSV data.
   * @returns {Promise<string>} returns.projectName - The project name.
   */
  async getProjectInformationInCSVFormat(
    payload: ProjectInformationInCsvFormatType,
  ) {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.userId,
    );
    const project = await this.getProjectById(payload.projectId);
    const count =
      await this.keywordRepository.getNumberOfUpdatedKeywordsOfProject(
        project.id,
      );
    if (count > 0) {
      throw new BadRequestException(
        'The project keywords have not yet been updated',
      );
    }
    const { items } =
      await this.keywordRepository.getKeywordsWithKeywordPositions(
        payload.projectId,
        {
          page: 1,
          limit: 1000,
          sortBy: null,
          sortOrder: SortOrderEnum.desc,
        },
        {
          top3: BooleanEnum.FALSE,
          top10: BooleanEnum.FALSE,
          top30: BooleanEnum.FALSE,
          top100: BooleanEnum.FALSE,
          improved: BooleanEnum.FALSE,
          declined: BooleanEnum.FALSE,
          notRanked: BooleanEnum.FALSE,
          lost: BooleanEnum.FALSE,
          noChange: BooleanEnum.FALSE,
        },
        DeviceTypesEnum.DesktopAndMobile,
      );
    const data = await this.csvEmailReportTransformer.transform(items, project);
    return {
      csvData: await this.csvService.generateCsv(data),
      projectName: project.projectName,
    };
  }
  /**
   * Updates data for all keywords in all projects from the SEO data source for Bing.
   * Fetches all projects related to Bing, then triggers an event to update data for each project's keywords.
   *
   * @return {Promise<void>} A promise that resolves when the update process is complete.
   */
  async updateDataFromDataForSEOForBingForAllKeywords() {
    const projects = await this.getAllProjectsForBing();
    for (const project of projects) {
      this.eventBus.publish(
        new UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent({
          projectId: project.id,
        }),
      );
    }
  }

  /**
   * Updates data for SEO for all Google keywords for each project.
   *
   * This method fetches all projects configured for Google and publishes
   * an UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent for each project
   * to update their SEO data.
   *
   * @return {Promise<void>} A promise that resolves when the update is complete.
   */
  async updateDataFromDataForSEOForGoogleAllKeywords(): Promise<void> {
    const projects = await this.getAllProjectsForGoogle();
    for (const project of projects) {
      this.eventBus.publish(
        new UpdateDataFromDataForSeoForAllKeywordsOfProjectEvent({
          projectId: project.id,
        }),
      );
    }
  }

  /**
   * Retrieves all projects associated with Bing.
   *
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity objects.
   */
  async getAllProjectsForBing(): Promise<ProjectEntity[]> {
    return this.projectRepository.getAllProjectForBing();
  }
  /**
   * Retrieves all projects associated with Google from the repository.
   *
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity objects.
   */
  async getAllProjectsForGoogle(): Promise<ProjectEntity[]> {
    return this.projectRepository.getAllProjectForGoogle();
  }

  /**
   * Fetches all projects associated with a specified account that have alerts.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {GetAlertProjectsRequest} query - The request query containing filter or sorting options.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of project entities with alerts.
   */
  async getProjectsWithAlerts(
    accountId: IdType,
    query: GetAlertProjectsRequest,
  ): Promise<ProjectEntity[]> {
    return this.projectRepository.getProjectsWithAlertsByAccountId(
      accountId,
      query,
    );
  }

  /**
   * Retrieves project keywords with pagination.
   *
   * @param {GetProjectKeywordsType} payload - Contains the account ID, project ID, and user ID.
   * @param {PaginatedSearchRequest} options - Specifies pagination and search options.
   * @return {Promise<GetProjectKeywordsResponse>} Returns a promise that resolves to a GetProjectKeywordsResponse containing the project keywords and metadata.
   */
  async getProjectKeywords(
    payload: GetProjectKeywordsType,
    options: PaginatedSearchRequest,
  ): Promise<GetProjectKeywordsResponse> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.userId,
    );
    const { items, meta } = await this.keywordsService.paginatedProjectKeywords(
      payload,
      options,
    );
    return new GetProjectKeywordsResponse({ items, meta });
  }

  /**
   * Retrieves a specific project for an API based on the provided account ID and project ID.
   *
   * @param {IdType} accountId - The ID of the account to which the project belongs.
   * @param {IdType} projectId - The ID of the project to retrieve.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity.
   * @throws {NotFoundException} If the project is not found.
   */
  async getProjectForApi(
    accountId: IdType,
    projectId: IdType,
  ): Promise<ProjectEntity> {
    const project = await this.projectRepository.getAccountProjectForAPI(
      accountId,
      projectId,
    );
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  /**
   * Retrieves a paginated list of projects associated with a specific account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {ApiProjectsRequest} options - The options for pagination and filtering of the projects.
   * @return {Promise<Pagination<ProjectEntity>>} - A promise that resolves to a pagination object containing the projects.
   */
  async gerProjectsByAccountId(
    accountId: IdType,
    options: ApiProjectsRequest,
  ): Promise<Pagination<ProjectEntity>> {
    return this.projectRepository.paginatedAccountProjects(accountId, options);
  }
  /**
   * Retrieves a project by its unique identifier.
   *
   * @param {IdType} projectId - The unique identifier of the project to be retrieved.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity if found, otherwise throws a NotFoundException.
   */
  async getProjectById(projectId: IdType): Promise<ProjectEntity> {
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  /**
   * Retrieves a project based on a shared link, project identifier, and an optional keyword device type.
   *
   * @param {string} link - The shared link associated with the project.
   * @param {IdType} projectId - The identifier of the project.
   * @param {DeviceTypesEnum} [keywordDeviceType] - An optional device type keyword for the project.
   * @return {Promise<ProjectBySharedLinkType>} A Promise that resolves with the project details if found.
   * @throws {NotFoundException} If the project is not found.
   */
  async getProjectBySharedLink(
    link: string,
    projectId: IdType,
    keywordDeviceType?: DeviceTypesEnum,
  ): Promise<ProjectBySharedLinkType> {
    const project = await this.projectRepository.getProjectByLinkAndProjectId(
      link,
      projectId,
      keywordDeviceType,
    );
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  /**
   * Retrieves paginated projects based on a shared link.
   *
   * @param {string} sharedLink - The shared link used to retrieve projects.
   * @param {GetSharedRequest} options - Options for pagination and filtering.
   * @return {Promise<Pagination<ProjectByLinkType>>} A promise that resolves to a paginated list of projects.
   */
  async getPaginatedProjectsBySharedLink(
    sharedLink: string,
    options: GetSharedRequest,
  ): Promise<Pagination<ProjectByLinkType>> {
    return this.projectRepository.paginatedProjectBySharedLink(
      sharedLink,
      options,
    );
  }

  /**
   * Fetches keyword trends based on the provided payload and query parameters.
   *
   * @param {GetKeywordTrendsType} payload - The payload containing account, project, and user details for retrieving keyword trends.
   * @param {KeywordTrendsRequest} query - The query parameters to filter the keyword trends data.
   * @return {Promise<KeywordTrendsResponse>} A promise that resolves to the keyword trends response.
   */
  async getKeywordTrends(
    payload: GetKeywordTrendsType,
    query: KeywordTrendsRequest,
  ): Promise<KeywordTrendsResponse> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.userId,
    );
    const keywordTrends = await this.keywordsService.getKeywordTrends(payload);

    return this.keywordTrendsResponseFactory.createResponse(keywordTrends, {
      ...query,
    });
  }

  /**
   * Adds a user to multiple projects by creating entries in the users_projects table.
   *
   * @param {UserEntity} user - The user entity object containing user details.
   * @param {ProjectEntity[]} projects - An array of project entity objects to which the user will be added.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async addUserToProjects(
    user: UserEntity,
    projects: ProjectEntity[],
  ): Promise<void> {
    if (projects.length > 0) {
      const insertValues = projects.map((project) => ({
        users_id: user.id,
        projects_id: project.id,
      }));

      await this.projectRepository
        .createQueryBuilder()
        .insert()
        .into('users_projects')
        .values(insertValues)
        .orIgnore()
        .execute();
    }
  }
  /**
   * Retrieves an array of projects by their IDs.
   *
   * @param {IdType[]} ids - Array of project IDs to be retrieved.
   * @return {Promise<ProjectEntity[]>} A promise resolving to an array of ProjectEntity objects.
   * @throws {BadRequestException} If no projects are found or the number of retrieved projects does not match the number of provided IDs.
   */
  async getProjects(ids: IdType[]): Promise<ProjectEntity[]> {
    const projects = await this.projectRepository.getProjectsByIds(ids);
    if (projects.length === 0 || projects.length !== ids.length) {
      throw new BadRequestException('Projects not found');
    }
    return projects;
  }

  /**
   * Adds tags to the specified projects for an account.
   *
   * @param {AddTagsToProjectsType} payload - Data containing account ID, project IDs, user information, and tags to be added.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async addTagsToProjects(payload: AddTagsToProjectsType): Promise<void> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      payload.projectIds,
      payload.user.id,
    );
    const projects = await this.projectRepository.getProjectsWithTags(
      payload.projectIds,
    );
    const newProjects = [];
    for (const project of projects) {
      const tags: ProjectTagEntity[] = payload.tags
        ? await this.tagsService.createTags(payload.tags)
        : [];
      if (payload.tagIds && payload.tagIds.length > 0) {
        tags.push(...(await this.tagsService.getTagsByIds(payload.tagIds)));
      }
      project.tags = tags;
      newProjects.push(project);
    }
    await this.projectRepository.save(newProjects);
  }

  /**
   * Computes the statistics of improved vs. declined keywords for a specific project and account.
   *
   * @param {ImprovedVsDeclinedType} payload - The data required to perform the computation,
   * including accountId, projectId, and userId.
   * @return {Promise<ImprovedVsDeclinedArrayResponse>} - A promise that resolves to an array
   * containing the statistics of improved vs. declined keywords.
   */
  async improvedVsDeclined(
    payload: ImprovedVsDeclinedType,
  ): Promise<ImprovedVsDeclinedArrayResponse> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.userId,
    );
    const statistics = await this.keywordsService.improvedVsDeclined(payload);
    return this.improvedVsDeclinedFactory.createResponse(statistics, {
      ...payload,
    });
  }

  /**
   * Checks if the specified account has the appropriate attitude towards the given projects.
   *
   * @param {IdType} accountId - The ID of the account being checked.
   * @param {IdType[]} projectIds - An array of project IDs to evaluate against the account.
   * @param {IdType} [userId] - An optional user ID to further specify the context of check.
   * @return {Promise<void>} A promise that resolves if the account has the proper attitude, throws a ForbiddenException otherwise.
   */
  async checkAttitudeOfAccount(
    accountId: IdType,
    projectIds: IdType[],
    userId?: IdType,
  ): Promise<void> {
    const projects =
      await this.projectRepository.getUserAvailableProjectsInRelationToAccount(
        accountId,
        projectIds,
        userId,
      );
    if (projects.length !== projectIds.length) {
      throw new ForbiddenException('Access denied.');
    }
  }

  /**
   * Fetches an overview of a project based on the provided payload.
   *
   * @param {ProjectOverviewType} payload - The data needed to generate the project overview.
   * It includes accountId, projectId, and userId.
   * @return {Promise<ProjectOverviewResponse>} A promise that resolves to the project overview response object.
   */
  async projectOverview(
    payload: ProjectOverviewType,
  ): Promise<ProjectOverviewResponse> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.userId,
    );
    const overview = await this.keywordsService.overview(payload);
    const project = await this.projectRepository.getProjectByIdWithRelations(
      payload.projectId,
    );
    return this.projectOverviewFactory.createResponse(overview, {
      projectUpdated: project.updatedAt,
    });
  }

  /**
   * Fetches all projects available to a user with pagination and applies additional options.
   *
   * @param {GetAllProjectAvailableToUserType} payload - The payload containing the accountId and user details.
   * @param {GetAllProjectAvailableToUserRequest} options - The request options including pagination parameters and filters.
   * @return {Promise<PaginatedProjectAvailableToUserResponse>} A promise that resolves to a paginated response of projects available to the user.
   */
  async getAllProjectAvailableToUser(
    payload: GetAllProjectAvailableToUserType,
    options: GetAllProjectAvailableToUserRequest,
  ): Promise<PaginatedProjectAvailableToUserResponse> {
    const { items, meta } =
      await this.projectRepository.paginatedAllProjectsAvailableToUser(
        payload.accountId,
        payload.user.id,
        { ...options },
      );
    return this.getPaginatedProjectsAvailableToUserTypeResponseFactory.createResponse(
      items,
      {
        meta,
        dailyAverage: options.dailyAverage,
        frequencyName: options.frequencyName,
      },
    );
  }

  /**
   * Changes the check frequency for a set of projects.
   *
   * @param {ChangeFrequencyForProjectsType} payload - The payload containing the account ID, project IDs, user ID, and new frequency.
   * @returns {Promise<void>} A promise that resolves when the check frequency has been updated for the specified projects.
   */
  async changeFrequencyForProjects(
    payload: ChangeFrequencyForProjectsType,
  ): Promise<void> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      payload.projectIds,
      payload.userId,
    );
    const projects = await this.projectRepository.getProjectsByIds(
      payload.projectIds,
    );
    const frequency = await this.checkFrequencyService.getCheckFrequency(
      payload.frequency,
    );

    await this.projectRepository.updateCheckFrequency(
      projects.map((project) => project.id),
      frequency.id,
    );
  }

  /**
   * Calculates the number of project keywords that need to be updated based on provided project IDs
   * and folder IDs within the payload. If folder IDs are provided, it retrieves the associated projects.
   *
   * @param {GetNumberOfProjectKeywordsToUpdateType} payload - Contains accountId, folderIds, projectIds, and user.
   * @return {Promise<GetNumberOfProjectKeywordsToUpdateResponse>} A promise that resolves to a response object containing the number of keywords to be updated.
   */
  async getNumberOfProjectKeywordsToUpdate(
    payload: GetNumberOfProjectKeywordsToUpdateType,
  ): Promise<GetNumberOfProjectKeywordsToUpdateResponse> {
    let projectIds = [];
    if (payload.projectIds && payload.projectIds.length) {
      projectIds.push(...payload.projectIds);
    }
    if (payload.folderIds && payload.folderIds.length) {
      const folders =
        await this.foldersService.getAllInternalProjectFoldersByFolderIds(
          payload.accountId,
          payload.folderIds,
          payload.user.id,
        );
      for (const folder of folders) {
        projectIds.push(
          ...folder?.projects.map((project) => Number(project.id)),
        );
      }
      projectIds = [...new Set(projectIds)];
    }
    if (projectIds.length > 0) {
      const keywordCount =
        await this.keywordsService.getNumberOfWordsThatWillBeSkipped(
          projectIds,
        );
      return new GetNumberOfProjectKeywordsToUpdateResponse({ keywordCount });
    } else {
      return new GetNumberOfProjectKeywordsToUpdateResponse({
        keywordCount: 0,
      });
    }
  }

  /**
   * Refreshes all keywords for the specified projects and folders for a given account. The method handles
   * different search engines and updates keyword positions accordingly. It also adds jobs to update project schedules.
   *
   * @param {IdType} accountId - The ID of the account to which the projects belong.
   * @param {IdType[]} projectIds - An array of project IDs whose keywords are to be refreshed.
   * @param {IdType[]} folderIds - An array of folder IDs containing projects whose keywords are to be refreshed.
   * @param {UserPayload} user - The payload of the user initiating the request.
   * @return {Promise<void>} - A promise that resolves when the keywords have been refreshed.
   */
  @Transactional()
  async refreshAllKeywordsForProjects(
    accountId: IdType,
    projectIds: IdType[],
    folderIds: IdType[],
    user: UserPayload,
  ): Promise<void> {
    let newProjectIds = projectIds ?? [];
    if (folderIds && folderIds.length) {
      const folders =
        await this.foldersService.getAllInternalProjectFoldersByFolderIds(
          accountId,
          folderIds,
          user.id,
        );
      for (const folder of folders) {
        newProjectIds.push(
          ...folder.projects.map((project) => Number(project.id)),
        );
      }
      newProjectIds = [...new Set(projectIds)];
    }

    if (newProjectIds && newProjectIds.length) {
      await this.checkAttitudeOfAccount(accountId, newProjectIds, user.id);

      for (const projectId of newProjectIds) {
        const project = await this.projectRepository.getProjectByIdWithKeywords(
          projectId,
        );
        if (project) {
          switch (project.searchEngine.name) {
            case SearchEnginesEnum.Google:
              await this.keywordsService.updatePositions(
                await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
                  accountId,
                  project.keywords,
                ),
                accountId,
              );
              break;
            case SearchEnginesEnum.GoogleMyBusiness:
              await this.keywordsService.updatePositionsForGoogleLocal(
                await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
                  accountId,
                  project.keywords,
                  5,
                ),
                accountId,
              );
              break;
            case SearchEnginesEnum.GoogleMaps:
              await this.keywordsService.updatePositionsForGoogleMaps(
                await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
                  accountId,
                  project.keywords,
                ),
                accountId,
              );
              break;
            case SearchEnginesEnum.Bing:
              await this.keywordsService.updatePositionsForBing(
                await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
                  accountId,
                  project.keywords,
                ),
                accountId,
              );
              break;
            case SearchEnginesEnum.Yahoo:
              await this.keywordsService.updatePositionsForYahoo(
                await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
                  accountId,
                  project.keywords,
                ),
                accountId,
              );
              break;
            case SearchEnginesEnum.Baidu:
              await this.keywordsService.updatePositionsForBaidu(
                await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
                  accountId,
                  project.keywords,
                ),
              );
              break;
            case SearchEnginesEnum.YouTube:
              await this.keywordsService.updatePositionsForYoutube(
                await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
                  accountId,
                  project.keywords,
                  5,
                ),
                accountId,
              );
              break;
            default:
              throw new BadRequestException('Search Engine not defined');
          }

          await this.projectsQueue.add(
            QueueEventEnum.UpdateProjectSchedules,
            {
              projectId: project.id,
            },
            {
              jobId: `update-project-${project.id}`,
              removeOnComplete: true,
              removeOnFail: true,
              delay: 6000,
            },
          );
        }
      }
    }
  }

  /**
   * Retrieves a list of available projects for a given user and account.
   *
   * @param {UserPayload} user - The payload containing user information.
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {string} [search] - An optional search string to filter projects.
   * @return {Promise<ListAvailableProjectsResponse>} A promise that resolves to a list of available projects.
   */
  async getListAvailableProjects(
    user: UserPayload,
    accountId: IdType,
    search?: string,
  ): Promise<ListAvailableProjectsResponse> {
    const projects = await this.projectRepository.getListAvailableProjects(
      user.id,
      accountId,
      search,
    );

    await this.checkAttitudeOfAccount(
      accountId,
      projects.map((project) => project.id),
      user.id,
    );
    return this.listAvailableProjectsResponseFactory.createResponse(projects);
  }

  /**
   * Moves specified projects to a given folder.
   *
   * @param {MoveProjectsToFolderType} payload - Contains the account ID, project IDs, user ID, and folder ID.
   * @param {string} payload.accountId - The ID of the account.
   * @param {number[]} payload.projectIds - The IDs of the projects to be moved.
   * @param {User} payload.user - The user initiating the move operation.
   * @param {number} payload.folderId - The ID of the destination folder.
   *
   * @return {Promise<void>} - A promise that resolves when the projects have been successfully moved.
   * @throws {BadRequestException} - If some projects are not found.
   */
  @Transactional()
  async moveProjectsToFolder(payload: MoveProjectsToFolderType): Promise<void> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      payload.projectIds,
      payload.user.id,
    );
    const projects = await this.projectRepository.getProjectsByIdsWithFolders(
      payload.projectIds,
    );
    for (const project of projects) {
      for (const folder of project.folders) {
        await this.projectRepository.unmountProjectFromFolder(
          project.id,
          folder.id,
        );
      }
    }

    if (projects.length !== payload.projectIds.length) {
      throw new BadRequestException('Projects not found');
    }
    const folder = await this.foldersService.getFolder(payload.folderId);
    const result = folder.projects.find((project) =>
      payload.projectIds.includes(Number(project.id)),
    );
    if (result) {
      await this.foldersService.removeProjectsFromFolder(folder, [result]);
    } else {
      for (const project of projects) {
        await this.foldersService.addProjectToFolder(project, folder);
        this.eventBus.publish(
          new AssignProjectToAFolderManagerEvent({
            folderId: folder.id,
            projectId: project.id,
          }),
        );
      }
    }
  }

  /**
   * Adds a given project to a specified folder.
   *
   * @param {AddProjectToFolderType} addProjectToFolder - An object containing the details required to add the project to the folder.
   * @returns {Promise<void>} This method does not return a value.
   */
  async addProjectToFolder(
    addProjectToFolder: AddProjectToFolderType,
  ): Promise<void> {
    await this.checkAttitudeOfAccount(
      addProjectToFolder.accountId,
      [addProjectToFolder.projectId],
      addProjectToFolder.user.id,
    );
    const project = await this.projectRepository.getProjectByIdWithFolders(
      addProjectToFolder.projectId,
    );
    if (
      project.folders.find((folder) => folder.id == addProjectToFolder.folderId)
    ) {
      throw new BadRequestException(
        'Project has already been added to the folder.',
      );
    }
    const folder = await this.foldersService.getFolder(
      addProjectToFolder.folderId,
    );
    await this.foldersService.addProjectToFolder(project, folder);
    this.eventBus.publish(
      new AssignProjectToAFolderManagerEvent({
        folderId: addProjectToFolder.folderId,
        projectId: project.id,
      }),
    );
  }

  /**
   * This method adds keywords to a specified project.
   *
   * @param {AddKeywordsType} payload - The data required to add keywords, including account ID, project ID, user ID, device type, tags, tag IDs, and the keywords themselves.
   * @return {Promise<CreateProjectResponse>} - A promise that resolves to a response indicating the status of the keyword addition and any duplicate keywords that were omitted.
   */
  @Transactional()
  async addKeywords(payload: AddKeywordsType): Promise<CreateProjectResponse> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.user.id,
    );
    const project = await this.getProjectById(payload.projectId);
    const deviceType = await this.deviceTypesService.getDeviceType(
      payload.deviceType,
    );
    const tags: KeywordTagEntity[] = payload.tags
      ? await this.keywordTagsService.createTags(payload.tags)
      : [];
    if (payload.tagIds && payload.tagIds.length > 0) {
      tags.push(
        ...(await this.keywordTagsService.getTagsByIds(payload.tagIds)),
      );
    }

    await this.accountLimitsService.checkAvailabilityOfAddingTagsToKeyword(
      payload.accountId,
      tags.length,
    );

    if (payload.keywords.length > 0) {
      if (
        [
          SearchEnginesEnum.GoogleMyBusiness,
          SearchEnginesEnum.GoogleMaps,
          SearchEnginesEnum.YouTube,
        ].includes(project.searchEngine.name) &&
        deviceType.name !== DeviceTypesEnum.Desktop
      ) {
        throw new BadRequestException(
          'The added keyword type is not allowed for this project.',
        );
      }
      if (deviceType.name === DeviceTypesEnum.DesktopAndMobile) {
        const desktopData =
          await this.keywordsService.eliminateDuplicationOfProjectKeywords(
            project.id,
            payload.keywords,
            DeviceTypesEnum.Desktop,
          );
        const mobileData =
          await this.keywordsService.eliminateDuplicationOfProjectKeywords(
            project.id,
            payload.keywords,
            DeviceTypesEnum.Mobile,
          );

        switch (project.searchEngine.name) {
          case SearchEnginesEnum.Google:
            await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
              payload.accountId,
              desktopData.length + mobileData.length,
            );
            if (desktopData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsEvent({
                  deviceTypeName: DeviceTypesEnum.Desktop,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords: desktopData,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
            }
            if (mobileData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsEvent({
                  deviceTypeName: DeviceTypesEnum.Mobile,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords: mobileData,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
            }
            break;

          case SearchEnginesEnum.Bing:
            await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
              payload.accountId,
              desktopData.length + mobileData.length,
            );
            if (desktopData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForBingEvent({
                  deviceTypeName: DeviceTypesEnum.Desktop,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords: desktopData,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
            }
            if (mobileData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForBingEvent({
                  deviceTypeName: DeviceTypesEnum.Mobile,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords: mobileData,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
            }
            break;
          case SearchEnginesEnum.Yahoo:
            await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
              payload.accountId,
              desktopData.length + mobileData.length,
            );
            if (desktopData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForYahooEvent({
                  deviceTypeName: DeviceTypesEnum.Desktop,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords: desktopData,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
            }
            if (mobileData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForYahooEvent({
                  deviceTypeName: DeviceTypesEnum.Mobile,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords: mobileData,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
            }
            break;

          case SearchEnginesEnum.Baidu:
            await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
              payload.accountId,
              desktopData.length + mobileData.length,
            );
            if (desktopData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForBaiduEvent({
                  deviceTypeName: DeviceTypesEnum.Desktop,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords: desktopData,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
            }
            if (mobileData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForBaiduEvent({
                  deviceTypeName: DeviceTypesEnum.Mobile,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords: mobileData,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
            }
            break;
          default:
            throw new BadRequestException('Search Engine not defined');
        }

        this.eventBus.publish(
          new AdditionOfKeywordsEvent({
            accountId: payload.accountId,
            numberOfKeywordsToBeAdded: mobileData.length + desktopData.length,
          }),
        );
        return this.createProjectResponseFactory.createResponse(project, {
          numberOfNewKeywords: payload.keywords.length * 2,
          numberOfKeywordsToBeAdded: desktopData.length + mobileData.length,
          accountId: payload.accountId,
        });
      } else {
        const keywords =
          await this.keywordsService.eliminateDuplicationOfProjectKeywords(
            project.id,
            payload.keywords,
            payload.deviceType,
          );

        if (keywords.length > 0) {
          switch (project.searchEngine.name) {
            case SearchEnginesEnum.Google:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                payload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
              break;
            case SearchEnginesEnum.GoogleMyBusiness:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                payload.accountId,
                keywords.length * 5,
              );
              this.eventBus.publish(
                new CreateKeywordsForGoogleLocalEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
              break;
            case SearchEnginesEnum.GoogleMaps:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                payload.accountId,
                keywords.length * 5,
              );
              this.eventBus.publish(
                new CreateKeywordsForGoogleMapsEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
              break;
            case SearchEnginesEnum.Bing:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                payload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsForBingEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
              break;
            case SearchEnginesEnum.Yahoo:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                payload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsForYahooEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
              break;
            case SearchEnginesEnum.Baidu:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                payload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsForBaiduEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
              break;
            case SearchEnginesEnum.YouTube:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                payload.accountId,
                keywords.length * 5,
              );
              this.eventBus.publish(
                new CreateKeywordsForYoutubeEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: payload.accountId,
                  keywords,
                  tagIds: tags.length > 0 ? tags.map((tag) => tag.id) : [],
                }),
              );
              break;
            default:
              throw new BadRequestException('Search Engine not defined');
          }

          this.eventBus.publish(
            new AdditionOfKeywordsEvent({
              accountId: payload.accountId,
              numberOfKeywordsToBeAdded: keywords.length,
            }),
          );
        }
        return this.createProjectResponseFactory.createResponse(project, {
          numberOfNewKeywords: payload.keywords.length,
          numberOfKeywordsToBeAdded: keywords.length,
          accountId: payload.accountId,
        });
      }
    }
  }

  /**
   * Deletes multiple projects and their associated data for a given account.
   *
   * @param {BulkDeleteType} payload - The data needed to perform the bulk delete, including accountId, projectIds, and userId.
   * @return {Promise<void>} - Resolves when the bulk delete operation has completed.
   *
   * Executes a bulk delete operation for the given account. The method first
   * checks the access permissions and then retrieves all relevant project data,
   * including competitors, notes, shared links, triggers, and email reports.
   * It then deletes the projects and associated data, updates account limits,
   * and publishes necessary events to handle other aspects of the deletion such
   * as adjusting limits and notifying other services.
   */
  @Transactional()
  async bulkDelete(payload: BulkDeleteType): Promise<void> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      payload.projectIds,
      payload.userId,
    );
    const projects =
      await this.projectRepository.getProjectsWithNumberOfEntities(
        payload.projectIds,
      );

    let competitorsCount = 0;
    let notesCount = 0;
    const sharedLinkIds = [];
    let triggersCount = 0;
    let emailReportsCount = 0;
    for (const project of projects) {
      if (project.competitorsCount > 0) {
        competitorsCount += project.competitorsCount;
      }
      if (project.emailReportsCount > 0) {
        emailReportsCount += project.emailReportsCount;
      }
      if (project.notesCount > 0) {
        notesCount += project.notesCount;
      }

      if (project.sharedLinks.length > 0) {
        sharedLinkIds.push(...project.sharedLinks.map((item) => item.id));
      }
      if (project.triggersCount > 0) {
        triggersCount += project.triggersCount;
      }
    }
    const projectIds = projects.map((project) => project.id);
    await this.projectRepository.remove(projects);

    this.eventBus.publish(
      new DetermineNumberOfAccountProjectsEvent({
        accountId: payload.accountId,
      }),
    );

    if (sharedLinkIds.length > 0) {
      this.eventBus.publish(
        new DeletingEmptySharedLinksEvent({
          accountId: payload.accountId,
          sharedLinkIds,
        }),
      );
    }
    if (competitorsCount > 0) {
      await this.accountLimitsService.accountCompetitorLimitAccounting(
        payload.accountId,
        competitorsCount * -1,
      );
    }
    if (emailReportsCount > 0) {
      await this.accountLimitsService.accountingOfEmailReports(
        payload.accountId,
        emailReportsCount * -1,
      );
    }

    if (notesCount > 0) {
      await this.accountLimitsService.accountingNotes(
        payload.accountId,
        notesCount * -1,
      );
    }
    if (triggersCount > 0) {
      await this.accountLimitsService.accountingOfTriggers(
        payload.accountId,
        triggersCount * -1,
      );
    }
    this.eventBus.publish(
      new DeleteAssignedProjectsEvent({
        projectIds,
      }),
    );
  }

  /**
   * Retrieves detailed information about a project, including project details,
   * branding information, and account settings, formatted for inclusion in a PDF.
   *
   * @param {IdType} id - The unique identifier of the project to retrieve information for.
   * @return {Promise<Object>} A promise that resolves with an object containing projectInfo,
   *                           brandingInfo, and accountSettings when the project is found.
   * @throws {NotFoundException} Throws an error if the project is not found.
   */
  async getProjectInfoForPdf(id: IdType): Promise<{
    projectInfo: ProjectInfoResponse;
    brandingInfo: BrandingInfoResponse;
    accountSettings: AccountSettingsResponse;
  }> {
    const project = await this.projectRepository.getProjectInfoForPdf(id);
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    const competitors = await this.competitorsService.getProjectCompetitors(
      project.id,
    );
    const brandingInfo = project.email_reports
      ? await this.brandingInfoResponseFactory.createResponse({
          ...project,
        })
      : undefined;
    const projectInfo = await this.projectInfoResponseFactory.createResponse(
      project,
      {
        competitors,
      },
    );
    const accountSettings =
      await this.accountSettingsResponseFactory.createResponse({ ...project });
    return { brandingInfo, projectInfo, accountSettings };
  }

  /**
   * Retrieves detailed information about a project, including its competitors, tags, keyword tags, and notes, based on the provided payload.
   *
   * @param {PayloadProjectInfoType} payload - The data required to fetch project information including flags for tags, keyword tags, and notes.
   * @return {Promise<ProjectInfoResponse>} A promise that resolves to the project information response with all requested details.
   * @throws {NotFoundException} If the project is not found.
   */
  async getProjectInfo(
    payload: PayloadProjectInfoType,
  ): Promise<ProjectInfoResponse> {
    const project = await this.projectRepository.getProjectInfo({ ...payload });

    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    const competitors = await this.competitorsService.getProjectCompetitors(
      project.id,
    );
    let tags: ProjectTagEntity[] = [];
    let keywordTags: KeywordTagEntity[] = [];
    let notes: NoteEntity[] = [];
    if (payload.tags == BooleanEnum.TRUE) {
      tags = await this.tagsService.getProjectTagsByProjectId(project.id);
    }

    if (payload.keywordTags == BooleanEnum.TRUE) {
      keywordTags = await this.keywordsTagsService.getProjectKeywordTags(
        project.id,
      );
    }
    if (payload.notes == BooleanEnum.TRUE) {
      notes = await this.notesService.getProjectNotes(project.id);
    }

    return this.projectInfoResponseFactory.createResponse(project, {
      keywordDeviceType: payload.keywordDeviceType,
      competitors,
      tags,
      notes,
      keywordTags,
    });
  }

  /**
   * Retrieves a project by its unique identifier and the account identifier.
   *
   * @param {IdType} id - The unique identifier of the project.
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity if found.
   * @throws {NotFoundException} If the project is not found.
   */
  async getProjectByIdAndAccountId(
    id: IdType,
    accountId: IdType,
  ): Promise<ProjectEntity> {
    const project = await this.projectRepository.getProjectByIdAndAccountId(
      id,
      accountId,
    );
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  /**
   * Updates the details of an existing project.
   *
   * @param {UpdateProjectType} projectPayload - An object containing the updated details for the project.
   * @return {Promise<CreateProjectResponse>} - A promise that resolves to a response object containing the project ID and a flag indicating if any duplicate keywords were missed.
   */
  @Transactional()
  async update(
    projectPayload: UpdateProjectType,
  ): Promise<CreateProjectResponse> {
    await this.checkAttitudeOfAccount(
      projectPayload.accountId,
      [projectPayload.projectId],
      projectPayload.user.id,
    );
    let project = await this.getProjectByIdAndAccountId(
      projectPayload.projectId,
      projectPayload.accountId,
    );
    if (projectPayload.projectName) {
      project.projectName = projectPayload.projectName;
    }
    if (projectPayload.url) {
      project.url = projectPayload.url;
    }
    if (projectPayload.checkFrequency) {
      project.checkFrequency =
        await this.checkFrequencyService.getCheckFrequency(
          projectPayload.checkFrequency,
        );
    }

    let competitors = project.competitors;

    if (projectPayload.competitorIds) {
      for (const competitorId of projectPayload.competitorIds) {
        competitors = competitors.filter((item) => {
          if (item.id == competitorId) {
            return false;
          }
          return true;
        });
      }
    }

    if (competitors.length > 0) {
      await this.competitorsService.deleteCompetitors(competitors);
      await this.accountLimitsService.accountCompetitorLimitAccounting(
        projectPayload.accountId,
        competitors.length * -1,
      );
    }

    if (projectPayload.competitors && projectPayload.competitors.length > 0) {
      project = await this.getProjectById(projectPayload.projectId);
      if (
        [
          SearchEnginesEnum.GoogleMyBusiness,
          SearchEnginesEnum.GoogleMaps,
        ].includes(project.searchEngine.name)
      ) {
        throw new BadRequestException(
          'Competitors to this project should be in the form of objects.',
        );
      }
      competitors.push(
        ...(await this.competitorsService.createCompetitors(
          projectPayload.competitors,
        )),
      );
      const projectCompetitors =
        await this.competitorsService.getProjectCompetitors(project.id);
      projectCompetitors.push(
        ...(await this.competitorsService.createCompetitors(
          projectPayload.competitors,
        )),
      );
      await this.projectRepository.save({
        id: project.id,
        competitors: projectCompetitors,
      });
      await this.accountLimitsService.accountCompetitorLimitAccounting(
        projectPayload.accountId,
        projectPayload.competitors?.length ?? 0,
      );
    }

    if (
      projectPayload.businessCompetitors &&
      projectPayload.businessCompetitors.length > 0
    ) {
      project = await this.getProjectById(projectPayload.projectId);
      if (
        ![
          SearchEnginesEnum.GoogleMaps,
          SearchEnginesEnum.GoogleMyBusiness,
        ].includes(project.searchEngine.name)
      ) {
        throw new BadRequestException(
          'The competitors of this project should be in the form of strings.',
        );
      }
      competitors.push(
        ...(await this.competitorsService.createBusinessCompetitors(
          projectPayload.businessCompetitors,
        )),
      );
      const projectCompetitors =
        await this.competitorsService.getProjectCompetitors(project.id);
      projectCompetitors.push(
        ...(await this.competitorsService.createBusinessCompetitors(
          projectPayload.businessCompetitors,
        )),
      );
      await this.projectRepository.save({
        id: project.id,
        competitors: projectCompetitors,
      });
      await this.accountLimitsService.accountCompetitorLimitAccounting(
        projectPayload.accountId,
        projectPayload.competitors?.length ?? 0,
      );
    }
    const projectTags = project.tags;

    const updateTags = [];

    if (projectPayload.tags) {
      const tags = await this.tagsService.createTags(projectPayload.tags);
      updateTags.push(...tags);
    }

    if (projectPayload.tagIds) {
      for (const projectTag of projectTags) {
        if (projectPayload.tagIds.find((tagId) => tagId == projectTag.id)) {
          updateTags.push(projectTag);
        }
      }
    }

    if (projectPayload.note) {
      await this.notesService.createNotes(
        projectPayload.note,
        project,
        projectPayload.user,
      );
    }

    await this.projectRepository.updateProject(
      project.id,
      project.projectName,
      project.url,
      project.checkFrequency.id,
    );
    if (updateTags.length > 0) {
      await this.projectRepository.save({
        id: project.id,
        tags: [...updateTags],
      });
    }

    await this.accountLimitsService.checkAvailabilityOfAddingTagsToProject(
      projectPayload.accountId,
      (projectPayload.tags ? projectPayload.tags.length : 0) +
        (projectPayload.tagIds ? projectPayload.tagIds.length : 0),
    );

    if (
      projectPayload.keywords &&
      projectPayload.keywords.length > 0 &&
      projectPayload.deviceType
    ) {
      const deviceType = await this.deviceTypesService.getDeviceType(
        projectPayload.deviceType,
      );
      if (
        [
          SearchEnginesEnum.GoogleMyBusiness,
          SearchEnginesEnum.GoogleMaps,
          SearchEnginesEnum.YouTube,
        ].includes(project.searchEngine.name) &&
        deviceType.name !== DeviceTypesEnum.Desktop
      ) {
        throw new BadRequestException(
          'The added keyword type is not allowed for this project.',
        );
      }
      if (deviceType.name === DeviceTypesEnum.DesktopAndMobile) {
        const desktopData =
          await this.keywordsService.eliminateDuplicationOfProjectKeywords(
            project.id,
            projectPayload.keywords,
            DeviceTypesEnum.Desktop,
          );
        const mobileData =
          await this.keywordsService.eliminateDuplicationOfProjectKeywords(
            project.id,
            projectPayload.keywords,
            DeviceTypesEnum.Mobile,
          );

        switch (project.searchEngine.name) {
          case SearchEnginesEnum.Google:
            await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
              projectPayload.accountId,
              desktopData.length + mobileData.length,
            );
            if (desktopData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsEvent({
                  deviceTypeName: DeviceTypesEnum.Desktop,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords: desktopData,
                }),
              );
            }
            if (mobileData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsEvent({
                  deviceTypeName: DeviceTypesEnum.Mobile,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords: mobileData,
                }),
              );
            }
            break;

          case SearchEnginesEnum.Bing:
            await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
              projectPayload.accountId,
              desktopData.length + mobileData.length,
            );
            if (desktopData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForBingEvent({
                  deviceTypeName: DeviceTypesEnum.Desktop,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords: desktopData,
                }),
              );
            }
            if (mobileData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForBingEvent({
                  deviceTypeName: DeviceTypesEnum.Mobile,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords: mobileData,
                }),
              );
            }
            break;
          case SearchEnginesEnum.Yahoo:
            await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
              projectPayload.accountId,
              desktopData.length + mobileData.length,
            );
            if (desktopData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForYahooEvent({
                  deviceTypeName: DeviceTypesEnum.Desktop,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords: desktopData,
                }),
              );
            }
            if (mobileData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForYahooEvent({
                  deviceTypeName: DeviceTypesEnum.Mobile,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords: mobileData,
                }),
              );
            }
            break;
          case SearchEnginesEnum.Baidu:
            await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
              projectPayload.accountId,
              desktopData.length + mobileData.length,
            );
            if (desktopData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForBaiduEvent({
                  deviceTypeName: DeviceTypesEnum.Desktop,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords: desktopData,
                }),
              );
            }
            if (mobileData.length > 0) {
              this.eventBus.publish(
                new CreateKeywordsForBaiduEvent({
                  deviceTypeName: DeviceTypesEnum.Mobile,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords: mobileData,
                }),
              );
            }
            break;

          default:
            throw new BadRequestException('Search Engine not defined');
        }

        return new CreateProjectResponse({
          projectId: project.id,
          duplicateKeywordsWereMissed:
            projectPayload.keywords.length > 0 &&
            projectPayload.keywords.length * 2 !==
              desktopData.length + mobileData.length,
        });
      } else {
        const keywords =
          await this.keywordsService.eliminateDuplicationOfProjectKeywords(
            project.id,
            projectPayload.keywords,
            deviceType.name,
          );

        if (keywords.length > 0) {
          await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
            projectPayload.accountId,
            keywords.length,
          );

          switch (project.searchEngine.name) {
            case SearchEnginesEnum.Google:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                projectPayload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords,
                }),
              );
              break;
            case SearchEnginesEnum.GoogleMyBusiness:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                projectPayload.accountId,
                keywords.length * 5,
              );
              this.eventBus.publish(
                new CreateKeywordsForGoogleLocalEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords,
                }),
              );
              break;
            case SearchEnginesEnum.GoogleMaps:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                projectPayload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsForGoogleMapsEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords,
                }),
              );
              break;
            case SearchEnginesEnum.Bing:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                projectPayload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsForBingEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords,
                }),
              );
              break;
            case SearchEnginesEnum.Yahoo:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                projectPayload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsForBingEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords,
                }),
              );
              break;
            case SearchEnginesEnum.Baidu:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                projectPayload.accountId,
                keywords.length,
              );
              this.eventBus.publish(
                new CreateKeywordsForBaiduEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords,
                }),
              );
              break;
            case SearchEnginesEnum.YouTube:
              await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
                projectPayload.accountId,
                keywords.length * 5,
              );
              this.eventBus.publish(
                new CreateKeywordsForYoutubeEvent({
                  deviceTypeName: deviceType.name,
                  projectId: project.id,
                  accountId: projectPayload.accountId,
                  keywords,
                }),
              );
              break;
            default:
              throw new BadRequestException('Search Engine not defined');
          }
        }
        return new CreateProjectResponse({
          projectId: project.id,
          duplicateKeywordsWereMissed:
            projectPayload.keywords.length > 0 &&
            projectPayload.keywords.length !== keywords.length,
        });
      }
    }
  }

  /**
   * Creates a new project specific to Baidu search engine.
   *
   * @param {CreateProjectForBaiduType} newProject - The details of the new project to be created.
   * @return {Promise<CreateProjectResponse>} - A promise that resolves to the response object containing the project's ID and whether duplicate keywords were removed.
   */
  async createForBaidu(
    newProject: CreateProjectForBaiduType,
  ): Promise<CreateProjectResponse> {
    const account = await this.accountsService.getExistingUserAccount(
      newProject.user.id,
      newProject.accountId,
    );
    const url = newProject.url;

    const folder = await this.foldersService.getFolder(newProject.folderId);
    if (
      !(await this.foldersService.checkAvailabilityOfFolder(
        account.folders,
        folder.id,
      ))
    ) {
      throw new ForbiddenException('Folder is not available.');
    }

    const rootFolder = await this.foldersService.getAccountFolderBySystemName(
      newProject.accountId,
      SystemFolderNamesEnum.MyFolders,
    );
    if (rootFolder.id === folder.id) {
      throw new BadRequestException(
        'You cannot add projects to the root folder.',
      );
    }
    const creator = await this.usersService.getUser(newProject.user.id);

    const urlType = await this.projectUrlTypesService.getUrlTypeByName(
      newProject.projectUrlType,
    );

    const searchEngine = await this.searchEnginesService.getSearchEngine(
      newProject.searchEngine,
    );
    const checkFrequency = await this.checkFrequencyService.getCheckFrequency(
      newProject.checkFrequency,
    );
    const language = await this.languagesService.getLanguageForBaidu(
      newProject.languageId,
    );

    const location = await this.locationsService.getLocationForBaidu(
      newProject.locationId,
    );
    if (location.countryIsoCode != 'CN') {
      throw new BadRequestException(
        'The entered location does not match the region of China.',
      );
    }
    let tags: ProjectTagEntity[] = [];
    await this.accountLimitsService.checkAvailabilityOfAddingTagsToProject(
      newProject.accountId,
      (newProject.tags ? newProject.tags.length : 0) +
        (newProject.tagIds ? newProject.tagIds.length : 0),
    );

    if (newProject.tags && newProject.tags.length > 0) {
      tags = await this.tagsService.createTags(newProject.tags);
    }
    if (newProject.tagIds && newProject.tagIds.length > 0) {
      tags.push(...(await this.tagsService.getTagsByIds(newProject.tagIds)));
    }
    let competitors: CompetitorEntity[] = [];
    if (newProject.competitors) {
      competitors = await this.competitorsService.createCompetitors(
        newProject.competitors,
      );
    }

    const project = await this.projectRepository.save({
      projectName: newProject.projectName,
      url,
      location,
      language,
      searchEngine,
      checkFrequency,
      creator,
      account,
      tags: tags,
      competitors,
      users: [creator],
      urlType,
      updatedAt: null,
    });

    await this.accountLimitsService.accountCompetitorLimitAccounting(
      account.id,
      competitors.length,
    );
    this.eventBus.publish(
      new DetermineNumberOfAccountProjectsEvent({ accountId: account.id }),
    );
    await this.foldersService.addProjectToFolder(project, folder);
    if (newProject.note) {
      await this.notesService.createNotes(
        newProject.note,
        project,
        newProject.user,
      );
    }
    const uniqueNames = new Set(
      newProject.keywords.map((keyword) => keyword.toLowerCase()),
    );
    const keywords = Array.from(uniqueNames);
    if (newProject.deviceType === DeviceTypesEnum.DesktopAndMobile) {
      await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
        account.id,
        keywords.length * 2,
      );

      this.eventBus.publish(
        new CreateKeywordsForBaiduEvent({
          deviceTypeName: DeviceTypesEnum.DesktopAndMobile,
          projectId: project.id,
          accountId: account.id,
          keywords,
        }),
      );

      this.eventBus.publish(
        new AdditionOfKeywordsEvent({
          accountId: account.id,
          numberOfKeywordsToBeAdded: keywords.length * 2,
        }),
      );
    } else {
      await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
        account.id,
        keywords.length,
      );
      this.eventBus.publish(
        new CreateKeywordsForBaiduEvent({
          deviceTypeName: newProject.deviceType,
          projectId: project.id,
          accountId: account.id,
          keywords,
        }),
      );
      this.eventBus.publish(
        new AdditionOfKeywordsEvent({
          accountId: account.id,
          numberOfKeywordsToBeAdded: keywords.length,
        }),
      );
    }

    this.eventBus.publish(
      new AssignProjectToAFolderManagerEvent({
        folderId: folder.id,
        projectId: project.id,
      }),
    );
    return this.createProjectResponseFactory.createResponse(project, {
      numberOfNewKeywords:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? newProject.keywords.length * 2
          : newProject.keywords.length,
      numberOfKeywordsToBeAdded:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? keywords.length * 2
          : keywords.length,
      accountId: account.id,
    });
  }

  /**
   * Creates a new project for Yahoo based on provided project details.
   *
   * @param {CreateProjectForYahooType} newProject - The details of the new project to be created.
   * @return {Promise<CreateProjectResponse>} - A promise that resolves to the response of the project creation.
   */
  async createForYahoo(
    newProject: CreateProjectForYahooType,
  ): Promise<CreateProjectResponse> {
    const account = await this.accountsService.getExistingUserAccount(
      newProject.user.id,
      newProject.accountId,
    );
    const url = newProject.url;

    const folder = await this.foldersService.getFolder(newProject.folderId);
    if (
      !(await this.foldersService.checkAvailabilityOfFolder(
        account.folders,
        folder.id,
      ))
    ) {
      throw new ForbiddenException('Folder is not available.');
    }

    const rootFolder = await this.foldersService.getAccountFolderBySystemName(
      newProject.accountId,
      SystemFolderNamesEnum.MyFolders,
    );
    if (rootFolder.id === folder.id) {
      throw new BadRequestException(
        'You cannot add projects to the root folder.',
      );
    }
    const creator = await this.usersService.getUser(newProject.user.id);

    const urlType = await this.projectUrlTypesService.getUrlTypeByName(
      newProject.projectUrlType,
    );

    const searchEngine = await this.searchEnginesService.getSearchEngine(
      newProject.searchEngine,
    );
    const checkFrequency = await this.checkFrequencyService.getCheckFrequency(
      newProject.checkFrequency,
    );
    const language = await this.languagesService.getLanguageFotYahoo(
      newProject.languageId,
    );

    const location = await this.locationsService.getLocationForYahoo(
      newProject.locationId,
    );
    let tags: ProjectTagEntity[] = [];
    await this.accountLimitsService.checkAvailabilityOfAddingTagsToProject(
      newProject.accountId,
      (newProject.tags ? newProject.tags.length : 0) +
        (newProject.tagIds ? newProject.tagIds.length : 0),
    );

    if (newProject.tags && newProject.tags.length > 0) {
      tags = await this.tagsService.createTags(newProject.tags);
    }
    if (newProject.tagIds && newProject.tagIds.length > 0) {
      tags.push(...(await this.tagsService.getTagsByIds(newProject.tagIds)));
    }
    let competitors: CompetitorEntity[] = [];
    if (newProject.competitors) {
      competitors = await this.competitorsService.createCompetitors(
        newProject.competitors,
      );
    }

    const project = await this.projectRepository.save({
      projectName: newProject.projectName,
      url,
      location,
      language,
      searchEngine,
      checkFrequency,
      creator,
      account,
      tags: tags,
      competitors,
      users: [creator],
      urlType,
      updatedAt: null,
    });

    await this.accountLimitsService.accountCompetitorLimitAccounting(
      account.id,
      competitors.length,
    );
    this.eventBus.publish(
      new DetermineNumberOfAccountProjectsEvent({ accountId: account.id }),
    );
    await this.foldersService.addProjectToFolder(project, folder);
    if (newProject.note) {
      await this.notesService.createNotes(
        newProject.note,
        project,
        newProject.user,
      );
    }
    const uniqueNames = new Set(
      newProject.keywords.map((keyword) => keyword.toLowerCase()),
    );
    const keywords = Array.from(uniqueNames);
    if (newProject.deviceType === DeviceTypesEnum.DesktopAndMobile) {
      await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
        account.id,
        keywords.length * 2,
      );

      this.eventBus.publish(
        new CreateKeywordsForYahooEvent({
          deviceTypeName: DeviceTypesEnum.DesktopAndMobile,
          projectId: project.id,
          accountId: account.id,
          keywords,
        }),
      );

      this.eventBus.publish(
        new AdditionOfKeywordsEvent({
          accountId: account.id,
          numberOfKeywordsToBeAdded: keywords.length * 2,
        }),
      );
    } else {
      await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
        account.id,
        keywords.length,
      );
      this.eventBus.publish(
        new CreateKeywordsForYahooEvent({
          deviceTypeName: newProject.deviceType,
          projectId: project.id,
          accountId: account.id,
          keywords,
        }),
      );
      this.eventBus.publish(
        new AdditionOfKeywordsEvent({
          accountId: account.id,
          numberOfKeywordsToBeAdded: keywords.length,
        }),
      );
    }
    this.eventBus.publish(
      new AssignProjectToAFolderManagerEvent({
        folderId: folder.id,
        projectId: project.id,
      }),
    );
    return this.createProjectResponseFactory.createResponse(project, {
      numberOfNewKeywords:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? newProject.keywords.length * 2
          : newProject.keywords.length,
      numberOfKeywordsToBeAdded:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? keywords.length * 2
          : keywords.length,
      accountId: account.id,
    });
  }

  /**
   * Creates a new project specifically for Bing.
   *
   * @param {CreateProjectForBingType} newProject - The information and configuration for the new Bing project.
   * @return {Promise<CreateProjectResponse>} A promise that resolves to the response object of the newly created project.
   */
  @Transactional()
  async createForBing(
    newProject: CreateProjectForBingType,
  ): Promise<CreateProjectResponse> {
    const account = await this.accountsService.getExistingUserAccount(
      newProject.user.id,
      newProject.accountId,
    );
    const url = newProject.url;

    const folder = await this.foldersService.getFolder(newProject.folderId);
    if (
      !(await this.foldersService.checkAvailabilityOfFolder(
        account.folders,
        folder.id,
      ))
    ) {
      throw new ForbiddenException('Folder is not available.');
    }

    const rootFolder = await this.foldersService.getAccountFolderBySystemName(
      newProject.accountId,
      SystemFolderNamesEnum.MyFolders,
    );
    if (rootFolder.id === folder.id) {
      throw new BadRequestException(
        'You cannot add projects to the root folder.',
      );
    }
    const creator = await this.usersService.getUser(newProject.user.id);

    const urlType = await this.projectUrlTypesService.getUrlTypeByName(
      newProject.projectUrlType,
    );

    const searchEngine = await this.searchEnginesService.getSearchEngine(
      newProject.searchEngine,
    );
    const checkFrequency = await this.checkFrequencyService.getCheckFrequency(
      newProject.checkFrequency,
    );
    const language = await this.languagesService.getLanguageForBing(
      newProject.languageId,
    );

    const location = await this.locationsService.getLocationForBing(
      newProject.locationId,
    );
    let tags: ProjectTagEntity[] = [];
    await this.accountLimitsService.checkAvailabilityOfAddingTagsToProject(
      newProject.accountId,
      (newProject.tags ? newProject.tags.length : 0) +
        (newProject.tagIds ? newProject.tagIds.length : 0),
    );

    if (newProject.tags && newProject.tags.length > 0) {
      tags = await this.tagsService.createTags(newProject.tags);
    }
    if (newProject.tagIds && newProject.tagIds.length > 0) {
      tags.push(...(await this.tagsService.getTagsByIds(newProject.tagIds)));
    }
    let competitors: CompetitorEntity[] = [];
    if (newProject.competitors) {
      competitors = await this.competitorsService.createCompetitors(
        newProject.competitors,
      );
    }

    const project = await this.projectRepository.save({
      projectName: newProject.projectName,
      url,
      location,
      language,
      searchEngine,
      checkFrequency,
      creator,
      account,
      tags: tags,
      competitors,
      users: [creator],
      urlType,
      updatedAt: null,
    });

    await this.accountLimitsService.accountCompetitorLimitAccounting(
      account.id,
      competitors.length,
    );
    this.eventBus.publish(
      new DetermineNumberOfAccountProjectsEvent({ accountId: account.id }),
    );
    await this.foldersService.addProjectToFolder(project, folder);
    if (newProject.note) {
      await this.notesService.createNotes(
        newProject.note,
        project,
        newProject.user,
      );
    }
    const uniqueNames = new Set(
      newProject.keywords.map((keyword) => keyword.toLowerCase()),
    );
    const keywords = Array.from(uniqueNames);
    if (newProject.deviceType === DeviceTypesEnum.DesktopAndMobile) {
      await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
        account.id,
        keywords.length * 2,
      );

      this.eventBus.publish(
        new CreateKeywordsForBingEvent({
          deviceTypeName: DeviceTypesEnum.DesktopAndMobile,
          projectId: project.id,
          accountId: account.id,
          keywords,
        }),
      );

      this.eventBus.publish(
        new AdditionOfKeywordsEvent({
          accountId: account.id,
          numberOfKeywordsToBeAdded: keywords.length * 2,
        }),
      );
    } else {
      await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
        account.id,
        keywords.length,
      );
      this.eventBus.publish(
        new CreateKeywordsForBingEvent({
          deviceTypeName: newProject.deviceType,
          projectId: project.id,
          accountId: account.id,
          keywords,
        }),
      );
      this.eventBus.publish(
        new AdditionOfKeywordsEvent({
          accountId: account.id,
          numberOfKeywordsToBeAdded: keywords.length,
        }),
      );
    }
    this.eventBus.publish(
      new AssignProjectToAFolderManagerEvent({
        folderId: folder.id,
        projectId: project.id,
      }),
    );
    return this.createProjectResponseFactory.createResponse(project, {
      numberOfNewKeywords:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? newProject.keywords.length * 2
          : newProject.keywords.length,
      numberOfKeywordsToBeAdded:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? keywords.length * 2
          : keywords.length,
      accountId: account.id,
    });
  }

  /**
   * Creates a new YouTube project with the specified parameters.
   *
   * @param {CreateProjectForYoutubeType} newProject - Object containing details required for creating the YouTube project.
   * @return {Promise<CreateProjectResponse>} Response containing the project ID and whether any duplicate keywords were skipped.
   */
  @Transactional()
  async createForYoutube(
    newProject: CreateProjectForYoutubeType,
  ): Promise<CreateProjectResponse> {
    const account = await this.accountsService.getExistingUserAccount(
      newProject.user.id,
      newProject.accountId,
    );
    const url = newProject.videoUrl;
    const folder = await this.foldersService.getFolder(newProject.folderId);
    if (
      !(await this.foldersService.checkAvailabilityOfFolder(
        account.folders,
        folder.id,
      ))
    ) {
      throw new ForbiddenException('Folder is not available.');
    }
    const rootFolder = await this.foldersService.getAccountFolderBySystemName(
      newProject.accountId,
      SystemFolderNamesEnum.MyFolders,
    );
    if (rootFolder.id === folder.id) {
      throw new BadRequestException(
        'You cannot add projects to the root folder.',
      );
    }
    const creator = await this.usersService.getUser(newProject.user.id);
    const searchEngine = await this.searchEnginesService.getSearchEngine(
      newProject.searchEngines,
    );
    const checkFrequency = await this.checkFrequencyService.getCheckFrequency(
      newProject.checkFrequency,
    );
    const language = await this.languagesService.getLanguageForYoutube(
      newProject.languageId,
    );

    const location = await this.locationsService.getLocationForYoutube(
      newProject.locationId,
    );

    let tags: ProjectTagEntity[] = [];
    await this.accountLimitsService.checkAvailabilityOfAddingTagsToProject(
      newProject.accountId,
      (newProject.tags ? newProject.tags.length : 0) +
        (newProject.tagIds ? newProject.tagIds.length : 0),
    );
    if (newProject.tags && newProject.tags.length > 0) {
      tags = await this.tagsService.createTags(newProject.tags);
    }
    if (newProject.tagIds && newProject.tagIds.length > 0) {
      tags.push(...(await this.tagsService.getTagsByIds(newProject.tagIds)));
    }
    let competitors: CompetitorEntity[] = [];
    if (newProject.competitorsVideoUrl) {
      competitors = await this.competitorsService.createCompetitors(
        newProject.competitorsVideoUrl,
      );
    }
    const project = await this.projectRepository.save({
      projectName: newProject.projectName,
      url,
      location,
      language,
      searchEngine,
      checkFrequency,
      creator,
      account,
      tags: tags,
      competitors,
      updatedAt: null,
      users: [creator],
    });
    await this.accountLimitsService.accountCompetitorLimitAccounting(
      account.id,
      competitors.length,
    );
    this.eventBus.publish(
      new DetermineNumberOfAccountProjectsEvent({ accountId: account.id }),
    );
    await this.foldersService.addProjectToFolder(project, folder);
    if (newProject.note) {
      await this.notesService.createNotes(
        newProject.note,
        project,
        newProject.user,
      );
    }
    const uniqueNames = new Set(
      newProject.keywords.map((keyword) => keyword.toLowerCase()),
    );
    const keywords = Array.from(uniqueNames);
    await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
      account.id,
      keywords.length,
    );

    this.eventBus.publish(
      new CreateKeywordsForYoutubeEvent({
        deviceTypeName: newProject.deviceType,
        projectId: project.id,
        accountId: account.id,
        keywords,
      }),
    );
    this.eventBus.publish(
      new AdditionOfKeywordsEvent({
        accountId: account.id,
        numberOfKeywordsToBeAdded: keywords.length,
      }),
    );
    this.eventBus.publish(
      new AssignProjectToAFolderManagerEvent({
        folderId: folder.id,
        projectId: project.id,
      }),
    );

    return this.createProjectResponseFactory.createResponse(project, {
      numberOfNewKeywords:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? newProject.keywords.length * 2
          : newProject.keywords.length,
      numberOfKeywordsToBeAdded:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? keywords.length * 2
          : keywords.length,
      accountId: account.id,
    });
  }

  /**
   * Creates a new project for Google Maps.
   *
   * @param {CreateProjectForGoogleMapsType} newProject - The details for the new project to be created.
   * @returns {Promise<CreateProjectResponse>} The response containing details about the created project.
   * @throws {ForbiddenException} If the folder is not available.
   * @throws {BadRequestException} If attempting to add projects to the root folder.
   */
  @Transactional()
  async createForGoogleMaps(
    newProject: CreateProjectForGoogleMapsType,
  ): Promise<CreateProjectResponse> {
    const account = await this.accountsService.getExistingUserAccount(
      newProject.user.id,
      newProject.accountId,
    );
    const url = newProject.businessUrl;
    const folder = await this.foldersService.getFolder(newProject.folderId);
    if (
      !(await this.foldersService.checkAvailabilityOfFolder(
        account.folders,
        folder.id,
      ))
    ) {
      throw new ForbiddenException('Folder is not available.');
    }
    const rootFolder = await this.foldersService.getAccountFolderBySystemName(
      newProject.accountId,
      SystemFolderNamesEnum.MyFolders,
    );
    if (rootFolder.id === folder.id) {
      throw new BadRequestException(
        'You cannot add projects to the root folder.',
      );
    }
    const creator = await this.usersService.getUser(newProject.user.id);
    const region = await this.googleDomainsService.getGoogleDomain(
      newProject.regionId,
    );
    const searchEngine = await this.searchEnginesService.getSearchEngine(
      newProject.searchEngine,
    );
    const checkFrequency = await this.checkFrequencyService.getCheckFrequency(
      newProject.checkFrequency,
    );
    const language = await this.languagesService.getLanguageForGoogle(
      newProject.languageId,
    );

    const location = await this.locationsService.getLocationForGoogle(
      newProject.locationId,
    );

    let tags: ProjectTagEntity[] = [];
    await this.accountLimitsService.checkAvailabilityOfAddingTagsToProject(
      newProject.accountId,
      (newProject.tags ? newProject.tags.length : 0) +
        (newProject.tagIds ? newProject.tagIds.length : 0),
    );
    if (newProject.tags && newProject.tags.length > 0) {
      tags = await this.tagsService.createTags(newProject.tags);
    }
    if (newProject.tagIds && newProject.tagIds.length > 0) {
      tags.push(...(await this.tagsService.getTagsByIds(newProject.tagIds)));
    }
    let competitors: CompetitorEntity[] = [];
    if (newProject.competitors) {
      competitors = await this.competitorsService.createBusinessCompetitors(
        newProject.competitors,
      );
    }
    const project = await this.projectRepository.save({
      projectName: newProject.projectName,
      businessName: newProject.businessName,
      url,
      region,
      location,
      language,
      searchEngine,
      checkFrequency,
      creator,
      account,
      tags: tags,
      competitors,
      users: [creator],
      updatedAt: null,
    });

    await this.accountLimitsService.accountCompetitorLimitAccounting(
      account.id,
      competitors.length,
    );
    this.eventBus.publish(
      new DetermineNumberOfAccountProjectsEvent({ accountId: account.id }),
    );
    await this.foldersService.addProjectToFolder(project, folder);
    if (newProject.note) {
      await this.notesService.createNotes(
        newProject.note,
        project,
        newProject.user,
      );
    }
    const uniqueNames = new Set(
      newProject.keywords.map((keyword) => keyword.toLowerCase()),
    );
    const keywords = Array.from(uniqueNames);
    await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
      account.id,
      keywords.length,
    );
    this.eventBus.publish(
      new CreateKeywordsForGoogleMapsEvent({
        deviceTypeName: newProject.deviceType,
        projectId: project.id,
        accountId: account.id,
        keywords,
      }),
    );
    this.eventBus.publish(
      new AdditionOfKeywordsEvent({
        accountId: account.id,
        numberOfKeywordsToBeAdded: keywords.length,
      }),
    );
    this.eventBus.publish(
      new AssignProjectToAFolderManagerEvent({
        folderId: folder.id,
        projectId: project.id,
      }),
    );
    return this.createProjectResponseFactory.createResponse(project, {
      numberOfNewKeywords:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? newProject.keywords.length * 2
          : newProject.keywords.length,
      numberOfKeywordsToBeAdded:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? keywords.length * 2
          : keywords.length,
      accountId: account.id,
    });
  }

  /**
   * Creates a new project for Google Local based on the specified parameters.
   *
   * @param {CreateProjectForGoogleLocalType} newProject - The details of the project to be created, including account, location, tags, and competitors.
   * @return {Promise<CreateProjectResponse>} - A promise that resolves to a response containing the project ID and status of duplicate keywords.
   */
  async createForGoogleLocal(
    newProject: CreateProjectForGoogleLocalType,
  ): Promise<CreateProjectResponse> {
    const account = await this.accountsService.getExistingUserAccount(
      newProject.user.id,
      newProject.accountId,
    );
    const url = newProject.businessUrl;
    const folder = await this.foldersService.getFolder(newProject.folderId);
    if (
      !(await this.foldersService.checkAvailabilityOfFolder(
        account.folders,
        folder.id,
      ))
    ) {
      throw new ForbiddenException('Folder is not available.');
    }
    const rootFolder = await this.foldersService.getAccountFolderBySystemName(
      newProject.accountId,
      SystemFolderNamesEnum.MyFolders,
    );
    if (rootFolder.id === folder.id) {
      throw new BadRequestException(
        'You cannot add projects to the root folder.',
      );
    }
    const creator = await this.usersService.getUser(newProject.user.id);
    const searchEngine = await this.searchEnginesService.getSearchEngine(
      newProject.searchEngines,
    );
    const checkFrequency = await this.checkFrequencyService.getCheckFrequency(
      newProject.checkFrequency,
    );
    const language = await this.languagesService.getLanguageForGoogle(
      newProject.languageId,
    );

    const location = await this.locationsService.getLocationForGoogle(
      newProject.locationId,
    );

    let tags: ProjectTagEntity[] = [];
    await this.accountLimitsService.checkAvailabilityOfAddingTagsToProject(
      newProject.accountId,
      (newProject.tags ? newProject.tags.length : 0) +
        (newProject.tagIds ? newProject.tagIds.length : 0),
    );
    if (newProject.tags && newProject.tags.length > 0) {
      tags = await this.tagsService.createTags(newProject.tags);
    }
    if (newProject.tagIds && newProject.tagIds.length > 0) {
      tags.push(...(await this.tagsService.getTagsByIds(newProject.tagIds)));
    }
    let competitors: CompetitorEntity[] = [];
    if (newProject.competitors) {
      competitors = await this.competitorsService.createBusinessCompetitors(
        newProject.competitors,
      );
    }
    const project = await this.projectRepository.save({
      projectName: newProject.projectName,
      businessName: newProject.businessName,
      url,
      location,
      language,
      searchEngine,
      checkFrequency,
      creator,
      account,
      tags: tags,
      competitors,
      users: [creator],
      updatedAt: null,
    });

    await this.accountLimitsService.accountCompetitorLimitAccounting(
      account.id,
      competitors.length,
    );
    this.eventBus.publish(
      new DetermineNumberOfAccountProjectsEvent({ accountId: account.id }),
    );
    await this.foldersService.addProjectToFolder(project, folder);
    if (newProject.note) {
      await this.notesService.createNotes(
        newProject.note,
        project,
        newProject.user,
      );
    }
    const uniqueNames = new Set(
      newProject.keywords.map((keyword) => keyword.toLowerCase()),
    );
    const keywords = Array.from(uniqueNames);
    await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
      account.id,
      keywords.length,
    );
    this.eventBus.publish(
      new CreateKeywordsForGoogleLocalEvent({
        deviceTypeName: newProject.deviceType,
        projectId: project.id,
        accountId: account.id,
        keywords,
      }),
    );
    this.eventBus.publish(
      new AdditionOfKeywordsEvent({
        accountId: account.id,
        numberOfKeywordsToBeAdded: keywords.length,
      }),
    );
    this.eventBus.publish(
      new AssignProjectToAFolderManagerEvent({
        folderId: folder.id,
        projectId: project.id,
      }),
    );
    return this.createProjectResponseFactory.createResponse(project, {
      numberOfNewKeywords:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? newProject.keywords.length * 2
          : newProject.keywords.length,
      numberOfKeywordsToBeAdded:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? keywords.length * 2
          : keywords.length,
      accountId: account.id,
    });
  }

  /**
   * Creates a new project with the specified details and persists it to the database.
   *
   * @param {CreateProjectType} newProject - The project details required to create the project.
   *    Includes user ID, account ID, URL, folder ID, project URL type, region ID, search engine,
   *    check frequency, language ID, location ID, tags, tag IDs, competitors, note, keywords,
   *    and device type.
   * @return {Promise<CreateProjectResponse>} A promise resolving to an object containing the
   *    newly created project's ID and a flag indicating if duplicate keywords were skipped.
   *
   * @throws {ForbiddenException} If the specified folder is not available.
   * @throws {BadRequestException} If an attempt is made to add the project to the root folder.
   */
  @Transactional()
  async create(newProject: CreateProjectType): Promise<CreateProjectResponse> {
    const account = await this.accountsService.getExistingUserAccount(
      newProject.user.id,
      newProject.accountId,
    );
    const url = newProject.url;

    const folder = await this.foldersService.getFolder(newProject.folderId);
    if (
      !(await this.foldersService.checkAvailabilityOfFolder(
        account.folders,
        folder.id,
      ))
    ) {
      throw new ForbiddenException('Folder is not available.');
    }

    const rootFolder = await this.foldersService.getAccountFolderBySystemName(
      newProject.accountId,
      SystemFolderNamesEnum.MyFolders,
    );
    if (rootFolder.id === folder.id) {
      throw new BadRequestException(
        'You cannot add projects to the root folder.',
      );
    }
    const creator = await this.usersService.getUser(newProject.user.id);

    const urlType = await this.projectUrlTypesService.getUrlTypeByName(
      newProject.projectUrlType,
    );

    const region = await this.googleDomainsService.getGoogleDomain(
      newProject.regionId,
    );
    const searchEngine = await this.searchEnginesService.getSearchEngine(
      newProject.searchEngine,
    );
    const checkFrequency = await this.checkFrequencyService.getCheckFrequency(
      newProject.checkFrequency,
    );
    const language = await this.languagesService.getLanguageForGoogle(
      newProject.languageId,
    );

    const location = await this.locationsService.getLocationForGoogle(
      newProject.locationId,
    );
    let tags: ProjectTagEntity[] = [];
    await this.accountLimitsService.checkAvailabilityOfAddingTagsToProject(
      newProject.accountId,
      (newProject.tags ? newProject.tags.length : 0) +
        (newProject.tagIds ? newProject.tagIds.length : 0),
    );

    if (newProject.tags && newProject.tags.length > 0) {
      tags = await this.tagsService.createTags(newProject.tags);
    }
    if (newProject.tagIds && newProject.tagIds.length > 0) {
      tags.push(...(await this.tagsService.getTagsByIds(newProject.tagIds)));
    }
    let competitors: CompetitorEntity[] = [];
    if (newProject.competitors) {
      competitors = await this.competitorsService.createCompetitors(
        newProject.competitors,
      );
    }
    await this.accountLimitsService.accountCompetitorLimitAccounting(
      account.id,
      competitors.length,
    );
    const project = await this.projectRepository.save({
      projectName: newProject.projectName,
      url,
      location,
      language,
      searchEngine,
      region,
      checkFrequency,
      creator,
      account,
      tags: tags,
      competitors,
      users: [creator],
      urlType,
      updatedAt: null,
    });

    this.eventBus.publish(
      new DetermineNumberOfAccountProjectsEvent({ accountId: account.id }),
    );
    await this.foldersService.addProjectToFolder(project, folder);
    if (newProject.note) {
      await this.notesService.createNotes(
        newProject.note,
        project,
        newProject.user,
      );
    }
    const uniqueNames = new Set(
      newProject.keywords.map((keyword) => keyword.toLowerCase()),
    );
    const keywords = Array.from(uniqueNames);
    if (newProject.deviceType === DeviceTypesEnum.DesktopAndMobile) {
      await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
        account.id,
        keywords.length * 2,
      );

      this.eventBus.publish(
        new CreateKeywordsEvent({
          deviceTypeName: DeviceTypesEnum.DesktopAndMobile,
          projectId: project.id,
          accountId: account.id,
          keywords,
        }),
      );

      this.eventBus.publish(
        new AdditionOfKeywordsEvent({
          accountId: account.id,
          numberOfKeywordsToBeAdded: keywords.length * 2,
        }),
      );
    } else {
      await this.accountLimitsService.checkTotalNumberOfKeywordsInAccount(
        account.id,
        keywords.length,
      );
      this.eventBus.publish(
        new CreateKeywordsEvent({
          deviceTypeName: newProject.deviceType,
          projectId: project.id,
          accountId: account.id,
          keywords,
        }),
      );
      this.eventBus.publish(
        new AdditionOfKeywordsEvent({
          accountId: account.id,
          numberOfKeywordsToBeAdded: keywords.length,
        }),
      );
    }
    this.eventBus.publish(
      new AssignProjectToAFolderManagerEvent({
        folderId: folder.id,
        projectId: project.id,
      }),
    );

    return this.createProjectResponseFactory.createResponse(project, {
      numberOfNewKeywords:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? newProject.keywords.length * 2
          : newProject.keywords.length,
      numberOfKeywordsToBeAdded:
        newProject.deviceType === DeviceTypesEnum.DesktopAndMobile
          ? keywords.length * 2
          : keywords.length,
      accountId: account.id,
    });
  }
}
