import { ExpandedElementType } from 'modules/additional-services/types/expanded-element.type';

export interface ItemType {
  type: string;
  tweet: string;
  date: string;
  timestamp: Date;
  url?: string;
  expanded_element?: ExpandedElementType;
}
