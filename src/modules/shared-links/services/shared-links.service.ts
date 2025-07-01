import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SharedLinkRepository } from 'modules/shared-links/repositories/shared-link.repository';
import { CreateSharedLinkType } from 'modules/shared-links/types/create-shared-link.type';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SharedLinkSettingRepository } from 'modules/shared-links/repositories/shared-link-setting.repository';
import { SharedLinkTypeRepository } from 'modules/shared-links/repositories/shared-link-type.repository';
import { SharedLinkTypeEnum } from 'modules/shared-links/enums/shared-link-type.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { GetAllSharedLinksRequest } from 'modules/shared-links/requests/get-all-shared-links.request';
import { SharedLinksResponse } from 'modules/shared-links/responses/shared-links.response';
import { UpdateSharedLinkType } from 'modules/shared-links/types/update-shared-link.type';
import { SharedLinkEntity } from 'modules/shared-links/entities/shared-link.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { SharedLinkWithoutPasswordType } from 'modules/shared-links/types/shared-link-without-password.type';
import { ProjectsBySharedLinkResponse } from 'modules/shared-links/responses/projects-by-shared-link.response';
import { CreateSharedLinkResponse } from 'modules/shared-links/responses/create-shared-link.response';
import { BulkDeleteSharedLinksType } from 'modules/shared-links/types/bulk-delete-shared-links.type';
import { ProjectsBySharedLinkResponseFactory } from 'modules/shared-links/factories/projects-by-shared-link-response.factory';
import { GetSharedRequest } from 'modules/shared-links/requests/get-shared.request';
import { SharedLinksResponseFactory } from 'modules/shared-links/factories/shared-links-response.factory';
import { LoginType } from 'modules/shared-links/types/login.type';
import { UserAuthService } from 'modules/auth/services/user-auth.service';
import { SharedAccessTokenResponse } from 'modules/shared-links/responses/shared-access-token.response';
import { SingleSharedLinkResponse } from 'modules/shared-links/responses/single-shared-link.response';
import { ProjectInfoType } from 'modules/shared-links/types/project-info.type';
import { ProjectInfoResponse } from 'modules/shared-links/responses/project-info.response';
import { ProjectInfoResponseFactory } from 'modules/projects/factories/project-info-response.factory';
import { GetOverviewType } from 'modules/shared-links/types/get-overview.type';
import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { ProjectOverviewFactory } from 'modules/projects/factories/project-overview.factory';
import { GetImprovedVsDeclinedType } from 'modules/shared-links/types/get-improved-vs-declined.type';
import { ImprovedVsDeclinedFactory } from 'modules/projects/factories/improved-vs-declined.factory';
import { ImprovedVsDeclinedArrayResponse } from 'modules/projects/responses/improved-vs-declined-array.response';
import { KeywordTrendsRequest } from 'modules/projects/requests/keyword-trends.request';
import { KeywordTrendsResponseFactory } from 'modules/projects/factories/keyword-trends-response.factory';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { GetKeywordRankingsType } from 'modules/shared-links/types/get-keyword-rankings.type';
import { PositionHistoryType } from 'modules/keywords/types/position-history.type';
import { PositionHistoryResponse } from 'modules/keywords/responses/position-history.response';
import { GetProjectPerformanceType } from 'modules/projects/types/get-project-performance.type';
import { ProjectPerformanceResponse } from 'modules/keywords/responses/project-performance.response';
import { SearchResultsType } from 'modules/keywords/types/search-results.type';
import { SearchResultsRequest } from 'modules/keywords/requests/search-results.request';
import { SearchResultsResponse } from 'modules/keywords/responses/search-results.response';
import { KeywordRankingsBySharedLinkRequest } from 'modules/shared-links/requests/keyword-rankings-by-shared-link.request';
import { CompetitorsService } from 'modules/competitors/services/competitors.service';
import { SharedLinkInfoResponseFactory } from 'modules/shared-links/factories/shared-linkInfo-response.factory';
import { SharedLinkInfoResponse } from 'modules/shared-links/responses/shared-link-info.response';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { ProjectTagEntity } from 'modules/tags/entities/project-tag.entity';
import { NoteEntity } from 'modules/notes/entities/note.entity';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { ProjectsTagsService } from 'modules/tags/services/projects-tags.service';
import { NotesService } from 'modules/notes/services/notes.service';
import { KeywordsTagsService } from 'modules/tags/services/keywords-tags.service';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { GetSearchResultsType } from 'modules/keywords/types/get-search-results.type';
import { GetKeywordPositionsInfoForSharedLinkType } from 'modules/shared-links/types/get-keyword-positions-info-for-shared-link.type';
import { GetProjectPerformanceForSharedLinkType } from 'modules/shared-links/types/get-project-performance-for-shared-link.type';
import { GetSharedKeywordType } from 'modules/shared-links/types/get-shared-keyword.type';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { GetKeywordResponse } from 'modules/keywords/responses/get-keyword.response';
import { GetKeywordResponseFactory } from 'modules/keywords/factories/get-keyword-response.factory';
import { SharedKeywordPositionsInfoType } from 'modules/shared-links/types/shared-keyword-positions-info.type';
import { KeywordsPositionsService } from 'modules/keywords/services/keywords-positions.service';
import { KeywordPositionsInfoRequest } from 'modules/keywords/requests/keyword-positions-info.request';
import { PaginatedKeywordPositionsInfoResponse } from 'modules/keywords/responses/paginated-keyword-positions-info.response';
import { SharedKeywordPositionsInfoExportToCsvType } from 'modules/shared-links/types/shared-keyword-positions-info-export-to-csv.type';
import { SharedPositionHistoryType } from 'modules/shared-links/types/shared-position-history.type';

