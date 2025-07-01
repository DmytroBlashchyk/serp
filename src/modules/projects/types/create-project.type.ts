import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { ProjectUrlTypesEnum } from 'modules/projects/enums/project-url-types.enum';

export interface CreateProjectType {
  accountId: IdType;
  folderId: IdType;
  user: UserPayload;
  projectName: string;
  url: string;
  projectUrlType: ProjectUrlTypesEnum;
  keywords: string[];
  searchEngine: SearchEnginesEnum;
  regionId: IdType;
  locationId: IdType;
  deviceType: DeviceTypesEnum;
  languageId: IdType;
  checkFrequency: CheckFrequencyEnum;
  competitors?: string[];
  tags?: string[];
  tagIds?: IdType[];
  note?: string;
}
