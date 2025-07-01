import { IdType } from 'modules/common/types/id-type.type';
import { BucketStoragePathsEnum } from 'modules/storage/enums/bucket-storage-paths.enum';

export interface BrandingInfoType {
  accounts_id: IdType;
  email_reports: boolean;
  company_name: string;
  company_url: string;
  facebook_link?: string;
  linkedin_link?: string;
  twitter_link?: string;
  shared_links: boolean;
  tagline?: string;
  validated_by_serpnest: boolean;
  storage_items_id: IdType;
  storage_items_original_file_name: string;
  storage_items_stored_file_name: string;
  storage_items_storage_path: BucketStoragePathsEnum;
}
