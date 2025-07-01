export enum SortKeywordRankingsEnum {
  'name' = 'name',
  position = 'position',
  'CASE WHEN day1_is_improved THEN 0 WHEN day1_is_declined THEN 1 ELSE 2 END, day1_difference' = 'd1',
  'CASE WHEN day7_is_improved THEN 0 WHEN day7_is_declined THEN 1 ELSE 2 END, day7_difference' = 'd7',
  'CASE WHEN day30_is_improved THEN 0 WHEN day30_is_declined THEN 1 ELSE 2 END, day30_difference' = 'd30',
  'CASE WHEN life_is_improved THEN 0 WHEN life_is_declined THEN 1 ELSE 2 END, life_difference' = 'life',
  first_position = 'first',
  url = 'url',
  'updated_at' = 'updated',
  best_position = 'best',
  'cpc' = 'cpc',
  'search_volume' = 'searchValue',
}
