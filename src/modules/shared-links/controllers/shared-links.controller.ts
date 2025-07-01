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
import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SharedLinksService } from 'modules/shared-links/services/shared-links.service';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { CreateRequest } from 'modules/shared-links/requests/create.request';
import { IdType } from 'modules/common/types/id-type.type';
import { GetAllSharedLinksRequest } from 'modules/shared-links/requests/get-all-shared-links.request';
import { SharedLinksResponse } from 'modules/shared-links/responses/shared-links.response';
import { UpdateRequest } from 'modules/shared-links/requests/update.request';
import { CreateSharedLinkResponse } from 'modules/shared-links/responses/create-shared-link.response';
import { BulkDeleteSharedLinksRequest } from 'modules/shared-links/requests/bulk-delete-shared-links.request';
import { SingleSharedLinkResponse } from 'modules/shared-links/responses/single-shared-link.response';

@ApiTags('Shared Links')
@Controller('accounts')
export class SharedLinksController {
  constructor(private readonly sharedLinksService: SharedLinksService) {}

  /**
   * Retrieves a specific shared link by its ID and link ID.
   *
   * @param {IdType} id - The unique identifier for the primary resource.
   * @param {IdType} linkId - The unique identifier for the shared link.
   * @return {Promise<SingleSharedLinkResponse>} A promise that resolves to the shared link details.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: SingleSharedLinkResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/shared-links/:linkId')
  getSharedLink(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('linkId') linkId: IdType,
  ): Promise<SingleSharedLinkResponse> {
    return this.sharedLinksService.getOneSharedLink(id, linkId);
  }

  /**
   * Retrieves all shared links for the given user or entity ID.
   *
   * @param {IdType} id - The unique identifier of the user or entity.
   * @param {GetAllSharedLinksRequest} query - Query parameters for filtering and sorting the shared links.
   * @return {Promise<SharedLinksResponse>} A promise that resolves to the shared links information.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Get(':id/shared-links')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  getAllSharedLinks(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Query() query: GetAllSharedLinksRequest,
  ): Promise<SharedLinksResponse> {
    return this.sharedLinksService.getAll(id, { ...query });
  }

  /**
   * Creates a shared link for the specified account.
   *
   * @param {IdType} id - The ID of the account for which the shared link is created.
   * @param {CreateRequest} body - The data required to create the shared link.
   * @return {Promise<CreateSharedLinkResponse>} A promise that resolves to the response of the shared link creation.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post(':id/shared-links')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @ApiCreatedResponse({ type: CreateSharedLinkResponse })
  create(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() body: CreateRequest,
  ): Promise<CreateSharedLinkResponse> {
    return this.sharedLinksService.create({ accountId: id, ...body });
  }

  /**
   * Updates a shared link with the given details.
   *
   * @param {IdType} id - The identifier of the account.
   * @param {IdType} linkId - The identifier of the shared link.
   * @param {UpdateRequest} body - The data to update the shared link.
   * @return {Promise<void>} A promise indicating the completion of the update operation.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Patch(':id/shared-links/:linkId')
  update(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('linkId', new ParseIntPipe()) linkId: IdType,
    @Body() body: UpdateRequest,
  ): Promise<void> {
    return this.sharedLinksService.update({ accountId: id, linkId, ...body });
  }

  /**
   * Deletes multiple shared links associated with the given account ID.
   *
   * @param {IdType} id - The ID of the account.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user making the request.
   * @param {BulkDeleteSharedLinksRequest} body - The request body containing the IDs of the shared links to delete.
   *
   * @return {Promise<void>} A promise that resolves when the shared links are successfully deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Post(':id/shared-links/bulk-delete')
  bulkDelete(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() body: BulkDeleteSharedLinksRequest,
  ): Promise<void> {
    return this.sharedLinksService.bulkDelete({
      accountId: id,
      sharedLinkIds: body.ids,
      user: tokenData.user,
    });
  }
}
