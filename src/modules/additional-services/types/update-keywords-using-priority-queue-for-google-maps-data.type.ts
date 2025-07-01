export interface UpdateKeywordsUsingPriorityQueueForGoogleMapsDataType {
  keyword: string;
  language_code: string;
  location_code: number;
  device: string;
  depth: number;
  priority: number;
  postback_url: string;
  postback_data: 'advanced' | 'html';
  tag: string;
  se_domain: string;
}
