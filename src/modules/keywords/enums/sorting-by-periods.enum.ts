export enum SortingByPeriodsEnum {
  'CASE WHEN day1_is_improved THEN 0 WHEN day1_is_declined THEN 1 ELSE 2 END, day1_difference ASC' = 'd1_asc',
  'CASE WHEN day1_is_improved THEN 1 WHEN day1_is_declined THEN 0 ELSE 2 END, day1_difference DESC' = 'd1_desc',
  'CASE WHEN day7_is_improved THEN 0 WHEN day7_is_declined THEN 1 ELSE 2 END, day7_difference ASC' = 'd7_asc',
  'CASE WHEN day7_is_improved THEN 1 WHEN day7_is_declined THEN 0 ELSE 2 END, day7_difference DESC' = 'd7_desc',
  'CASE WHEN day30_is_improved THEN 0 WHEN day30_is_declined THEN 1 ELSE 2 END, day30_difference ASC' = 'd30_asc',
  'CASE WHEN day30_is_improved THEN 1 WHEN day30_is_declined THEN 0 ELSE 2 END, day30_difference DESC' = 'd30_desc',
  'CASE WHEN life_is_improved THEN 0 WHEN life_is_declined THEN 1 ELSE 2 END, life_difference ASC' = 'life_asc',
  'CASE WHEN life_is_improved THEN 1 WHEN life_is_declined THEN 0 ELSE 2 END, life_difference DESC' = 'life_desc',
}
