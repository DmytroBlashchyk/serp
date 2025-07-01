import { IdType } from 'modules/common/types/id-type.type';

export interface CreateSharedLinkType {
  accountId: IdType;
  projectIds?: IdType[];
  folderIds?: IdType[];
  enableSharing: boolean;
  requiredPassword: boolean;
  password?: string;
  position: boolean;
  oneDayChange: boolean;
  sevenDayChange: boolean;
  thirtyDayChange: boolean;
  startingRank: boolean;
  bestRank: boolean;
  lifeTimeChange: boolean;
  volume: boolean;
  url: boolean;
  updated: boolean;
}
