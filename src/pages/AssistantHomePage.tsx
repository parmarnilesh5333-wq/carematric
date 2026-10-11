import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  Code2,
  Copy,
  FileCheck2,
  FileSearch,
  Languages,
  Loader2,
  MessageSquare,
  MessageSquarePlus,
  Mic,
  MicOff,
  Paperclip,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAppContext } from '../context/AppContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import {
  clearConversationThread,
  createNewConversation,
  regenerateConversationMessage,
  sendConversationMessage,
  uploadAndAnalyzeReport,
} from '../services/api';
import {
  AssistantCategory,
  SUPPORTED_LANGUAGES,
} from '../types/report';

const QUICK_ACTION_CARDS: {
  id: AssistantCategory;
  title: string;
  subtitle: string;
  badge: string;
  route: string;
  accent: string;
  icon: React.ElementType;
  samplePrompt: string;
}[] = [
  {
    id: 'medical_report',
    title: 'Medical Reports',
    subtitle:
      'Upload PDF or scanned lab reports for deterministic range checks & explanations in Hindi, Gujarati, Urdu & English.',
    badge: 'Dedicated Clinical Tool',
    route: '/medical',
    accent: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30 hover:border-cyan-400',
    icon: Stethoscope,
    samplePrompt:
      'Explain what HbA1c, Fasting Blood Glucose, and TSH measure on a laboratory report.',
  },
  {
    id: 'study',
    title: 'Study AI',
    subtitle:
      'Generate structured study notes, step-by-step concept breakdowns, and interactive multiple-choice quizzes.',
    badge: 'Notes & Quizzes',
    route: '/tools/study',
    accent: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 hover:border-violet-400',
    icon: BookOpen,
    samplePrompt:
      'Create concise study notes and 3 practice quiz questions on Human Cellular Respiration.',
  },
  {
    id: 'coding',
    title: 'Coding AI',
    subtitle:
      'Debug errors, understand complex algorithms, review code quality, and generate clean implementations.',
    badge: 'Debug & Explain',
    route: '/tools/coding',
    accent: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 hover:border-indigo-400',
    icon: Code2,
    samplePrompt:
      'Explain how async/await error handling works in TypeScript and show a clean retry pattern.',
  },
  {
    id: 'document',
    title: 'Document Analysis',
    subtitle:
      'Extract text from PDFs & images via OCR, summarize key findings, and ask grounded questions.',
    badge: 'PDF & Image Q&A',
    route: '/tools/documents',
    accent: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30 hover:border-purple-400',
    icon: FileSearch,
    samplePrompt:
      'How do I analyze and summarize a multi-page PDF or scanned document?',
  },
  {
    id: 'translation',
    title: 'Translation',
    subtitle:
      'Translate documents, medical terms, and conversations across Hindi, Hinglish, Gujarati, Urdu & English.',
    badge: '5 Languages',
    route: '/tools/translate',
    accent: 'from-emerald-500/20 to-cyan-500/10 border-emerald-500/30 hover:border-emerald-400',
    icon: Languages,
    samplePrompt:
      'Translate "Please bring your previous blood test reports and fasting glucose log to your appointment" into Hindi, Hinglish, and Gujarati.',
  },
  {
    id: 'general',
    title: 'General AI Chat',
    subtitle:
      'Brainstorm ideas, draft emails, solve daily problems, and chat naturally in Hindi, Hinglish, Gujarati, or English.',
    badge: 'Multilingual Chat',
    route: '/',
    accent: 'from-pink-500/20 to-violet-500/10 border-pink-500/30 hover:border-pink-400',
    icon: MessageSquare,
    samplePrompt:
      'Help me create a balanced 7-day productivity and wellness routine in Hinglish.',
  },
];