@Injectable()
export class SharedLinksService {
  constructor(
    private readonly sharedLinkRepositories: SharedLinkRepository,
    private readonly sharedLinkSettingRepository: SharedLinkSettingRepository,
    private readonly projectsService: ProjectsService,
    private readonly cryptoUtilsService: CryptoUtilsService,
    private readonly sharedLinkTypeRepository: SharedLinkTypeRepository,
    private readonly configService: ConfigService,
    private readonly projectsBySharedLinkResponseFactory: ProjectsBySharedLinkResponseFactory,
    private readonly sharedLinksResponseFactory: SharedLinksResponseFactory,
    private readonly userAuthService: UserAuthService,
    private readonly projectInfoResponseFactory: ProjectInfoResponseFactory,
    private readonly keywordsService: KeywordsService,
    private readonly projectOverviewFactory: ProjectOverviewFactory,
    private readonly improvedVsDeclinedFactory: ImprovedVsDeclinedFactory,
    private readonly keywordTrendsResponseFactory: KeywordTrendsResponseFactory,
    private readonly competitorsService: CompetitorsService,
    private readonly sharedLinkInfoResponseFactory: SharedLinkInfoResponseFactory,
    private readonly projectRepository: ProjectRepository,
    private readonly gatewayService: GatewayService,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly tagsService: ProjectsTagsService,
    private readonly notesService: NotesService,
    private readonly keywordsTagsService: KeywordsTagsService,
    private readonly keywordRepository: KeywordRepository,
    private readonly getKeywordResponseFactory: GetKeywordResponseFactory,
    private readonly keywordsPositionsService: KeywordsPositionsService,
  ) {}

  /**
   * Fetches the position history based on the given payload.
   *
   * @param {SharedPositionHistoryType} payload - The data required to fetch the position history, which includes link, keywordId, and other relevant information.
   * @return {Promise<PositionHistoryResponse>} - A promise that resolves to the position history response.
   * @throws {ForbiddenException} - If access is denied.
   */
  async getPositionHistory(
    payload: SharedPositionHistoryType,
  ): Promise<PositionHistoryResponse> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    if (!link) {
      throw new ForbiddenException('Access denied.');
    }

