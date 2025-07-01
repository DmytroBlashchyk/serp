import { BaseResponse } from 'modules/common/responses/base.response';
import { ProjectSearchResponse } from 'modules/accounts/responses/project-search.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { RecentlyViewedSearchResponse } from 'modules/accounts/responses/recently-viewed-search.response';
import { KeywordSearchResponse } from 'modules/accounts/responses/keyword-search.response';
import { FolderSearchResponse } from 'modules/accounts/responses/folder-search.response';
import { ProjectTagSearchResponse } from 'modules/accounts/responses/project-tag-search.response';
import { KeywordTagSearchResponse } from 'modules/accounts/responses/keyword-tag-search.response';

export class AccountSearchResponse extends BaseResponse<AccountSearchResponse> {
  @ResponseProperty({ cls: RecentlyViewedSearchResponse, each: true })
  recentlyViewed: RecentlyViewedSearchResponse[];

  @ResponseProperty({ cls: ProjectSearchResponse, each: true })
  projects: ProjectSearchResponse[];

  @ResponseProperty({ cls: KeywordSearchResponse, each: true })
  keywords: KeywordSearchResponse[];

  @ResponseProperty({ cls: FolderSearchResponse, each: true })
  folders: FolderSearchResponse[];

  @ResponseProperty({ cls: ProjectTagSearchResponse, each: true })
  projectTags: ProjectTagSearchResponse[];

  @ResponseProperty({ cls: KeywordTagSearchResponse, each: true })
  projectKeywordTags: KeywordTagSearchResponse[];
}
