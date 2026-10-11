import {
  AlertTriangle,
  ArrowLeft,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Eye,
  FileCode2,
  Filter,
  HelpCircle,
  Loader2,
  Lock,
  MessageSquare,
  Mic,
  MicOff,
  Printer,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAppContext } from '../context/AppContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import {
  askReportQuestion,
  deleteSingleReport,
  fetchReportById,
  saveReportWithConsent,
  translateReportLanguage,
} from '../services/api';
import {
  BiomarkerStatus,
  ChatMessage,
  ExtractedBiomarker,
  MEDICAL_REPORT_LANGUAGES,
  MedicalLanguage,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../types/report';

type FilterMode = 'all' | 'abnormal' | 'normal' | 'unranged';

function StatusBadge({ status }: { status: BiomarkerStatus }) {
  switch (status) {
    case 'normal':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Within Range
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          Below Range (Low)
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Above Range (High)
        </span>
      );
    case 'critical_low':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Critical Low
        </span>
      );
    case 'critical_high':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          Critical High
        </span>
      );
    case 'range_not_provided':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-slate-300 border border-white/15">
          Range Not Specified
        </span>
      );
  }
}

function RangeVisualBar({ biomarker }: { biomarker: ExtractedBiomarker }) {
  const val = biomarker.measuredValueNumeric;
  const min = biomarker.referenceMin;
  const max = biomarker.referenceMax;

  if (val === null || (min === null && max === null)) {
    return (
      <div className="text-[10px] text-slate-500 italic mt-1">
        No numeric reference interval printed on report
      </div>
    );
  }

  let positionPct = 50;
  if (min !== null && max !== null && max > min) {
    const span = max - min;
    const paddedMin = min - span * 0.35;
    const paddedMax = max + span * 0.35;
    positionPct = Math.max(
      4,
      Math.min(96, ((val - paddedMin) / (paddedMax - paddedMin)) * 100)
    );
  } else if (max !== null && max > 0) {
    positionPct = Math.max(4, Math.min(96, (val / (max * 1.4)) * 100));
  } else if (min !== null && min > 0) {
    positionPct = Math.max(4, Math.min(96, (val / (min * 1.6)) * 100));
  }

  const isAbnormal = biomarker.status !== 'normal';

  return (
    <div className="mt-2 space-y-1 max-w-[200px]">
      <div className="relative h-2 rounded-full bg-obsidian-950 border border-white/10 overflow-hidden">
        <div className="absolute inset-y-0 left-[22%] right-[22%] bg-emerald-500/25 border-x border-emerald-400/40" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white shadow-xs ${
            isAbnormal ? 'bg-amber-400' : 'bg-cyan-400'
          }`}
          style={{ left: `${positionPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-400">
        <span>{min !== null ? min : '0'}</span>
        <span className="text-cyan-300 font-semibold">{biomarker.measuredValueRaw}</span>
        <span>{max !== null ? max : '+'}</span>
      </div>
    </div>
  );
}

export const ReportAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    preferredLanguage,
    setPreferredLanguage,
    activeReport,
    setActiveReport,
    refreshHistory,
  } = useAppContext();

  const [report, setReport] = useState(activeReport);
  const [loading, setLoading] = useState(!activeReport || activeReport.id !== id);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [showRawTextModal, setShowRawTextModal] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [isSavingConsent, setIsSavingConsent] = useState(false);

  // Contextual Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const { isListening, toggleListening } = useVoiceInput({
    language: preferredLanguage,
    onTranscript: (t) =>
      setChatInput((prev) => (prev.trim() ? `${prev.trim()} ${t}` : t)),
  });

  // Safe Medical Language mapping ('en' | 'hi' | 'gu' | 'ur')
  const activeMedicalLang: MedicalLanguage =
    preferredLanguage === 'hi' ||
    preferredLanguage === 'gu' ||
    preferredLanguage === 'ur'
      ? preferredLanguage
      : preferredLanguage === 'hinglish'
        ? 'hi'
        : 'en';

  useEffect(() => {
    if (!id) return;
    if (activeReport && activeReport.id === id) {
      setReport(activeReport);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchReportById(id)
      .then((loaded) => {
        setReport(loaded);
        setActiveReport(loaded);
      })
      .catch((err: any) => {
        setError(err?.message || 'Report could not be loaded.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, activeReport, setActiveReport]);

  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    setPreferredLanguage(newLang);
    if (!report) return;
    const medLang: MedicalLanguage =
      newLang === 'hi' || newLang === 'gu' || newLang === 'ur' ? newLang : 'en';
    if (report.aiGenerationMeta.aiConfigured) {
      setIsTranslating(true);
      try {
        const updated = await translateReportLanguage(report.id, medLang);
        setReport(updated);
        setActiveReport(updated);
      } catch {
        // Fallback explanations in all 4 medical languages are already pre-populated
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleGrantConsent = async () => {
    if (!report) return;
    setIsSavingConsent(true);
    try {
      const updated = await saveReportWithConsent(report.id);
      setReport(updated);
      setActiveReport(updated);
      await refreshHistory();
    } catch {
      // ignore
    } finally {
      setIsSavingConsent(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    try {
      await deleteSingleReport(report.id);
      setActiveReport(null);
      await refreshHistory();
      navigate('/medical');
    } catch {
      // ignore
    }
  };

  const handleCopyDoctorQuestions = () => {
    if (!report) return;
    const questions = report.summaries[activeMedicalLang].doctorQuestions;
    const text = `Questions for My Doctor (${report.fileName}):\n${questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join('\n')}`;
    navigator.clipboard?.writeText(text);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2500);
  };

  const handleSendChatQuestion = async (customQuestion?: string) => {
    if (!report) return;
    const qText = (customQuestion ?? chatInput).trim();
    if (!qText || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: qText,
      language: preferredLanguage,
      timestamp: new Date().toISOString(),
      sourceMode: 'live_ai',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customQuestion) setChatInput('');
    setIsChatLoading(true);

    try {
      const reply = await askReportQuestion(report.id, qText, preferredLanguage);
      setChatMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content:
            err?.message ||
            'Unable to answer right now. Please review the biomarker explanations above or consult your physician.',
          language: preferredLanguage,
          timestamp: new Date().toISOString(),
          sourceMode: 'clinical_guardrail',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const filteredBiomarkers = useMemo(() => {
    if (!report) return [];
    return report.biomarkers.filter((b) => {
      if (filterMode === 'abnormal') {
        if (b.status === 'normal' || b.status === 'range_not_provided') return false;
      } else if (filterMode === 'normal') {
        if (b.status !== 'normal') return false;
      } else if (filterMode === 'unranged') {
        if (b.status !== 'range_not_provided') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.testName.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          (b.canonicalCode && b.canonicalCode.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [report, filterMode, searchQuery]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
          <div className="h-96 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !report) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-obsidian-900 border border-white/10 text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">
            Report Not Found in Current Session
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {error ||
              'Unconsented reports are held only in ephemeral memory and are cleared when the server restarts or the session changes.'}
          </p>
          <div className="pt-2">
            <Link
              to="/medical"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Medical Report Upload</span>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isRtl = activeMedicalLang === 'ur';
  const currentSummary = report.summaries[activeMedicalLang];
  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === activeMedicalLang) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 1. Top Breadcrumb & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10 no-print">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link
                to="/medical"
                className="hover:text-cyan-400 inline-flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Medical Reports
              </Link>
              <span>/</span>
              <span className="font-mono text-slate-300">{report.id}</span>
              {report.isSyntheticSample && (
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Synthetic Sample Report (Not Real Patient Data)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex flex-wrap items-center gap-2.5">
              <span>{report.fileName}</span>
              <span className="text-xs font-normal text-slate-400">
                ({report.extractionMethod === 'pdf_text' ? 'PDF Text Layer' : 'Tesseract OCR'} &bull;{' '}
                {report.extractionConfidence}% confidence)
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowRawTextModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 hover:bg-white/5 text-xs font-semibold text-slate-200 transition-colors"
            >
              <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Raw Extracted Text</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-900 border border-white/10 hover:bg-white/5 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print Summary</span>
            </button>

            {!report.consentSaved ? (
              <button
                type="button"
                disabled={isSavingConsent}
                onClick={handleGrantConsent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isSavingConsent
                    ? 'Saving...'
                    : 'Save to History (Grant Consent)'}
                </span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Saved in History</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleDeleteReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-900 border border-red-500/30 hover:bg-red-500/15 text-red-300 text-xs font-semibold transition-colors"
              title="Delete this report immediately"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* 2. Prominent Multilingual Switcher Bar */}
        <div className="p-4 rounded-2xl bg-obsidian-900/95 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
              {activeMedicalLang.toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>
                  Viewing Report Explanation in {currentLangMeta.nativeName} ({currentLangMeta.name})
                </span>
                {isTranslating && (
                  <span className="inline-flex items-center gap-1 text-cyan-400 font-normal">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Updating...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Extracted test names, values, and lab reference ranges remain verbatim to preserve clinical accuracy.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MEDICAL_REPORT_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeMedicalLang === lang.code
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {lang.nativeName}{' '}
                <span className="opacity-70 text-[10px]">({lang.name})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Urgent Care Alert Banner */}
        {report.urgentCare.triggered && (
          <div
            role="alert"
            className="p-5 rounded-2xl bg-red-950/60 border-2 border-red-500/60 text-red-100 shadow-sm space-y-3"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wide">
                    Urgent Clinical Attention Recommended — Critical Threshold Detected
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
                    {report.urgentCare.flaggedTests.length} Critical Marker(s)
                  </span>
                </div>
                <p
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className={`text-xs sm:text-sm text-red-200 leading-relaxed font-medium lang-${activeMedicalLang}`}
                >
                  {report.urgentCare.guidance[activeMedicalLang]}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {report.urgentCare.flaggedTests.map((ft) => (
                <div
                  key={ft.testName}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  className={`p-3 rounded-xl bg-black/40 border border-red-500/30 text-xs text-red-100 lang-${activeMedicalLang}`}
                >
                  {ft.reason[activeMedicalLang]}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Honest AI Provider Status Strip */}
        <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-white">
                Explanation Provenance:{' '}
              </span>
              {report.aiGenerationMeta.generatedByLiveAi ? (
                <span className="text-slate-300">
                  Enriched by live server AI (
                  <strong className="text-cyan-300">
                    {report.aiGenerationMeta.provider} &mdash;{' '}
                    {report.aiGenerationMeta.model}
                  </strong>
                  ) from deterministically verified lab parameters.
                </span>
              ) : (
                <span className="text-slate-300">
                  <strong>Deterministic Clinical Biomarker Glossary Mode:</strong>{' '}
                  {report.aiGenerationMeta.fallbackReason}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-obsidian-950 border border-white/10 text-[11px] font-semibold text-slate-200">
              <span className="w-2 h-2 rounded-xs bg-cyan-400" />
              Extracted Fact = From Report
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-violet-500/15 border border-violet-500/30 text-[11px] font-semibold text-violet-200">
              <span className="w-2 h-2 rounded-xs bg-violet-400" />
              Explanation = Educational Only
            </span>
          </div>
        </div>

        {/* 5. Summary Metrics & Plain-Language Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-obsidian-900/95 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Extracted Tests
              </span>
              <div className="text-2xl font-extrabold text-white mt-1 font-mono">
                {report.stats.totalTests}
              </div>
              <span className="text-[11px] text-slate-400">
                Verified from document
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900/95 border border-emerald-500/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Within Lab Range
              </span>
              <div className="text-2xl font-extrabold text-emerald-300 mt-1 font-mono">
                {report.stats.normalCount}
              </div>
              <span className="text-[11px] text-slate-400">
                Matches printed interval
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900/95 border border-amber-500/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Outside Lab Range
              </span>
              <div className="text-2xl font-extrabold text-amber-300 mt-1 font-mono">
                {report.stats.outOfRangeCount}
              </div>
              <span className="text-[11px] text-slate-400">
                Discuss with physician
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-obsidian-900/95 border border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                No Range Printed
              </span>
              <div className="text-2xl font-extrabold text-slate-200 mt-1 font-mono">
                {report.stats.rangeNotProvidedCount}
              </div>
              <span className="text-[11px] text-slate-400">
                Never fabricated
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-obsidian-900/95 border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Plain-Language Report Summary ({currentLangMeta.nativeName})
                </span>
                {report.labMetadata.reportDate && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Report Date: {report.labMetadata.reportDate}
                  </span>
                )}
              </div>
              <p
                dir={isRtl ? 'rtl' : 'ltr'}
                className={`text-xs sm:text-sm text-slate-200 leading-relaxed lang-${activeMedicalLang}`}
              >
                {currentSummary.overview}
              </p>
            </div>

            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              className={`pt-3 border-t border-white/10 text-xs text-slate-300 flex items-start gap-2 lang-${activeMedicalLang}`}
            >
              <Stethoscope className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{report.urgentCare.guidance[activeMedicalLang]}</span>
            </div>
          </div>
        </div>

        {/* 6. Biomarker Analysis Table with Fact vs Explanation Separation */}
        <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 overflow-hidden">
          <div className="p-4 sm:p-5 bg-obsidian-950/60 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
            <div className="flex flex-wrap items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              {[
                { id: 'all', label: `All Parameters (${report.stats.totalTests})` },
                {
                  id: 'abnormal',
                  label: `Outside Range (${report.stats.outOfRangeCount})`,
                },
                {
                  id: 'normal',
                  label: `Within Range (${report.stats.normalCount})`,
                },
                ...(report.stats.rangeNotProvidedCount > 0
                  ? [
                      {
                        id: 'unranged',
                        label: `Range Not Specified (${report.stats.rangeNotProvidedCount})`,
                      },
                    ]
                  : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id as FilterMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterMode === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                      : 'bg-obsidian-900 text-slate-300 border border-white/10 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by test name or panel..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-obsidian-950 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="hidden lg:grid lg:grid-cols-12 bg-obsidian-950/90 border-b border-white/10 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <div className="col-span-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-xs bg-cyan-400" />
              <span>Extracted From Report (Verbatim Laboratory Facts)</span>
            </div>
            <div className="col-span-7 flex items-center gap-2 pl-4 border-l border-white/10">
              <span className="w-2 h-2 rounded-xs bg-violet-400" />
              <span>
                Educational Explanation in {currentLangMeta.nativeName} (Non-Diagnostic)
              </span>
            </div>
          </div>

          {filteredBiomarkers.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-bold text-slate-200">
                No matching biomarkers in this filter view.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterMode('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-cyan-400 underline"
              >
                Show all extracted parameters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredBiomarkers.map((bio) => {
                const exp = bio.explanation[activeMedicalLang];
                const isSourceExpanded = expandedSourceId === bio.id;

                return (
                  <div
                    key={bio.id}
                    className="grid grid-cols-1 lg:grid-cols-12 p-5 sm:p-6 gap-5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Left 5 cols: Verbatim Extracted Facts */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block">
                            {bio.category}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-white">
                            {bio.testName}
                          </h3>
                        </div>
                        <StatusBadge status={bio.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-obsidian-950/90 border border-white/10">
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                            Measured Value
                          </span>
                          <div className="text-sm font-bold font-mono text-white mt-0.5">
                            {bio.measuredValueRaw}{' '}
                            <span className="text-xs font-normal text-slate-400">
                              {bio.unit ?? '(unit not printed)'}
                            </span>
                          </div>
                        </div>

                        <div className="border-l border-white/10 pl-2.5">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                            Lab Reference Range
                          </span>
                          <div className="text-xs font-semibold font-mono text-slate-200 mt-1">
                            {bio.referenceRangeRaw ?? (
                              <span className="text-slate-500 italic font-sans">
                                Not specified on report
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <div className="flex-1">
                          <RangeVisualBar biomarker={bio} />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSourceId(isSourceExpanded ? null : bio.id)
                          }
                          className="text-[11px] font-medium text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1 shrink-0 no-print"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{isSourceExpanded ? 'Hide line' : 'Source line'}</span>
                        </button>
                      </div>

                      {isSourceExpanded && (
                        <div className="p-2.5 rounded-lg bg-black border border-white/10 text-slate-200 font-mono text-[11px] overflow-x-auto">
                          <span className="text-cyan-400 select-none">
                            Verbatim OCR/PDF Line:{' '}
                          </span>
                          {bio.rawSourceLine}
                        </div>
                      )}
                    </div>

                    {/* Right 7 cols: Multilingual Plain-Language Explanation */}
                    <div
                      dir={isRtl ? 'rtl' : 'ltr'}
                      className={`lg:col-span-7 lg:pl-6 lg:border-l lg:border-white/10 space-y-2.5 lang-${activeMedicalLang}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-200 bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 rounded-md">
                          {exp.sourceType === 'live_ai' ? (
                            <>
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              <span>Live AI Explanation ({currentLangMeta.nativeName})</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              <span>
                                Verified Clinical Glossary ({currentLangMeta.nativeName})
                              </span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm text-slate-200">
                        <p className="leading-relaxed">
                          <strong className="font-bold text-white">
                            {activeMedicalLang === 'hi'
                              ? 'यह जांच क्या मापती है: '
                              : activeMedicalLang === 'gu'
                                ? 'આ ટેસ્ટ શું માપે છે: '
                                : activeMedicalLang === 'ur'
                                  ? 'یہ ٹیسٹ کیا ناپتا ہے: '
                                  : 'What this test measures: '}
                          </strong>
                          {exp.whatItMeasures}
                        </p>

                        <p className="leading-relaxed p-3 rounded-xl bg-violet-950/30 border border-violet-500/30 text-slate-100">
                          <strong className="font-bold text-cyan-300">
                            {activeMedicalLang === 'hi'
                              ? 'आपके परिणाम का अर्थ: '
                              : activeMedicalLang === 'gu'
                                ? 'તમારા પરિણામનો અર્થ: '
                                : activeMedicalLang === 'ur'
                                  ? 'آپ کے نتیجے کا مطلب: '
                                  : 'What your result means: '}
                          </strong>
                          {exp.whatResultMeans}
                        </p>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {exp.educationalNote}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. Bottom Split: Questions for Your Doctor + Contextual Multilingual AI Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 rounded-2xl bg-obsidian-900/95 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Questions to Discuss with Your Doctor
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Tailored to the extracted markers on this report ({currentLangMeta.nativeName})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyDoctorQuestions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors no-print"
              >
                {copiedQuestions ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Questions</span>
                  </>
                )}
              </button>
            </div>

            <ul
              dir={isRtl ? 'rtl' : 'ltr'}
              className={`space-y-2.5 lang-${activeMedicalLang}`}
            >
              {currentSummary.doctorQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="p-3.5 rounded-xl bg-obsidian-950/90 border border-white/10 text-xs sm:text-sm text-slate-200 flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-white/10 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                General Clinical Context
              </h3>
              <ul
                dir={isRtl ? 'rtl' : 'ltr'}
                className={`space-y-1.5 text-xs text-slate-300 lang-${activeMedicalLang}`}
              >
                {currentSummary.lifestyleEducation.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Contextual AI Report Chat Interface */}
          <div className="lg:col-span-6 rounded-2xl bg-obsidian-900/95 border border-white/10 flex flex-col overflow-hidden no-print">
            <div className="p-5 bg-obsidian-950 border-b border-white/10 text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">
                    Contextual Report Q&amp;A Assistant
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Grounded in your extracted biomarkers &bull; Non-prescribing safety guardrails
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-[10px] font-semibold text-violet-300">
                {preferredLanguage.toUpperCase()}
              </span>
            </div>

            <div className="px-4 py-3 bg-obsidian-950/60 border-b border-white/10 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleSendChatQuestion(
                    'Explain my out-of-range biomarkers in simple language.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 text-[11px] font-medium text-slate-200 transition-colors"
              >
                Explain out-of-range markers
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendChatQuestion(
                    'What does HbA1c and Fasting Blood Glucose measure?'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 text-[11px] font-medium text-slate-200 transition-colors"
              >
                What do my markers measure?
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendChatQuestion(
                    'Which medicine or dosage should I take to fix these results?'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:border-amber-400 text-[11px] font-medium text-amber-200 transition-colors"
              >
                Test Safety Guardrail (Dosage Request)
              </button>
            </div>

            <div className="p-4 h-80 overflow-y-auto space-y-3 bg-obsidian-900">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                  <HelpCircle className="w-7 h-7 text-cyan-400/70" />
                  <p className="text-xs font-semibold text-white">
                    Ask a Question About Your Uploaded Report
                  </p>
                  <p className="text-[11px] max-w-xs leading-relaxed">
                    Ask what a specific test means in English, Hindi, Hinglish, Gujarati, or Urdu. CareMatric AI explains terminology and reference ranges without diagnosing or prescribing medicines.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      dir={msg.language === 'ur' ? 'rtl' : 'ltr'}
                      className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-line lang-${msg.language} ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                          : msg.safetyFlagged
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-100'
                            : 'bg-obsidian-950 border border-white/10 text-slate-200'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          <span>
                            {msg.sourceMode === 'live_ai'
                              ? 'Live AI Response'
                              : msg.sourceMode === 'clinical_guardrail'
                                ? 'Non-Prescribing Safety Guardrail'
                                : 'Deterministic Report Lookup'}
                          </span>
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))
              )}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-cyan-300 p-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span>Analyzing report context...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatQuestion();
              }}
              className="p-3 bg-obsidian-950 border-t border-white/10 flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border ${
                  isListening
                    ? 'bg-red-500/20 border-red-400 text-red-300 animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-300'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-violet-400" />}
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your report..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-obsidian-900 border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 disabled:opacity-40 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Raw Extracted Text Verification Modal */}
      {showRawTextModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-obsidian-900 rounded-2xl border border-white/15 max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Verbatim Extracted Document Text
                </h3>
                <p className="text-xs text-slate-400">
                  Extraction Method: {report.extractionMethod} &bull; Confidence:{' '}
                  {report.extractionConfidence}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRawTextModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-obsidian-950 border border-white/10 text-slate-200 font-mono text-xs overflow-auto max-h-96 whitespace-pre-wrap leading-relaxed">
              {report.rawExtractedText}
            </pre>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowRawTextModal(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
