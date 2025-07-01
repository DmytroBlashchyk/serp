import { IdType } from 'modules/common/types/id-type.type';

export interface UpdateSharedLinkType {
  accountId: IdType;
  linkId: IdType;
  enableSharing?: boolean;
  requiredPassword?: boolean;
  password?: string;
  position?: boolean;
  oneDayChange?: boolean;
  sevenDayChange?: boolean;
  thirtyDayChange?: boolean;
  startingRank?: boolean;
  bestRank?: boolean;
  lifeTimeChange?: boolean;
  volume?: boolean;
  url?: boolean;
  updated?: boolean;
  projectIds?: IdType[];
}
