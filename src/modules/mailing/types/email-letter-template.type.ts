import { AttachmentData } from '@sendgrid/helpers/classes/attachment';

export interface EmailLetterTemplateType {
  templateModel: Record<string, string>;
  templateId: number;
  attachments?: AttachmentData[];
}
