import { IdType } from 'modules/common/types/id-type.type';

export interface KeywordType {
  id: IdType;
  currentPosition: number;
}

export interface Statistical {
  keywords: KeywordType[];
  countKeywords: number;
  sumPositions: number;
  avgPos: number;
}