    return this.keywordsService.getPositionHistory({
      ...payload,
      keywordId: payload.keywordId,
      accountId: link.account.id,
      userId: link.account.owner.id,
    });
  }

  /**
   * Exports keyword positions information to a CSV file based on the provided payload.
   *
   * @param {SharedKeywordPositionsInfoExportToCsvType} payload - The payload containing the required data for export.
   * @param {string} payload.link - A shared link to validate access.
   * @param {number} payload.keywordId - The ID of the keyword for which positions information will be exported.
   * @return {Promise<any[]>} A promise that resolves to an array containing the keyword positions information in CSV format.
   * @throws {ForbiddenException} If access is denied due to an invalid shared link.
   */
  async keywordPositionsInfoExportToCsv(
    payload: SharedKeywordPositionsInfoExportToCsvType,
  ): Promise<{ csvData: any[]; keywordName: string }> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    if (!link) {
      throw new ForbiddenException('Access denied.');
    }
    return this.keywordsPositionsService.keywordPositionsInfoExportToCsv({
      accountId: link.account.id,
      keywordId: payload.keywordId,
    });
  }

  /**
   * Retrieves keyword position information for a given link and keyword ID.
   *
   * @param {SharedKeywordPositionsInfoType} payload - Contains the link and keyword ID for which the keyword position information is required.
   * @param {KeywordPositionsInfoRequest} options - Additional optional parameters to customize the request.
   * @return {Promise<PaginatedKeywordPositionsInfoResponse>} A promise that resolves to the paginated response containing keyword positions information.
   */
  async keywordPositionsInfo(
    payload: SharedKeywordPositionsInfoType,
    options: KeywordPositionsInfoRequest,
  ): Promise<PaginatedKeywordPositionsInfoResponse> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    if (!link) {
      throw new ForbiddenException('Access denied.');
    }
    return this.keywordsPositionsService.keywordPositionsInfo(
      { accountId: link.account.id, keywordId: payload.keywordId },
      { ...options },
    );
  }

  /**
   * Retrieves the keyword information based on the provided payload.
   *
   * @param {GetSharedKeywordType} payload - The payload containing the keyword ID and link.
   * @return {Promise<GetKeywordResponse>} - Returns a promise that resolves to the keyword information.
   * @throws {ForbiddenException} - Throws an exception if access is denied.
   * @throws {NotFoundException} - Throws an exception if the keyword is not found.
   */
  async getKeyword(payload: GetSharedKeywordType): Promise<GetKeywordResponse> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    if (!link) {
      throw new ForbiddenException('Access denied.');
    }
    const keyword = await this.keywordRepository.getKeywordById(
      payload.keywordId,
    );

    if (!keyword || keyword.project.account.id != link.account.id) {
      throw new NotFoundException('Keyword not found.');
    }

    return this.getKeywordResponseFactory.createResponse(keyword);
  }

  /**
   * Retrieves shared link information based on the provided link.
   *
   * @param {string} link - The shared link for which to retrieve information.
   * @return {Promise<SharedLinkInfoResponse>} A promise that resolves to the shared link information response.
   */
  async getSharedLinkInfo(link: string): Promise<SharedLinkInfoResponse> {
    const sharedLink =
      await this.sharedLinkRepositories.sharedLinkByLinkWithAccount(link);
    return this.sharedLinkInfoResponseFactory.createResponse(sharedLink);
  }

  /**
   * Retrieves keyword rankings based on the provided payload and options.
   *
   * @param {GetKeywordRankingsType} payload - An object containing the link and project ID information.
   * @param {KeywordRankingsBySharedLinkRequest} options - Additional options for fetching keyword rankings.
   * @return {Promise<KeywordRankingsResponse>} A promise that resolves to the keyword rankings response.
   */
  async getKeywordRankings(
    payload: GetKeywordRankingsType,
    options: KeywordRankingsBySharedLinkRequest,
  ): Promise<KeywordRankingsResponse> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );

    return this.keywordsService.getKeywordRankings(
      { projectId: payload.projectId, accountId: link.account.id },
      options,
    );
  }

  /**
   * Retrieves the performance metrics of a project using a shared link.
   *
   * @param {GetProjectPerformanceForSharedLinkType} payload - The input data needed to fetch project performance, including the shared link.
   * @return {Promise<ProjectPerformanceResponse>} A promise that resolves to the performance metrics of the specified project.
   */
  async getProjectPerformance(
    payload: GetProjectPerformanceForSharedLinkType,
  ): Promise<ProjectPerformanceResponse> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    return this.keywordsService.getProjectPerformance({
      ...payload,
      accountId: link.account.id,
    });
  }

  /**
   * Retrieves search results based on the provided parameters.
   *
   * @param {GetSearchResultsType} payload - The request payload containing the link and keyword ID.
   * @param {SearchResultsRequest} options - Additional options for the search results request.
   * @return {Promise<SearchResultsResponse>} A promise that resolves to the search results response.
   */
  async getSearchResults(
    payload: GetSearchResultsType,
    options: SearchResultsRequest,
  ): Promise<SearchResultsResponse> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    return this.keywordsService.searchResults(
      { accountId: link.account.id, keywordId: payload.keywordId },
      options,
    );
  }

  /**
   * Retrieves the keyword position information for a specified shared link.
   *
   * @param {GetKeywordPositionsInfoForSharedLinkType} payload - The payload containing details required to fetch the keyword positions.
   * @param {string} payload.link - The shared link for which the position information needs to be retrieved.
   * @param {Array<string>} payload.keywords - The list of keywords to get the position history for.
   *
   * @return {Promise<PositionHistoryResponse>} A promise that resolves to the position history response.
   */
  async getKeywordPositionsInfo(
    payload: GetKeywordPositionsInfoForSharedLinkType,
  ): Promise<PositionHistoryResponse> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    return this.keywordsService.getPositionHistory({
      ...payload,
      accountId: link.account.id,
    });
  }

  /**
   * Fetches and returns an array response containing statistics about improved versus declined keywords
   * based on the provided payload.
   *
   * @param {GetImprovedVsDeclinedType} payload - The data required to fetch and compute the improved vs declined statistics.
   * @return {Promise<ImprovedVsDeclinedArrayResponse>} A promise that resolves to an array response with improved versus declined keyword statistics.
   */
  async getImprovedVsDeclined(
    payload: GetImprovedVsDeclinedType,
  ): Promise<ImprovedVsDeclinedArrayResponse> {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    const statistics = await this.keywordsService.improvedVsDeclined({
      ...payload,
      accountId: link.account.id,
    });
    return this.improvedVsDeclinedFactory.createResponse(statistics, {
      ...payload,
    });
  }

  /**
   * Retrieves the keyword trends for a given project and link based on the specified query parameters.
   *
   * @param {IdType} projectId - The ID of the project for which to retrieve keyword trends.
   * @param {string} link - The link associated with the shared resource.
   * @param {KeywordTrendsRequest} query - The query parameters including period and device type for the keyword trends.
   * @return {Promise<KeywordTrendsResponse>} A promise that resolves to the keyword trends response.
   */
  async getKeywordTrends(
    projectId: IdType,
    link: string,
    query: KeywordTrendsRequest,
  ): Promise<KeywordTrendsResponse> {
    const sharedLink = await this.sharedLinkRepositories.sharedLinkByLink(link);
    const keywordTrends = await this.keywordsService.getKeywordTrends({
      accountId: sharedLink.account.id,
      projectId,
      period: query.period,
      deviceType: query.deviceType,
    });
    return this.keywordTrendsResponseFactory.createResponse(keywordTrends, {
      ...query,
    });
  }

  /**
   * Retrieves the overview of a project based on the provided payload.
   *
   * @param {GetOverviewType} payload - The payload containing the details required to generate the project overview.
   * @param {string} payload.link - The shared link to retrieve associated account information.
   * @param {string} payload.projectId - The ID of the project to generate the overview for.
   * @param {string} payload.fromDate - The start date of the overview period.
   * @param {string} payload.toDate - The end date of the overview period.
   * @param {string} payload.deviceType - The type of device for which the overview is being generated.
   * @return {Promise<Object>} - A promise that resolves to the project overview response.
   */
  async getOverview(payload: GetOverviewType) {
    const link = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    const overview = await this.keywordsService.overview({
      accountId: link.account.id,
      projectId: payload.projectId,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      deviceType: payload.deviceType,
    });
    const project = await this.projectRepository.getProjectByIdWithRelations(
      payload.projectId,
    );
    return this.projectOverviewFactory.createResponse(overview, {
      projectUpdated: project.updatedAt,
    });
  }

  /**
   * Retrieves project information based on the provided payload.
   * It fetches the project by shared link, project competitors,
   * and optionally project tags, keyword tags, and notes.
   *
   * @param {ProjectInfoType} payload - The payload containing the details for fetching the project information.
   * @param {string} payload.link - The shared link to the project.
   * @param {number} payload.projectId - The ID of the project.
   * @param {string} payload.keywordDeviceType - The type of device for keywords.
   * @param {BooleanEnum} payload.tags - Whether to fetch project tags.
   * @param {BooleanEnum} payload.keywordTags - Whether to fetch keyword tags.
   * @param {BooleanEnum} payload.notes - Whether to fetch project notes.
   * @return {Promise<ProjectInfoResponse>} A promise that resolves to the project information response.
   */
  async getProjectInfo(payload: ProjectInfoType): Promise<ProjectInfoResponse> {
    const project = await this.projectsService.getProjectBySharedLink(
      payload.link,
      payload.projectId,
      payload.keywordDeviceType,
    );
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
   * Fetches a single shared link for a given account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {IdType} linkId - The unique identifier of the shared link.
   * @return {Promise<SingleSharedLinkResponse>} A promise that resolves to a response containing the details of the shared link.
   * @throws {NotFoundException} Thrown if the shared link is not found for the given account and link IDs.
   */
  async getOneSharedLink(
    accountId: IdType,
    linkId: IdType,
  ): Promise<SingleSharedLinkResponse> {
    const shardLink =
      await this.sharedLinkRepositories.sharedLinkByLinkAndAccountId(
        linkId,
        accountId,
      );
    if (!shardLink) {
      throw new NotFoundException('Shared Link not found.');
    }

    return new SingleSharedLinkResponse({
      ...shardLink,
      link: `${this.configService.get(ConfigEnvEnum.APP_FRONTEND_URL)}/shared/${
        shardLink.link
      }`,
    });
  }

  /**
   * Authenticates a user based on a provided shared link and password,
   * and generates an access token if authentication is successful.
   *
   * @param {LoginType} payload - An object containing the shared link and password for authentication.
   * @return {Promise<SharedAccessTokenResponse>} A promise that resolves to an object containing the access token and its expiration time.
   * @throws {NotFoundException} If the shared link is not found.
   * @throws {ForbiddenException} If sharing is disabled for the shared link.
   * @throws {BadRequestException} If the password is not required or incorrect.
   */
  async login(payload: LoginType): Promise<SharedAccessTokenResponse> {
    const sharedLink = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    if (!sharedLink) {
      throw new NotFoundException('Shared Link not found.');
    }
    if (!sharedLink.enableSharing) {
      throw new ForbiddenException('Shared link not available');
    }

    if (!sharedLink.requirePassword) {
      throw new BadRequestException('Password is not required');
    }
    const passwordMatched = await this.cryptoUtilsService.verifyPasswordHash(
      payload.password,
      sharedLink.password,
    );
    if (!passwordMatched) {
      throw new BadRequestException('Incorrect password provided');
    }
    const accessToken = await this.userAuthService.generateSharedAccessToken(
      sharedLink,
    );
    return new SharedAccessTokenResponse({
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 60 * 1000),
    });
  }

  /**
   * Generates a shared link for accessing projects and handles password protection if required.
   *
   * @param {SharedLinkWithoutPasswordType} payload - The payload containing the shared link and optional shared details.
   * @param {GetSharedRequest} options - The request options for fetching the projects.
   * @return {Promise<ProjectsBySharedLinkResponse>} A promise that resolves to the response containing the projects and metadata.
   * @throws {ForbiddenException} If access is denied due to incorrect or missing password verification.
   */
  async sharedLink(
    payload: SharedLinkWithoutPasswordType,
    options: GetSharedRequest,
  ): Promise<ProjectsBySharedLinkResponse> {
    const sharedLink = await this.sharedLinkRepositories.sharedLinkByLink(
      payload.link,
    );
    if (sharedLink.requirePassword) {
      if (
        sharedLink.id !== payload?.shared?.id ||
        !payload?.shared?.verification
      ) {
        throw new ForbiddenException('Access denied.');
      }
      const { items, meta } =
        await this.projectsService.getPaginatedProjectsBySharedLink(
          payload.link,
          { ...options },
        );

      await this.sharedLinkRepositories.save({
        ...sharedLink,
        lastViewed: new Date(),
      });
      return this.projectsBySharedLinkResponseFactory.createResponse(items, {
        meta,
        ...options,
      });
    } else {
      const { items, meta } =
        await this.projectsService.getPaginatedProjectsBySharedLink(
          payload.link,
          { ...options },
        );

      await this.sharedLinkRepositories.save({
        ...sharedLink,
        lastViewed: new Date(),
      });
      return this.projectsBySharedLinkResponseFactory.createResponse(items, {
        meta,
        ...options,
      });
    }
  }

  /**
   * Retrieves all shared links for a given account based on the provided options.
   *
   * @param {IdType} accountId - The identifier of the account for which to retrieve shared links.
   * @param {GetAllSharedLinksRequest} options - The options for retrieving shared links, such as pagination and filtering criteria.
   * @return {Promise<SharedLinksResponse>} - A Promise that resolves to the response containing the shared links and associated metadata.
   */
  async getAll(
    accountId: IdType,
    options: GetAllSharedLinksRequest,
  ): Promise<SharedLinksResponse> {
    const { items, meta } =
      await this.sharedLinkRepositories.paginatedSharedLinks(
        accountId,
        options,
      );

    return this.sharedLinksResponseFactory.createResponse(items, meta);
  }

  /**
   * Retrieves a shared link by its ID and associated account ID.
   *
   * @param {IdType} linkId - The unique identifier of the shared link.
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<SharedLinkEntity>} A promise that resolves to the shared link entity.
   * @throws {NotFoundException} If the shared link is not found.
   */
  async getSharedLink(
    linkId: IdType,
    accountId: IdType,
  ): Promise<SharedLinkEntity> {
    const sharedLink =
      await this.sharedLinkRepositories.getSharedLinkByIdAndAccountId(
        linkId,
        accountId,
      );
    if (!sharedLink) {
      throw new NotFoundException('Shared link not found.');
    }
    return sharedLink;
  }

  /**
   * Updates the settings and properties of a shared link.
   *
   * @param {UpdateSharedLinkType} payload - The data transfer object containing the shared link settings to be updated.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   * @throws {BadRequestException} If a password is required but not provided.
   */
  @Transactional()
  async update(payload: UpdateSharedLinkType): Promise<void> {
    let passwordUpdated = false;
    const sharedLink = await this.getSharedLink(
      payload.linkId,
      payload.accountId,
    );
    const { enableSharing, ...settings } = payload;
    if (enableSharing != null) {
      sharedLink.enableSharing = enableSharing;
    }

    if (payload.projectIds?.length > 0) {
      sharedLink.projects = await this.projectsService.getProjects(
        payload.projectIds,
      );
    }

    if (payload.requiredPassword) {
      if (!payload.password) {
        throw new BadRequestException('Password is not specified.');
      }

      sharedLink.requirePassword = payload.requiredPassword;
      sharedLink.password = payload.password
        ? await this.cryptoUtilsService.generatePasswordHash(payload?.password)
        : null;
      passwordUpdated = true;
    } else {
      sharedLink.requirePassword = payload.requiredPassword;
      sharedLink.password = null;
    }

    await this.sharedLinkRepositories.save(sharedLink);
    await this.sharedLinkSettingRepository.save({
      ...sharedLink.settings,
      ...settings,
    });

    if (passwordUpdated) {
      await this.gatewayService.handleUpdateSharedLinkPassword(sharedLink.link);
    }
  }

  /**
   * Creates a new shared link based on the provided payload.
   *
   * @param {CreateSharedLinkType} payload - The data required to create the shared link.
   * @param {string} payload.accountId - The ID of the account creating the shared link.
   * @param {number[]} [payload.projectIds] - An optional array of project IDs to be linked.
   * @param {boolean} payload.enableSharing - Indicates if sharing is enabled.
   * @param {boolean} payload.requiredPassword - Indicates if password protection is required.
   * @param {string} [payload.password] - The password for the shared link, if required.
   * @param {boolean} payload.oneDayChange - One-day change setting for the shared link.
   * @param {boolean} payload.sevenDayChange - Seven-day change setting for the shared link.
   * @param {boolean} payload.thirtyDayChange - Thirty-day change setting for the shared link.
   * @param {boolean} payload.startingRank - Starting rank setting for the shared link.
   * @param {boolean} payload.bestRank - Best rank setting for the shared link.
   * @param {boolean} payload.lifeTimeChange - Lifetime change setting for the shared link.
   * @param {string} payload.volume - Volume setting for the shared link.
   * @param {string} payload.url - URL to be associated with the shared link.
   * @param {boolean} payload.updated - Indicates if the shared link settings were updated.
   * @param {string} payload.position - Position setting for the shared link.
   *
   * @return {Promise<CreateSharedLinkResponse>} The response containing the created shared link.
   *
   * @throws {BadRequestException} If requiredPassword is true and password is not specified.
   */
  @Transactional()
  async create(
    payload: CreateSharedLinkType,
  ): Promise<CreateSharedLinkResponse> {
    let projects: ProjectEntity[] = [];
    let sharedLinkType =
      await this.sharedLinkTypeRepository.getSharedLinkTypeByName(
        SharedLinkTypeEnum.folder,
      );
    if (payload?.projectIds?.length > 0) {
      projects = await this.projectsService.getProjects(payload.projectIds);
      sharedLinkType =
        await this.sharedLinkTypeRepository.getSharedLinkTypeByName(
          SharedLinkTypeEnum.project,
        );
    }

    if (payload.requiredPassword && !payload.password) {
      throw new BadRequestException('Password is not specified.');
    }

    const link = this.cryptoUtilsService.generateUUID();
    const sharedLink = await this.sharedLinkRepositories.save({
      enableSharing: payload.enableSharing,
      projects: projects,
      requirePassword: payload.requiredPassword,
      password: payload.password
        ? await this.cryptoUtilsService.generatePasswordHash(payload?.password)
        : null,
      link,
      type: sharedLinkType,
      account: { id: payload.accountId },
    });
    await this.sharedLinkSettingRepository.save({
      sharedLink,
      oneDayChange: payload.oneDayChange,
      sevenDayChange: payload.sevenDayChange,
      thirtyDayChange: payload.thirtyDayChange,
      startingRank: payload.startingRank,
      bestRank: payload.bestRank,
      lifeTimeChange: payload.lifeTimeChange,
      volume: payload.volume,
      url: payload.url,
      updated: payload.updated,
      position: payload.position,
    });
    await this.accountLimitsService.accountingOfSharedLinks(
      payload.accountId,
      1,
    );
    return new CreateSharedLinkResponse({
      link: `${this.configService.get(
        ConfigEnvEnum.APP_FRONTEND_URL,
      )}/shared/${link}`,
    });
  }

  /**
   * Deletes a bulk of shared links based on the provided payload containing shared link IDs and account ID.
   *
   * @param {BulkDeleteSharedLinksType} payload - The object containing the shared link IDs to delete and the account ID.
   * @return {Promise<void>} - A Promise that resolves when the bulk delete operation is completed.
   * @throws {NotFoundException} If any of the shared links in the payload are not found.
   */
  async bulkDelete(payload: BulkDeleteSharedLinksType): Promise<void> {
    const sharedLinks =
      await this.sharedLinkRepositories.getSharedLinksByIdsAndAccountId(
        payload.sharedLinkIds,
        payload.accountId,
      );

    if (sharedLinks.length !== payload.sharedLinkIds.length) {
      throw new NotFoundException('Shared Link not found.');
    }

    await this.sharedLinkRepositories.remove(sharedLinks);
    await this.accountLimitsService.accountingOfSharedLinks(
      payload.accountId,
      sharedLinks.length * -1,
    );
  }
}
