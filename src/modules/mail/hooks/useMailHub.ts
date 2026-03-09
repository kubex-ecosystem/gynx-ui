import { useCallback, useEffect, useMemo, useState } from 'react';
import { mailService } from '../services/mailService';
import type { MailMessage } from '../types';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const resolveErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message
    ? error.message
    : 'Nao foi possivel carregar a caixa de entrada.';

const findDefaultSelection = (emails: MailMessage[]): number | null =>
  emails.find((email) => !email.isRead)?.id ?? emails[0]?.id ?? null;

export const useMailHub = () => {
  const [allEmails, setAllEmails] = useState<MailMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const emails = await mailService.listEmails();
      setAllEmails(emails);
      setSelectedEmailId((current) =>
        emails.some((email) => email.id === current)
          ? current
          : findDefaultSelection(emails),
      );
    } catch (loadError) {
      setAllEmails([]);
      setSelectedEmailId(null);
      setError(resolveErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEmails();
  }, [loadEmails]);

  const filteredEmails = useMemo(() => {
    const normalizedSearch = normalize(searchTerm.trim());
    if (!normalizedSearch) {
      return allEmails;
    }

    return allEmails.filter((email) =>
      [
        email.sender,
        email.subject,
        email.excerpt,
        email.aiSummary,
        email.aiLabel,
      ].some((field) => normalize(field).includes(normalizedSearch)),
    );
  }, [allEmails, searchTerm]);

  useEffect(() => {
    if (filteredEmails.length === 0) {
      setSelectedEmailId(null);
      return;
    }

    if (!filteredEmails.some((email) => email.id === selectedEmailId)) {
      setSelectedEmailId(filteredEmails[0].id);
    }
  }, [filteredEmails, selectedEmailId]);

  const selectedEmail = useMemo(
    () => filteredEmails.find((email) => email.id === selectedEmailId) ?? null,
    [filteredEmails, selectedEmailId],
  );

  const selectEmail = useCallback((emailId: number) => {
    setSelectedEmailId(emailId);
    setAllEmails((current) =>
      current.map((email) =>
        email.id === emailId
          ? {
              ...email,
              isRead: true,
            }
          : email,
      ),
    );
  }, []);

  const toggleStar = useCallback((emailId: number) => {
    setAllEmails((current) =>
      current.map((email) =>
        email.id === emailId
          ? {
              ...email,
              isStarred: !email.isStarred,
            }
          : email,
      ),
    );
  }, []);

  return {
    emails: filteredEmails,
    totalEmails: allEmails.length,
    searchTerm,
    selectedEmail,
    isLoading,
    error,
    setSearchTerm,
    selectEmail,
    toggleStar,
    retry: loadEmails,
  };
};
