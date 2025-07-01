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
import { FoldersService } from 'modules/folders/services/folders.service';
import { CreateFolderRequest } from 'modules/folders/requests/create-folder.request';
import { IdType } from 'modules/common/types/id-type.type';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { ListAvailableFoldersResponse } from 'modules/folders/responses/list-available-folders.response';
import { RetrieveContentsInFolderRequest } from 'modules/folders/requests/retrieve-contents-in-folder.request';
import { FolderContentsResponse } from 'modules/folders/responses/folder-contents.response';
import { GetMyFoldersRequest } from 'modules/folders/requests/get-my-folders.request';
import { MyFoldersResponse } from 'modules/folders/responses/my-folders.response';
import { UpdateFolderRequest } from 'modules/folders/requests/update-folder.request';
import { FoldersMoveRequest } from 'modules/folders/requests/folders-move.request';
import { DeletionOfFolderContentsRequest } from 'modules/folders/requests/deletion-of-folder-contents.request';
import { ListAvailableFoldersRequest } from 'modules/folders/requests/list-available-folders.request';

@ApiTags('Folders')
@Controller('accounts')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  /**
   * Lists available folders for the specified user.
   *
   * @param {SerpnestUserTokenData} tokenData - The user's authentication token data.
   * @param {IdType} id - The user's unique identifier.
   * @param {ListAvailableFoldersRequest} query - The query parameters for the request.
   * @return {Promise<ListAvailableFoldersResponse>} A promise that resolves to the response containing the list of available folders.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ListAvailableFoldersResponse })
  @Get(':id/folders/list-available-folders')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  async listAvailableFolders(
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Query() query: ListAvailableFoldersRequest,
  ): Promise<ListAvailableFoldersResponse> {
    return this.foldersService.getListAvailableFolders(
      tokenData.user,
      id,
      query.search,
    );
  }

  /**
   * Updates the name of a folder specified by its ID and the account ID.
   *
   * @param {UpdateFolderRequest} payload - The request payload containing the new folder name.
   * @param {SerpnestUserTokenData} tokenData - The user authentication token data.
   * @param {IdType} id - The ID of the account the folder belongs to.
   * @param {IdType} folderId - The ID of the folder to update.
   * @return {Promise<void>} A promise that resolves when the folder has been renamed.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Patch(':id/folders/:folderId')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  updateFolder(
    @Body() payload: UpdateFolderRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
  ): Promise<void> {
    return this.foldersService.renameFolder({
      accountId: id,
      folderId,
      user: tokenData.user,
      newName: payload.newName,
    });
  }

  /**
   * Retrieves the folders belonging to the authenticated user.
   *
   * @param {SerpnestUserTokenData} tokenData - The user token data containing information about the authenticated user.
   * @param {IdType} id - The ID of the account to retrieve folders for.
   * @param {GetMyFoldersRequest} query - The query parameters for filtering the folders.
   * @return {Promise<MyFoldersResponse>} A promise that resolves to the response containing the user's folders.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: MyFoldersResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  @Get(':id/folders/my-folders')
  async getMyFolders(
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Query() query: GetMyFoldersRequest,
  ): Promise<MyFoldersResponse> {
    return this.foldersService.getMyFolders(
      { accountId: id, user: tokenData.user },
      { ...query },
    );
  }

  /**
   * Retrieves the contents of a specific folder based on the provided account ID and folder ID.
   *
   * @param {SerpnestUserTokenData} tokenData - User token data containing user information.
   * @param {IdType} id - The account ID to which the folder belongs.
   * @param {IdType} folderId - The ID of the folder to retrieve contents from.
   * @param {RetrieveContentsInFolderRequest} query - Additional query parameters for refining the retrieval of folder contents.
   * @return {Promise<FolderContentsResponse>} The contents of the specified folder.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: FolderContentsResponse })
  @Get(':id/folders/:folderId')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  async getFolder(
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Query() query: RetrieveContentsInFolderRequest,
  ): Promise<FolderContentsResponse> {
    return this.foldersService.retrieveContentsOfFolder(
      {
        accountId: id,
        folderId,
        user: tokenData.user,
      },
      { ...query },
    );
  }

  /**
   * Creates a child folder within a specified folder.
   *
   * @param {CreateFolderRequest} payload - The data required to create a new folder.
   * @param {IdType} folderId - The ID of the folder where the child folder will be created.
   * @param {IdType} id - The ID associated with the user or entity creating the folder.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<void>} A promise that resolves when the child folder is successfully created.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse()
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId')
  async createChildFolder(
    @Body() payload: CreateFolderRequest,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.foldersService.createChildFolder(
      payload.name,
      folderId,
      tokenData.user,
      id,
    );
  }

  /**
   * Moves folders from one location to another.
   *
   * @param {FoldersMoveRequest} payload - The payload containing the move details.
   * @param {IdType} folderId - The ID of the folder to be moved.
   * @param {IdType} id - The ID of the account to which the folder belongs.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user making the request.
   * @return {Promise<void>} A promise that resolves when the folders are successfully moved.
   */
  @ApiCreatedResponse()
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/move-folders')
  foldersMove(
    @Body() payload: FoldersMoveRequest,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.foldersService.moveFolders({
      accountId: id,
      folderId,
      user: tokenData.user,
      ...payload,
    });
  }

  /**
   * Deletes the contents of a specified folder.
   *
   * @param {IdType} folderId - The ID of the folder whose contents are to be deleted.
   * @param {IdType} id - The ID of the account associated with the folder.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user making the request.
   * @param {DeletionOfFolderContentsRequest} payload - The payload containing additional information for the deletion request.
   * @return {Promise<void>} A promise that resolves when the folder contents have been successfully deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/deletion-of-folder-contents')
  deletionOfFolderContents(
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() payload: DeletionOfFolderContentsRequest,
  ): Promise<void> {
    return this.foldersService.deletionOfFolderContents({
      accountId: id,
      folderId,
      user: tokenData.user,
      ...payload,
    });
  }
}
