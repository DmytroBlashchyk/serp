export interface UpdateKeywordsUsingLiveModeForYoutubeResultType {
  type: string;
  rank_group: number;
  rank_absolute: number;
  block_rank: number;
  block_name: any;
  title: string;
  name?: string;
  url: string;
  video_id: string;
  thumbnail_url: string;
  channel_id: string;
  channel_name: string;
  channel_url: string;
  channel_logo: string;
  description: string;
  highlighted: string[];
  badges: string[];
  is_live: boolean;
  is_shorts: boolean;
  is_movie: boolean;
  views_count: number;
  publication_date: string;
  timestamp: string;
  duration_time: string;
  duration_time_seconds: number;
}
