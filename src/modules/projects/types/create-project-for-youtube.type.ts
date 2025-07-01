import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

export class CreateProjectForYoutubeType {
  accountId: IdType;
  folderId: IdType;
  user: UserPayload;
  projectName: string;
  videoUrl: string;
  keywords: string[];
  locationId: IdType;
  deviceType: DeviceTypesEnum;
  languageId: IdType;
  searchEngines: SearchEnginesEnum;
  checkFrequency: CheckFrequencyEnum;
  competitorsVideoUrl?: string[];
  tags?: string[];
  tagIds?: IdType[];
  note?: string;
}
