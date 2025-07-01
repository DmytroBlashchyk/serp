import { BadRequestException } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';

/**
 * Parses a tag string and extracts the project ID and keyword ID.
 *
 * @param {string} tag - The tag string to be parsed in the format "project_id_<projectId>_keyword_id_<keywordId>".
 * @return {Object} An object containing the extracted projectId and keywordId.
 * @throws {BadRequestException} If the tag string does not match the expected format.
 */
export function parseTagString(tag: string): {
  projectId: IdType;
  keywordId: IdType;
} {
  const regex = /project_id_(\d+)_keyword_id_(\d+)/;
  const match = tag.match(regex);

  if (match) {
    const projectId = parseInt(match[1], 10);
    const keywordId = parseInt(match[2], 10);
    return { projectId, keywordId };
  } else {
    throw new BadRequestException('Error during tag processing.');
  }
}
