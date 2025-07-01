import { EventEmitter } from 'events';

export const useMaxEventListeners = (maxListenersCount: number) => {
  EventEmitter.defaultMaxListeners = maxListenersCount;
};