export const AssistantHomePage: React.FC = () => {
  const {
    preferredLanguage,
    setPreferredLanguage,
    aiStatus,
    activeConversation,
    setActiveConversation,
    refreshConversations,
    startNewChat,
    setActiveReport,
  } = useAppContext();

  const [promptInput, setPromptInput] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<AssistantCategory>('general');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isAnalyzingLabShortcut, setIsAnalyzingLabShortcut] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const { isListening, voiceError, setVoiceError, toggleListening } =
    useVoiceInput({
      language: preferredLanguage,
      onTranscript: (transcript) => {
        setPromptInput((prev) =>
          prev.trim() ? `${prev.trim()} ${transcript}` : transcript
        );
      },
    });

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === preferredLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const handleSend = async (overridePrompt?: string, overrideCat?: AssistantCategory) => {
    const textToSend = (overridePrompt ?? promptInput).trim();
    const catToUse = overrideCat ?? selectedCategory;

    if (!textToSend && !attachedFile) {
      setErrorBanner('Please enter a message or attach a document/image.');
      return;
    }

    setErrorBanner(null);
    setIsSending(true);

    try {
      let targetConv = activeConversation;
      if (!targetConv) {
        targetConv = await createNewConversation({
          title: textToSend.slice(0, 48) || attachedFile?.name || 'New AI Chat',
          category: catToUse,
          language: preferredLanguage,
        });
      }

      const fileToSend = attachedFile;
      if (!overridePrompt) setPromptInput('');
      setAttachedFile(null);

      const updatedThread = await sendConversationMessage({
        conversationId: targetConv.id,
        message: textToSend,
        language: preferredLanguage,
        category: catToUse,
        file: fileToSend,
      });

      setActiveConversation(updatedThread);
      await refreshConversations();
    } catch (err: any) {
      setErrorBanner(err?.message || 'Unable to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDirectMedicalLabAnalyze = async () => {
    if (!attachedFile) return;
    setErrorBanner(null);
    setIsAnalyzingLabShortcut(true);
    try {
      const report = await uploadAndAnalyzeReport(
        attachedFile,
        preferredLanguage,
        false
      );
      setAttachedFile(null);
      setActiveReport(report);
      navigate(`/dashboard/analysis/${report.id}`);
    } catch (err: any) {
      setErrorBanner(
        err?.message ||
          'File could not be parsed as a structured lab report. You can still send it in AI Chat for general document analysis.'
      );
    } finally {
      setIsAnalyzingLabShortcut(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeConversation || isRegenerating) return;
    setErrorBanner(null);
    setIsRegenerating(true);
    try {
      const updated = await regenerateConversationMessage(
        activeConversation.id,
        preferredLanguage
      );
      setActiveConversation(updated);
      await refreshConversations();
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to regenerate response.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClearChat = async () => {
    if (!activeConversation) return;
    try {
      const cleared = await clearConversationThread(activeConversation.id);
      setActiveConversation(cleared);
      await refreshConversations();
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to clear chat.');
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const hasMessages =
    activeConversation && activeConversation.messages.length > 0;

  return (
    <DashboardLayout>
      <div className="relative min-h-[calc(100vh-7.5rem)] flex flex-col justify-between gap-6">
        {/* Ambient Glow Accents */}
        <div
          className="pointer-events-none fixed top-24 right-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[130px] -z-10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none fixed bottom-16 left-1/3 w-96 h-96 rounded-full bg-cyan-500/10 blur-[130px] -z-10"
          aria-hidden="true"
        />

        {/* Error / Voice Notice Banner */}
        {(errorBanner || voiceError) && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2.5 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorBanner || voiceError}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setErrorBanner(null);
                setVoiceError(null);
              }}
              className="p-1 rounded-lg text-red-300 hover:bg-red-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW A: HOME HERO & QUICK ACTION CARDS (No messages in thread)   */}
        {/* ================================================================ */}
        {!hasMessages ? (
          <div className="my-auto py-4 sm:py-8 space-y-10">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Multifunctional AI Platform &bull; English, Hindi, Hinglish, Gujarati &amp; Urdu
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                What can I help you with{' '}
                <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  today?
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Analyze medical laboratory reports with deterministic reference-range verification, study complex topics, debug code, summarize PDFs &amp; images, or translate across languages.
              </p>
            </div>

            {/* Prominent Central AI Chat Composer */}
            <div className="max-w-3xl mx-auto w-full">
              <div className="rounded-2xl bg-obsidian-900/95 border border-violet-500/35 shadow-clinical-lg p-3 sm:p-4 space-y-3 focus-within:border-cyan-400/60 transition-all">
                {/* Category Mode Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'general', label: 'General AI' },
                      { id: 'medical_report', label: 'Medical Literacy' },
                      { id: 'study', label: 'Study AI' },
                      { id: 'coding', label: 'Coding AI' },
                      { id: 'document', label: 'Document Q&A' },
                      { id: 'translation', label: 'Translation' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(cat.id as AssistantCategory)
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-violet-600 text-white shadow-xs'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] text-cyan-400 font-medium">
                    Replying in: {currentLangMeta.nativeName}
                  </span>
                </div>

                {/* Attached File Preview Chip */}
                {attachedFile && (
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {attachedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(attachedFile.size / 1024).toFixed(1)} KB &bull; Ready to extract text or analyze as lab report
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isAnalyzingLabShortcut}
                        onClick={handleDirectMedicalLabAnalyze}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[11px] font-semibold transition-colors"
                      >
                        {isAnalyzingLabShortcut
                          ? 'Analyzing Lab Report...'
                          : 'Open in Medical Report Analyzer'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400"
                        aria-label="Remove attachment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Textarea Input */}
                <textarea
                  rows={3}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Ask anything in ${currentLangMeta.name} (${currentLangMeta.nativeName}), or attach a PDF, lab report, image, or code file...`}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
                />

                {/* Bottom Action Toolbar: Attachment, Voice, Language, Send */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.csv,.json,.js,.ts,.py"
                      className="hidden"
                      onChange={(e) =>
                        setAttachedFile(e.target.files?.[0] || null)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
                      title="Attach PDF, Image, or Text/Code document"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Attach File</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isListening
                          ? 'bg-red-500/20 border-red-400 text-red-200 animate-pulse'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      }`}
                      title="Voice input (Speech-to-Text)"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-3.5 h-3.5 text-red-400" />
                          <span>Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-violet-400" />
                          <span>Voice</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSending || (!promptInput.trim() && !attachedFile)}
                      onClick={() => handleSend()}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white text-xs font-bold shadow-glow-violet transition-all cursor-pointer"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Send</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Quick Action Cards */}
            <div className="max-w-6xl mx-auto space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Quick Action Cards &amp; Dedicated Smart Tools
                </h2>
                <Link
                  to="/medical"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Open Medical Report Analyzer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {QUICK_ACTION_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.id}
                      className={`rounded-2xl bg-gradient-to-br ${card.accent} bg-obsidian-900/80 border p-5 flex flex-col justify-between gap-4 transition-all group`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-10 h-10 rounded-xl bg-obsidian-950/80 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-obsidian-950/70 border border-white/10 text-[10px] font-bold text-slate-300">
                            {card.badge}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white">
                          {card.title}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {card.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        {card.route !== '/' ? (
                          <Link
                            to={card.route}
                            className="flex-1 py-2 px-3 rounded-xl bg-obsidian-950/90 hover:bg-obsidian-950 text-white border border-white/15 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>Open {card.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleSend(card.samplePrompt, card.id)}
                          className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all"
                          title="Try sample prompt in chat"
                        >
                          Try Prompt
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* VIEW B: ACTIVE CONVERSATION THREAD                               */
          /* ================================================================ */
          <div className="flex-1 flex flex-col justify-between gap-4 max-w-4xl w-full mx-auto">
            {/* Thread Header Bar */}
            <div className="p-4 rounded-2xl bg-obsidian-900/95 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold text-white truncate">
                    {activeConversation.title}
                  </h1>
                  <p className="text-[11px] text-slate-400">
                    Mode: <span className="uppercase">{activeConversation.category}</span> &bull; Language: {currentLangMeta.nativeName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isRegenerating || isSending}
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 disabled:opacity-50 transition-all"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-cyan-400 ${
                      isRegenerating ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearChat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-xs font-semibold text-slate-300 hover:text-red-300 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Chat</span>
                </button>

                <button
                  type="button"
                  onClick={() => startNewChat('general', 'New AI Chat')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-all"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 space-y-4 py-2 overflow-y-auto">
              {activeConversation.messages.map((msg) => {
                const isUser = msg.role === 'user';
                const isRtl = msg.language === 'ur';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed whitespace-pre-line lang-${msg.language} ${
                        isUser
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-glow-violet'
                          : msg.safetyFlagged
                            ? 'bg-amber-500/10 border border-amber-500/40 text-amber-100'
                            : 'bg-obsidian-900/95 border border-white/10 text-slate-100'
                      }`}
                    >
                      {/* Attachment Badge on User Message */}
                      {msg.attachment && (
                        <div className="mb-3 p-2.5 rounded-xl bg-black/25 border border-white/15 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileCheck2 className="w-4 h-4 text-cyan-300 shrink-0" />
                            <span className="font-semibold truncate">
                              {msg.attachment.fileName}
                            </span>
                            <span className="text-[10px] opacity-75">
                              ({msg.attachment.extractionMethod})
                            </span>
                          </div>
                          {msg.attachment.detectedBiomarkerCount &&
                          msg.attachment.detectedBiomarkerCount > 0 ? (
                            <Link
                              to="/medical"
                              className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 text-[10px] font-bold shrink-0"
                            >
                              {msg.attachment.detectedBiomarkerCount} Lab Markers Detected
                            </Link>
                          ) : null}
                        </div>
                      )}

                      {/* Provenance & Action Header on Assistant Message */}
                      {!isUser && (
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-white/10 text-[11px]">
                          <span className="font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                            {msg.sourceMode === 'live_ai' ? (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                                <span>Live AI Response ({aiStatus?.activeProvider})</span>
                              </>
                            ) : msg.sourceMode === 'clinical_guardrail' ? (
                              <>
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                <span>Non-Prescribing Medical Safety Guardrail</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Transparent Server Status &amp; Deterministic Extraction</span>
                              </>
                            )}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-medium transition-colors"
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div>{msg.content}</div>
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex items-center gap-2.5 text-xs text-cyan-300 p-3 rounded-xl bg-obsidian-900/80 border border-white/10 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span>CareMatric AI is processing your request...</span>
                </div>
              )}
            </div>

            {/* Sticky Bottom Chat Composer */}
            <div className="rounded-2xl bg-obsidian-900/95 border border-violet-500/35 p-3 space-y-2.5">
              {attachedFile && (
                <div className="px-3 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-semibold text-white">
                    Attached: {attachedFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.csv,.json,.js,.ts,.py"
                  className="hidden"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                </button>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening
                      ? 'bg-red-500/20 border-red-400 text-red-300 animate-pulse'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                  }`}
                  title="Voice input"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-red-400" />
                  ) : (
                    <Mic className="w-4 h-4 text-violet-400" />
                  )}
                </button>

                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Message CareMatric AI in ${currentLangMeta.name}...`}
                  className="flex-1 bg-obsidian-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />

                <button
                  type="button"
                  disabled={isSending || (!promptInput.trim() && !attachedFile)}
                  onClick={() => handleSend()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
