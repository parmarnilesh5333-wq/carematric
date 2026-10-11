import {
  AssistantCategory,
  ChatMessage,
  ConversationThread,
  ExtractedDocumentResult,
  MedicalLanguage,
  ReportAnalysis,
  SupportedLanguage,
  SystemAiStatus,
} from '../types/report';

const SESSION_STORAGE_KEY = 'carematric_isolated_session_v1';

export function getOrCreateSessionToken(): string {
  let token = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!token || token.length < 16) {
    const randomPart =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, '')
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    token = `cm_sess_${randomPart}`;
    localStorage.setItem(SESSION_STORAGE_KEY, token);
  }
  return token;
}

export function rotateSessionToken(): string {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  return getOrCreateSessionToken();
}

function getHeaders(isJson = true): HeadersInit {
  const headers: Record<string, string> = {
    'X-CareMatric-Session': getOrCreateSessionToken(),
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export interface SamplePresetMeta {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  fileName: string;
}

export async function fetchSystemAiStatus(): Promise<SystemAiStatus> {
  const res = await fetch('/api/system/ai-status', {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch system status.');
  }
  return res.json();
}

export async function fetchSamplePresets(): Promise<SamplePresetMeta[]> {
  const res = await fetch('/api/samples', {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to load sample report presets.');
  }
  return res.json();
}

export async function analyzeSamplePreset(
  presetId: string,
  language: SupportedLanguage | MedicalLanguage,
  consentGranted: boolean
): Promise<ReportAnalysis> {
  const medLang =
    language === 'hi' || language === 'gu' || language === 'ur' ? language : 'en';
  const res = await fetch(`/api/reports/sample/${encodeURIComponent(presetId)}`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ language: medLang, consentGranted }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to analyze sample report.');
  }
  return data;
}

export async function uploadAndAnalyzeReport(
  file: File,
  language: SupportedLanguage | MedicalLanguage,
  consentGranted: boolean
): Promise<ReportAnalysis> {
  const medLang =
    language === 'hi' || language === 'gu' || language === 'ur' ? language : 'en';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', medLang);
  formData.append('consentGranted', String(consentGranted));

  const res = await fetch('/api/reports/analyze', {
    method: 'POST',
    headers: getHeaders(false),
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to analyze uploaded report.');
  }
  return data;
}

export async function fetchConsentedHistory(): Promise<ReportAnalysis[]> {
  const res = await fetch('/api/reports/history', {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to load report history.');
  }
  return res.json();
}

export async function fetchReportById(id: string): Promise<ReportAnalysis> {
  const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Report not found.');
  }
  return data;
}

export async function translateReportLanguage(
  id: string,
  language: SupportedLanguage | MedicalLanguage
): Promise<ReportAnalysis> {
  const medLang =
    language === 'hi' || language === 'gu' || language === 'ur' ? language : 'en';
  const res = await fetch(`/api/reports/${encodeURIComponent(id)}/translate`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ language: medLang }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to switch report language.');
  }
  return data;
}

export async function saveReportWithConsent(id: string): Promise<ReportAnalysis> {
  const res = await fetch(`/api/reports/${encodeURIComponent(id)}/consent`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ consent: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to save report to history.');
  }
  return data;
}

export async function deleteSingleReport(id: string): Promise<void> {
  const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to delete report.');
  }
}

export async function purgeAllSessionReports(): Promise<{ purgedCount: number }> {
  const res = await fetch('/api/reports', {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to purge report history.');
  }
  return res.json();
}

export async function askReportQuestion(
  reportId: string,
  question: string,
  language: SupportedLanguage
): Promise<ChatMessage> {
  const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/chat`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ question, language }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Unable to process question.');
  }
  return data;
}

// ============================================================================
// CONVERSATIONS & SMART TOOLS API CLIENT
// ============================================================================

export async function fetchConversations(): Promise<ConversationThread[]> {
  const res = await fetch('/api/conversations', {
    headers: getHeaders(),
  });
  if (!res.ok) {
    throw new Error('Failed to load conversations.');
  }
  return res.json();
}

export async function createNewConversation(params?: {
  title?: string;
  category?: AssistantCategory;
  language?: SupportedLanguage;
}): Promise<ConversationThread> {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(params || {}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to create conversation.');
  }
  return data;
}

export async function sendConversationMessage(params: {
  conversationId: string;
  message: string;
  language: SupportedLanguage;
  category: AssistantCategory;
  file?: File | null;
}): Promise<ConversationThread> {
  const { conversationId, message, language, category, file } = params;

  if (file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', message);
    formData.append('language', language);
    formData.append('category', category);

    const res = await fetch(
      `/api/conversations/${encodeURIComponent(conversationId)}/message`,
      {
        method: 'POST',
        headers: getHeaders(false),
        body: formData,
      }
    );
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || 'Failed to send message with attachment.');
    }
    return data;
  }

  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/message`,
    {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ message, language, category }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to send message.');
  }
  return data;
}

export async function regenerateConversationMessage(
  conversationId: string,
  language: SupportedLanguage
): Promise<ConversationThread> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/regenerate`,
    {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ language }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to regenerate response.');
  }
  return data;
}

export async function clearConversationThread(
  conversationId: string
): Promise<ConversationThread> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/clear`,
    {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ clear: true }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to clear conversation.');
  }
  return data;
}

export async function deleteConversationThread(
  conversationId: string
): Promise<void> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}`,
    {
      method: 'DELETE',
      headers: getHeaders(),
    }
  );
  if (!res.ok) {
    throw new Error('Failed to delete conversation.');
  }
}

export async function extractDocumentForAnalysis(
  file: File,
  language: SupportedLanguage
): Promise<ExtractedDocumentResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const res = await fetch('/api/tools/document-extract', {
    method: 'POST',
    headers: getHeaders(false),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Failed to extract document.');
  }
  return data;
}

export async function runSmartToolPrompt(params: {
  prompt: string;
  language: SupportedLanguage;
  category: AssistantCategory;
  documentText?: string;
  documentName?: string;
}): Promise<{
  content: string;
  sourceMode: 'live_ai' | 'clinical_guardrail' | 'ai_unconfigured_notice';
  safetyFlagged: boolean;
}> {
  const res = await fetch('/api/tools/run', {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Smart Tool execution failed.');
  }
  return data;
}
