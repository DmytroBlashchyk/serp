import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { CompetitorBusinessRequest } from 'modules/projects/requests/competitor-business.request';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

export interface CreateProjectForGoogleMapsType {
  accountId: IdType;
  folderId: IdType;
  user: UserPayload;
  projectName: string;
  businessName: string;
  businessUrl?: string;
  keywords: string[];
  locationId: IdType;
  deviceType: DeviceTypesEnum;
  languageId: IdType;
  checkFrequency: CheckFrequencyEnum;
  competitors?: CompetitorBusinessRequest[];
  tags?: string[];
  tagIds?: IdType[];
  note?: string;
  regionId: IdType;
  searchEngine: SearchEnginesEnum;
}
