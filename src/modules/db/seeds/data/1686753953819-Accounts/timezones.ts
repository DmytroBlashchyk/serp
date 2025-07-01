import timezones from 'timezones-list';
export const zones = timezones.map(
  (timezone: { name: string }, index: number) => {
    return {
      id: index,
      name: timezone.name,
    };
  },
);
