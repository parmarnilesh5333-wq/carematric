import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createNewConversation,
  fetchConsentedHistory,
  fetchConversations,
  fetchSystemAiStatus,
  getOrCreateSessionToken,
  rotateSessionToken,
} from '../services/api';
import {
  AssistantCategory,
  ConversationThread,
  ReportAnalysis,
  SupportedLanguage,
  SystemAiStatus,
} from '../types/report';

interface AppContextValue {
  preferredLanguage: SupportedLanguage;
  setPreferredLanguage: (lang: SupportedLanguage) => void;
  aiStatus: SystemAiStatus | null;
  consentedHistory: ReportAnalysis[];
  activeReport: ReportAnalysis | null;
  setActiveReport: React.Dispatch<React.SetStateAction<ReportAnalysis | null>>;
  refreshHistory: () => Promise<void>;
  conversations: ConversationThread[];
  activeConversation: ConversationThread | null;
  setActiveConversation: React.Dispatch<React.SetStateAction<ConversationThread | null>>;
  refreshConversations: () => Promise<void>;
  startNewChat: (category?: AssistantCategory, title?: string) => Promise<ConversationThread>;
  sessionId: string;
  resetIsolatedSession: () => Promise<void>;
  isLoadingHistory: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const LANG_STORAGE_KEY = 'carematric_preferred_lang_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferredLanguage, setPreferredLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (
      saved === 'en' ||
      saved === 'hi' ||
      saved === 'hinglish' ||
      saved === 'gu' ||
      saved === 'ur'
    ) {
      return saved;
    }
    return 'en';
  });

  const [aiStatus, setAiStatus] = useState<SystemAiStatus | null>(null);
  const [consentedHistory, setConsentedHistory] = useState<ReportAnalysis[]>([]);
  const [activeReport, setActiveReport] = useState<ReportAnalysis | null>(null);
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationThread | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => getOrCreateSessionToken());
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const setPreferredLanguage = useCallback((lang: SupportedLanguage) => {
    setPreferredLanguageState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, []);

  const refreshHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const list = await fetchConsentedHistory();
      setConsentedHistory(list);
    } catch {
      // Keep empty on network error
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch {
      // ignore
    }
  }, []);

  const startNewChat = useCallback(
    async (category: AssistantCategory = 'general', title = 'New AI Chat') => {
      const created = await createNewConversation({
        title,
        category,
        language: preferredLanguage,
      });
      setActiveConversation(created);
      setConversations((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      return created;
    },
    [preferredLanguage]
  );

  const resetIsolatedSession = useCallback(async () => {
    const newToken = rotateSessionToken();
    setSessionId(newToken);
    setActiveReport(null);
    setConsentedHistory([]);
    setConversations([]);
    setActiveConversation(null);
  }, []);

  useEffect(() => {
    fetchSystemAiStatus()
      .then(setAiStatus)
      .catch(() => null);
    refreshHistory();
    refreshConversations();
  }, [refreshHistory, refreshConversations]);

  return (
    <AppContext.Provider
      value={{
        preferredLanguage,
        setPreferredLanguage,
        aiStatus,
        consentedHistory,
        activeReport,
        setActiveReport,
        refreshHistory,
        conversations,
        activeConversation,
        setActiveConversation,
        refreshConversations,
        startNewChat,
        sessionId,
        resetIsolatedSession,
        isLoadingHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return ctx;
}
