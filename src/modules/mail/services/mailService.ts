import { mockEmails, waitMock } from '@/mocks';
import type { MailMessage } from '../types';

export const mailService = {
  async listEmails(): Promise<MailMessage[]> {
    await waitMock(550);
    return mockEmails.map((email) => ({ ...email }));
  },
};
