export interface CustomerInfoType {
  id: string;
  status: string;
  custom_data: any;
  name: string;
  email: string;
  marketing_consent: boolean;
  locale: string;
  created_at: Date;
  updated_at: Date;
}
