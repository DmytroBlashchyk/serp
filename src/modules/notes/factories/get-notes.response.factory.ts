import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { NoteEntity } from 'modules/notes/entities/note.entity';
import { GetNotesResponse } from 'modules/notes/responses/get-notes.response';
import { Injectable } from '@nestjs/common';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { IdType } from 'modules/common/types/id-type.type';
import { RoleEnum } from 'modules/auth/enums/role.enum';

@Injectable()
export class GetNotesResponseFactory extends BaseResponseFactory<
  NoteEntity[],
  GetNotesResponse
> {
  /**
   * Creates a response object containing note items and meta information.
   *
   * @param {NoteEntity[]} entity - Array of note entities to be included in the response.
   * @param {Object} [options] - Optional parameters for response creation.
   * @param {UserPayload} [options.user] - The payload of the user requesting the notes.
   * @param {IdType} [options.accountId] - The ID of the account associated with the user.
   * @param {Object} [options.meta] - Meta information to include in the response.
   * @return {Promise<GetNotesResponse> | GetNotesResponse} The response object containing formatted note items.
   */
  createResponse(
    entity: NoteEntity[],
    options?: Record<string, unknown>,
  ): Promise<GetNotesResponse> | GetNotesResponse {
    const user = options.user as UserPayload;
    const accountId = options.accountId as IdType;
    return new GetNotesResponse({
      items: entity.map((item) => {
        return new NoteResponse({
          ...item,
          date: dateHelper(item.createdAt),
          dateFullFormat: formatGoogleStyleDate(item.createdAt),
          author: item?.author?.email,
          projectId: item.project.id,
          editOption:
            item.author.id === user.id ||
            user.accounts.find((account) => account.id == accountId)?.role
              ?.name === RoleEnum.Admin,
        });
      }),
      meta: options.meta,
    });
  }
}
