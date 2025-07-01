import { IdType } from 'modules/common/types/id-type.type';

export interface KeywordType {
  id: IdType;
  currentPosition: number;
}

export interface CalculateType {
  keywords: KeywordType[];
  top3: number;
  top10: number;
  top30: number;
  top100: number;
  countKeywords: number;
  sumPositions: number;
  avgPos: number;
}
