export type ManagedResponseType<T> = {
  new (object: unknown): T;
};
