import { StorageItemRepository } from 'modules/storage/repositories/storage-item.repository';
import { mockStorageItemRepository } from '../mocks/repositories/mock-storage-item.repository';

export const testProviders = [
  { provide: StorageItemRepository, useValue: mockStorageItemRepository },
];
