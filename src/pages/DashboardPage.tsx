import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderClock,
  Info,
  Loader2,
  Lock,
  Sparkles,
  Stethoscope,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAppContext } from '../context/AppContext';
import {
  analyzeSamplePreset,
  deleteSingleReport,
  fetchSamplePresets,
  SamplePresetMeta,
  uploadAndAnalyzeReport,
} from '../services/api';
import { MEDICAL_REPORT_LANGUAGES, SUPPORTED_LANGUAGES } from '../types/report';

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
const ALLOWED_MIMES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const UPLOAD_STAGES = [
  'Validating file signature & magic bytes...',
  'Extracting text via PDF parser / Tesseract OCR...',
  'Parsing laboratory test parameters & printed reference ranges...',
  'Generating multilingual plain-language explanations...',
];

export const DashboardPage: React.FC = () => {
  const {
    preferredLanguage,
    setPreferredLanguage,
    aiStatus,
    consentedHistory,
    refreshHistory,
    setActiveReport,
    isLoadingHistory,
  } = useAppContext();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStageIdx, setUploadStageIdx] = useState(0);
  const [uploadProgressPct, setUploadProgressPct] = useState(0);

  const [samplePresets, setSamplePresets] = useState<SamplePresetMeta[]>([]);
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSamplePresets()
      .then(setSamplePresets)
      .catch(() => null);
  }, []);

  const validateCandidateFile = (file: File): string | null => {
    const lowerName = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime = ALLOWED_MIMES.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      return `Unsupported file type ("${file.name}"). Please upload a laboratory report in PDF (.pdf), PNG (.png), or JPG (.jpg / .jpeg) format.`;
    }
    if (file.size === 0) {
      return `The selected file ("${file.name}") is empty (0 bytes). Please select a valid laboratory report document.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return `File size (${sizeMb} MB) exceeds the 10 MB maximum upload limit. Please compress the file or upload a single report page.`;
    }
    return null;
  };

  const handleFileSelection = (file: File | null) => {
    setValidationError(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const err = validateCandidateFile(file);
    if (err) {
      setSelectedFile(null);
      setValidationError(err);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0] || null;
    handleFileSelection(droppedFile);
  };

  const handleAnalyzeSelectedFile = async () => {
    if (!selectedFile) {
      setValidationError('Please select a PDF, JPG, or PNG laboratory report first.');
      return;
    }

    setValidationError(null);
    setIsUploading(true);
    setUploadStageIdx(0);
    setUploadProgressPct(18);

    const stageTimer = setInterval(() => {
      setUploadStageIdx((prev) => (prev < UPLOAD_STAGES.length - 1 ? prev + 1 : prev));
      setUploadProgressPct((prev) => (prev < 88 ? prev + 22 : prev));
    }, 650);

    try {
      const report = await uploadAndAnalyzeReport(
        selectedFile,
        preferredLanguage,
        consentChecked
      );
      clearInterval(stageTimer);
      setUploadProgressPct(100);
      setActiveReport(report);
      if (consentChecked) {
        await refreshHistory();
      }
      navigate(`/dashboard/analysis/${report.id}`);
    } catch (err: any) {
      clearInterval(stageTimer);
      setValidationError(
        err?.message ||
          'Failed to extract structured laboratory values from the uploaded file.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunSamplePreset = async (presetId: string) => {
    setValidationError(null);
    setLoadingPresetId(presetId);
    try {
      const report = await analyzeSamplePreset(
        presetId,
        preferredLanguage,
        consentChecked
      );
      setActiveReport(report);
      if (consentChecked) {
        await refreshHistory();
      }
      navigate(`/dashboard/analysis/${report.id}`);
    } catch (err: any) {
      setValidationError(err?.message || 'Unable to load synthetic sample report.');
    } finally {
      setLoadingPresetId(null);
    }
  };

  const handleDeleteFromRecent = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteSingleReport(id);
      await refreshHistory();
    } catch {
      // ignore
    }
  };

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === preferredLanguage) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 1. Greeting & System Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-violet-400" />
              Dedicated Medical Report Analyzer
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
              Analyze &amp; Understand Your Lab Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Upload a digital PDF or scanned report image to extract verbatim test values, verify reference ranges, and read explanations in{' '}
              <strong className="font-semibold text-cyan-300">
                Hindi, Gujarati, Urdu, and English
              </strong>
              .
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Link
              to="/dashboard/history"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-900 border border-white/10 hover:border-violet-500/40 text-xs font-semibold text-slate-200 transition-all"
            >
              <FolderClock className="w-4 h-4 text-cyan-400" />
              <span>Report History ({consentedHistory.length})</span>
            </Link>
          </div>
        </div>

        {/* 2. Main Grid: Upload Panel (Left 7 cols) + Quick Actions & Samples (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Report Upload Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 shadow-clinical-lg p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Upload Laboratory Report
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supports digital PDFs (.pdf) and scanned report images (.png, .jpg) up to 10 MB
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
                  OCR + PDF Enabled
                </span>
              </div>

              {/* Validation Error Alert */}
              {validationError && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <strong className="font-bold block mb-0.5">
                        Upload Validation Notice
                      </strong>
                      {validationError}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValidationError(null)}
                    className="p-1 rounded-lg text-red-300 hover:bg-red-500/20"
                    aria-label="Dismiss error"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isUploading) setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
                onClick={() => {
                  if (!isUploading) fileInputRef.current?.click();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                aria-label="Upload laboratory report file (PDF, JPG, or PNG)"
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/40 ${
                  isDragging
                    ? 'border-cyan-400 bg-violet-600/15'
                    : selectedFile
                      ? 'border-cyan-500/70 bg-cyan-500/10'
                      : 'border-white/20 hover:border-violet-500/60 bg-obsidian-950/60 hover:bg-violet-500/5'
                } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => handleFileSelection(e.target.files?.[0] || null)}
                />

                {!selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-obsidian-900 border border-violet-500/30 shadow-glow-violet mx-auto flex items-center justify-center text-cyan-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">
                        Drag &amp; drop your lab report here, or{' '}
                        <span className="text-cyan-400 underline underline-offset-2">
                          browse files
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Accepted formats: PDF, JPG, JPEG, PNG &bull; Max file size: 10 MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-obsidian-900 p-4 rounded-xl border border-cyan-500/30 text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB &bull; Ready for deterministic extraction
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => setSelectedFile(null)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-red-300 hover:bg-red-500/15 transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Progress Indicator */}
              {isUploading && (
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-violet-200">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      {UPLOAD_STAGES[uploadStageIdx]}
                    </span>
                    <span className="font-mono">{uploadProgressPct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-obsidian-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Language & Informed Consent Controls */}
              <div className="pt-2 space-y-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-200">
                    Report Explanation Language:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MEDICAL_REPORT_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setPreferredLanguage(lang.code)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          preferredLanguage === lang.code
                            ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-violet-400/50'
                            : 'bg-obsidian-950 text-slate-300 border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {lang.nativeName} ({lang.name})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Informed Consent Opt-In Box */}
                <div className="p-3.5 rounded-xl bg-obsidian-950/90 border border-white/10 flex items-start gap-3">
                  <input
                    id="consent-checkbox"
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 text-violet-600 focus:ring-violet-500 cursor-pointer"
                  />
                  <div className="text-xs text-slate-300 leading-relaxed flex-1">
                    <label
                      htmlFor="consent-checkbox"
                      className="font-semibold text-white cursor-pointer"
                    >
                      Save analyzed report to my secure Report History (Informed Consent)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Unchecked by default (ephemeral mode). When checked, extracted parameters are saved in your isolated session history so you can revisit or delete them anytime.{' '}
                      <button
                        type="button"
                        onClick={() => setShowConsentModal(true)}
                        className="text-cyan-400 font-semibold underline underline-offset-2 hover:text-cyan-300"
                      >
                        Read Consent &amp; Retention Details
                      </button>
                    </p>
                  </div>
                </div>

                {/* Primary Submit CTA */}
                <button
                  type="button"
                  disabled={!selectedFile || isUploading}
                  onClick={handleAnalyzeSelectedFile}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-35 text-white text-sm font-bold shadow-glow-violet transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Laboratory Report...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>
                        {selectedFile
                          ? `Analyze "${selectedFile.name}" in ${currentLangMeta.name}`
                          : 'Select a PDF, PNG, or JPG Report to Analyze'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recent Consented Reports Section */}
            <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">
                    Recent Consented Medical Reports
                  </h2>
                </div>
                <Link
                  to="/dashboard/history"
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Manage All &rarr;
                </Link>
              </div>

              {isLoadingHistory ? (
                <div className="space-y-2.5">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="h-14 rounded-xl bg-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : consentedHistory.length === 0 ? (
                <div className="p-6 rounded-xl bg-obsidian-950/70 border border-white/5 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-slate-200">
                    No Saved Reports in History Yet
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                    CareMatric AI never stores your health reports without your explicit consent. Enable the Informed Consent checkbox during upload or click &ldquo;Save to History&rdquo; on any analyzed report.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
                  {consentedHistory.slice(0, 4).map((rep) => (
                    <Link
                      key={rep.id}
                      to={`/dashboard/analysis/${rep.id}`}
                      className="p-3.5 bg-obsidian-950/60 hover:bg-white/5 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                            <span className="truncate">{rep.fileName}</span>
                            {rep.isSyntheticSample && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300">
                                SYNTHETIC
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {rep.stats.totalTests} tests &bull;{' '}
                            {rep.stats.outOfRangeCount} outside range &bull;{' '}
                            {new Date(rep.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteFromRecent(rep.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/15 transition-colors"
                          title="Delete report from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Synthetic Sample Lab Reports for Testing & Verification */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    Instant Verification &amp; Testing
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    Synthetic Sample Lab Reports
                  </h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-mono border border-white/10">
                  NOT REAL PATIENT DATA
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Test the full extraction, reference-range comparison, and multilingual explanation flow using a synthetic laboratory report preset—or download the sample PDF and drag it into the uploader.
              </p>

              <div className="space-y-3 pt-1">
                {samplePresets.map((preset) => {
                  const isRunning = loadingPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className="p-4 rounded-xl bg-obsidian-950/80 border border-white/10 hover:border-violet-500/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {preset.badge}
                        </span>
                        <a
                          href={`/api/samples/${encodeURIComponent(preset.id)}/pdf`}
                          download={preset.fileName}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download PDF</span>
                        </a>
                      </div>

                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-white">
                          {preset.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {preset.subtitle}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={Boolean(loadingPresetId) || isUploading}
                        onClick={() => handleRunSamplePreset(preset.id)}
                        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-violet-600/80 to-cyan-600/80 hover:from-violet-600 hover:to-cyan-600 disabled:opacity-50 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        {isRunning ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Extracting &amp; Analyzing PDF...</span>
                          </>
                        ) : (
                          <>
                            <span>Analyze Sample Report</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI & Safety Transparency Card */}
            <div className="rounded-2xl bg-violet-950/25 border border-violet-500/30 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Medical Safety Guarantees</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Verbatim Range Comparison:</strong> Values are compared strictly against the reference interval printed on your report.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Zero Fabricated Ranges:</strong> If a lab line omits a reference range, CareMatric AI marks it as <em>Range Not Provided</em>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Server-Side AI Status:</strong>{' '}
                    {aiStatus?.aiConfigured
                      ? `Live AI active via ${aiStatus.activeProvider}.`
                      : 'Running in Deterministic + Clinical Glossary mode (configure GEMINI_API_KEY in server .env to enable live LLM generation).'}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Informed Consent Disclosure Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-obsidian-900 rounded-2xl border border-white/15 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Informed Consent &amp; Data Retention Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Default Ephemeral Processing:</strong> When you analyze a report without checking the consent box, your report is processed in temporary memory for your active viewing session only and is never written to persistent storage.
              </p>
              <p>
                <strong>2. What Informed Consent Saves:</strong> If you opt in to save a report, CareMatric AI stores the extracted biomarker values, reference ranges, and multilingual explanations linked exclusively to your isolated session token.
              </p>
              <p>
                <strong>3. Strict Session Isolation &amp; Erasure:</strong> Your saved reports are never accessible to other users. You can delete any individual report or purge your entire history at any time from the Report History page.
              </p>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
