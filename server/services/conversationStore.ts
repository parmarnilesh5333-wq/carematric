import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  AssistantCategory,
  ConversationThread,
  SupportedLanguage,
} from '../../src/types/report';

const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
);

const DATA_DIR = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'carematric-data')
  : path.resolve(process.cwd(), '.carematric-data');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');

const memoryThreadsFallback = new Map<string, ConversationThread>();

function ensureDataDir(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function readAllThreads(): ConversationThread[] {
  try {
    if (!ensureDataDir()) {
      return Array.from(memoryThreadsFallback.values());
    }
    if (!fs.existsSync(CONVERSATIONS_FILE)) {
      return Array.from(memoryThreadsFallback.values());
    }
    const raw = fs.readFileSync(CONVERSATIONS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return Array.from(memoryThreadsFallback.values());
  }
}

function writeAllThreads(threads: ConversationThread[]) {
  memoryThreadsFallback.clear();
  for (const t of threads) {
    memoryThreadsFallback.set(t.id, t);
  }
  try {
    if (ensureDataDir()) {
      fs.writeFileSync(
        CONVERSATIONS_FILE,
        JSON.stringify(threads, null, 2),
        'utf-8'
      );
    }
  } catch {
    // Kept safely in memoryThreadsFallback in read-only environments
  }
}

export function listConversationsForSession(
  sessionId: string
): ConversationThread[] {
  return readAllThreads()
    .filter((t) => t.sessionId === sessionId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

export function getConversationForSession(
  threadId: string,
  sessionId: string
): ConversationThread | null {
  const found = readAllThreads().find(
    (t) => t.id === threadId && t.sessionId === sessionId
  );
  return found || null;
}

export function createConversationForSession(
  sessionId: string,
  params: {
    title?: string;
    category?: AssistantCategory;
    language?: SupportedLanguage;
  }
): ConversationThread {
  const now = new Date().toISOString();
  const thread: ConversationThread = {
    id: `conv_${crypto.randomUUID().slice(0, 12)}`,
    sessionId,
    title: params.title?.trim() || 'New AI Conversation',
    category: params.category || 'general',
    language: params.language || 'en',
    createdAt: now,
    updatedAt: now,
    messages: [],
    documentContext: null,
  };

  const all = readAllThreads();
  all.unshift(thread);
  writeAllThreads(all);
  return thread;
}

export function saveConversationForSession(
  thread: ConversationThread,
  sessionId: string
): ConversationThread {
  if (thread.sessionId !== sessionId) {
    throw new Error('Unauthorized session access to conversation.');
  }
  const all = readAllThreads();
  const idx = all.findIndex(
    (t) => t.id === thread.id && t.sessionId === sessionId
  );
  if (idx >= 0) {
    all[idx] = thread;
  } else {
    all.unshift(thread);
  }
  writeAllThreads(all);
  return thread;
}

export function clearConversationMessages(
  threadId: string,
  sessionId: string
): ConversationThread | null {
  const thread = getConversationForSession(threadId, sessionId);
  if (!thread) return null;
  thread.messages = [];
  thread.documentContext = null;
  thread.updatedAt = new Date().toISOString();
  return saveConversationForSession(thread, sessionId);
}

export function deleteConversationForSession(
  threadId: string,
  sessionId: string
): boolean {
  const all = readAllThreads();
  const filtered = all.filter(
    (t) => !(t.id === threadId && t.sessionId === sessionId)
  );
  if (filtered.length !== all.length) {
    writeAllThreads(filtered);
    return true;
  }
  return false;
}
