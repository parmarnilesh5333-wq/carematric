import {
  AlertCircle,
  BookOpen,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  FileCheck2,
  FileSearch,
  Languages,
  Loader2,
  Mic,
  MicOff,
  Play,
  Send,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAppContext } from '../context/AppContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import {
  extractDocumentForAnalysis,
  runSmartToolPrompt,
} from '../services/api';
import {
  ExtractedDocumentResult,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../types/report';

// ============================================================================
// 1. STUDY AI PAGE (/tools/study)
// ============================================================================
export const StudyAiPage: React.FC = () => {
  const { preferredLanguage, setPreferredLanguage } = useAppContext();
  const [topicOrNotes, setTopicOrNotes] = useState(
    'Human Cardiovascular System: Heart chambers, systemic vs pulmonary circulation, hemoglobin oxygen transport, and blood pressure regulation.'
  );
  const [studyMode, setStudyMode] = useState<'notes' | 'explain' | 'quiz'>('notes');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { isListening, toggleListening } = useVoiceInput({
    language: preferredLanguage,
    onTranscript: (t) =>
      setTopicOrNotes((prev) => (prev.trim() ? `${prev.trim()} ${t}` : t)),
  });

  // Deterministic Extractive Study Breakdown (always works immediately on input notes)
  const extractiveStudyOutline = useMemo(() => {
    const cleaned = topicOrNotes.trim();
    if (!cleaned) return [];
    const parts = cleaned
      .split(/(?<=[.!?])\s+|\r?\n|;|,/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 12);
    return parts.slice(0, 8);
  }, [topicOrNotes]);

  const handleRunStudyAi = async () => {
    if (!topicOrNotes.trim()) {
      setError('Please enter a study topic or paste your lecture notes.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const modeInstruction =
      studyMode === 'notes'
        ? 'Create structured study notes with clear headings, bullet points, key definitions, and memory aids for:'
        : studyMode === 'explain'
          ? 'Explain the following topic step-by-step in simple, intuitive language with real-world analogies:'
          : 'Generate a 5-question multiple-choice quiz with an answer key and brief explanations for:';

    try {
      const res = await runSmartToolPrompt({
        prompt: `${modeInstruction}\n\n${topicOrNotes}`,
        language: preferredLanguage,
        category: 'study',
      });
      setAiOutput(res.content);
      setSourceMode(res.sourceMode);
    } catch (err: any) {
      setError(err?.message || 'Unable to process Study AI request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              Smart Study Assistant
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
              Study AI &mdash; Notes, Explanations &amp; Quizzes
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Turn complex medical, scientific, or academic topics into structured study notes and practice quizzes in Hindi, Hinglish, Gujarati, or English.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Input Column */}
          <div className="lg:col-span-6 rounded-2xl bg-obsidian-900/95 border border-white/10 p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-white">
                Select Study Mode:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'notes', label: 'Structured Notes' },
                  { id: 'explain', label: 'Simple Explanation' },
                  { id: 'quiz', label: 'Practice Quiz' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setStudyMode(m.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      studyMode === m.id
                        ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Study Topic or Lecture Notes:
                </label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                    isListening
                      ? 'bg-red-500/20 border-red-400 text-red-200 animate-pulse'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-cyan-400" />}
                  <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={topicOrNotes}
                onChange={(e) => setTopicOrNotes(e.target.value)}
                placeholder="Enter a subject, chapter topic, or paste study text..."
                className="w-full rounded-xl bg-obsidian-950 border border-white/10 p-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 leading-relaxed"
              />
            </div>

            {/* Quick Topic Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">
                Sample Study Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Human Cardiovascular & Hemoglobin Transport',
                  'Type 2 Diabetes, Insulin & HbA1c Physiology',
                  'Data Structures: Binary Search Trees & Time Complexity',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setTopicOrNotes(sample)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isLoading || !topicOrNotes.trim()}
              onClick={handleRunStudyAi}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-glow-violet transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Study Material...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Study Material</span>
                </>
              )}
            </button>
          </div>

          {/* Right Output Column */}
          <div className="lg:col-span-6 space-y-4">
            {/* Deterministic Key Concept Breakdown Card */}
            {extractiveStudyOutline.length > 0 && (
              <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Instant Concept Breakdown ({extractiveStudyOutline.length} segments)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                    Deterministic Parser
                  </span>
                </div>
                <ul className="space-y-2 text-xs text-slate-200">
                  {extractiveStudyOutline.map((item, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-xl bg-obsidian-950/70 border border-white/5 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-violet-600/30 text-violet-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Output Card */}
            {aiOutput && (
              <div className="rounded-2xl bg-obsidian-900/95 border border-violet-500/35 p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-xs font-bold text-violet-300">
                    {sourceMode === 'live_ai'
                      ? 'Live AI Study Output'
                      : 'AI Server Status & Study Guide'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(aiOutput);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {aiOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ============================================================================
// 2. CODING AI PAGE (/tools/coding)
// ============================================================================
export const CodingAiPage: React.FC = () => {
  const { preferredLanguage } = useAppContext();
  const [codeLang, setCodeLang] = useState('TypeScript');
  const [codeMode, setCodeMode] = useState<'explain' | 'debug' | 'optimize'>('debug');
  const [codeInput, setCodeInput] = useState(
    `async function fetchPatientLabResults(reportId) {\n  var url = "/api/reports/" + reportId;\n  const response = await fetch(url);\n  if (response.status == 200) {\n    console.log("Loaded report");\n    return response.json();\n  }\n}`
  );
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Instant Deterministic Static Code Diagnostics
  const staticDiagnostics = useMemo(() => {
    const lines = codeInput.split(/\r?\n/);
    const findings: { type: 'warning' | 'info'; message: string }[] = [];

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      if (/\bvar\s+/.test(line)) {
        findings.push({
          type: 'warning',
          message: `Line ${lineNum}: Uses legacy 'var' declaration. Prefer 'const' or 'let' for block scoping.`,
        });
      }
      if (/[^=!]==[^=]/.test(line)) {
        findings.push({
          type: 'warning',
          message: `Line ${lineNum}: Uses loose equality '=='. Prefer strict equality '===' to prevent type coercion bugs.`,
        });
      }
      if (/console\.log\(/.test(line)) {
        findings.push({
          type: 'info',
          message: `Line ${lineNum}: Contains 'console.log()' debug statement.`,
        });
      }
      if (/\bany\b/.test(line)) {
        findings.push({
          type: 'warning',
          message: `Line ${lineNum}: Uses explicit 'any' type; consider a specific interface.`,
        });
      }
    });

    if (/\bawait\s+fetch\(/.test(codeInput) && !/\btry\s*\{/.test(codeInput)) {
      findings.push({
        type: 'warning',
        message: `Async network call detected without a 'try / catch' error boundary or non-200 fallback return.`,
      });
    }

    return {
      lineCount: lines.length,
      charCount: codeInput.length,
      findings,
    };
  }, [codeInput]);

  const handleRunCodingAi = async () => {
    if (!codeInput.trim()) return;
    setIsLoading(true);
    try {
      const actionText =
        codeMode === 'explain'
          ? `Explain this ${codeLang} code line-by-line:`
          : codeMode === 'debug'
            ? `Debug this ${codeLang} code, identify potential bugs or edge cases, and provide a corrected version:`
            : `Refactor and optimize this ${codeLang} code for production readability and safety:`;

      const res = await runSmartToolPrompt({
        prompt: `${actionText}\n\n\`\`\`${codeLang.toLowerCase()}\n${codeInput}\n\`\`\``,
        language: preferredLanguage,
        category: 'coding',
      });
      setAiOutput(res.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="pb-4 border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-violet-400" />
            Developer Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
            Coding AI &mdash; Explain, Debug &amp; Refactor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Combine instant static code diagnostics with multilingual AI code explanations and bug fixes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Code Editor Panel */}
          <div className="lg:col-span-6 rounded-2xl bg-obsidian-900/95 border border-white/10 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <select
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="bg-obsidian-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
              >
                {['TypeScript', 'JavaScript', 'Python', 'SQL', 'C++', 'HTML/CSS'].map(
                  (l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  )
                )}
              </select>

              <div className="flex gap-1.5">
                {[
                  { id: 'debug', label: 'Debug Issues' },
                  { id: 'explain', label: 'Explain Code' },
                  { id: 'optimize', label: 'Refactor' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCodeMode(m.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      codeMode === m.id
                        ? 'bg-violet-600 text-white'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={10}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              spellCheck={false}
              className="w-full rounded-xl bg-obsidian-950 border border-white/10 p-4 font-mono text-xs text-cyan-200 focus:outline-none focus:border-violet-500 leading-relaxed"
            />

            <button
              type="button"
              disabled={isLoading || !codeInput.trim()}
              onClick={handleRunCodingAi}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-glow-violet transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Code...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Coding Assistant</span>
                </>
              )}
            </button>
          </div>

          {/* Static Inspector + AI Output */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Instant Static Code Diagnostics ({staticDiagnostics.lineCount} lines)
                </h2>
                <span className="text-[10px] font-mono text-slate-400">
                  Deterministic Analyzer
                </span>
              </div>

              {staticDiagnostics.findings.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No common static anti-patterns detected in snippet.</span>
                </div>
              ) : (
                <ul className="space-y-2">
                  {staticDiagnostics.findings.map((f, i) => (
                    <li
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        f.type === 'warning'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{f.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {aiOutput && (
              <div className="rounded-2xl bg-obsidian-900/95 border border-violet-500/35 p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                  AI Code Analysis Output
                </h3>
                <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                  {aiOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ============================================================================
// 3. DOCUMENT ANALYSIS & PDF/IMAGE Q&A PAGE (/tools/documents)
// ============================================================================
export const DocumentAnalysisPage: React.FC = () => {
  const { preferredLanguage } = useAppContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedDoc, setExtractedDoc] =
    useState<ExtractedDocumentResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [docQuestion, setDocQuestion] = useState('');
  const [qaReply, setQaReply] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExtractFile = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setQaReply(null);
    setIsExtracting(true);
    try {
      const res = await extractDocumentForAnalysis(file, preferredLanguage);
      setExtractedDoc(res);
    } catch (err: any) {
      setError(err?.message || 'Unable to extract document text.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAskDocumentQuestion = async () => {
    if (!extractedDoc || !docQuestion.trim()) return;
    setIsAsking(true);
    try {
      const res = await runSmartToolPrompt({
        prompt: docQuestion,
        language: preferredLanguage,
        category: 'document',
        documentText: extractedDoc.rawText,
        documentName: extractedDoc.fileName,
      });
      setQaReply(res.content);
    } catch (err: any) {
      setError(err?.message || 'Failed to answer document question.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="pb-4 border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
            <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
            PDF, Image OCR &amp; Text Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
            Document Summarization &amp; Question-Answering
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload any PDF, scanned image (.png, .jpg), or text file to extract verbatim content, key sentences, and ask grounded questions.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 p-6 space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.md,.csv,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleExtractFile(f);
            }}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-violet-500/40 hover:border-cyan-400/60 bg-obsidian-950/60 p-8 text-center cursor-pointer transition-all space-y-2"
          >
            <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto" />
            <p className="text-sm font-bold text-white">
              {selectedFile
                ? `Selected: ${selectedFile.name} (Click to replace)`
                : 'Click to upload a PDF, PNG/JPG Image, or Text file (Max 10 MB)'}
            </p>
            <p className="text-xs text-slate-400">
              Uses Server PDF Text Parser + Tesseract.js Optical Character Recognition
            </p>
          </div>

          {isExtracting && (
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center gap-2.5 text-xs text-violet-200">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Extracting text &amp; analyzing document structure...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Extracted Document Results */}
        {extractedDoc && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Metrics, Extractive Key Points & Raw Text */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold text-white">
                      {extractedDoc.fileName}
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    {extractedDoc.extractionMethod} ({extractedDoc.confidence}%)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5">
                    <div className="text-lg font-bold text-white font-mono">
                      {extractedDoc.wordCount}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">Words</div>
                  </div>
                  <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5">
                    <div className="text-lg font-bold text-cyan-400 font-mono">
                      {extractedDoc.estimatedReadingMinutes} min
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">Read Time</div>
                  </div>
                  <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5">
                    <div className="text-lg font-bold text-violet-400 font-mono">
                      {extractedDoc.detectedBiomarkerCount}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">Lab Markers</div>
                  </div>
                </div>

                {extractedDoc.extractiveKeyPoints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Key Extracted Lines (Verbatim)
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {extractedDoc.extractiveKeyPoints.map((pt, i) => (
                        <li
                          key={i}
                          className="p-2.5 rounded-xl bg-obsidian-950/80 border border-white/5"
                        >
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Full Extracted Document Text
                  </h3>
                  <pre className="p-3.5 rounded-xl bg-obsidian-950 border border-white/10 text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {extractedDoc.rawText}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right: Document Q&A and AI Summary */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 p-5 space-y-3">
                <h2 className="text-sm font-bold text-white">
                  Ask a Question About This Document
                </h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={docQuestion}
                    onChange={(e) => setDocQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAskDocumentQuestion();
                      }
                    }}
                    placeholder="Ask anything grounded in this uploaded file..."
                    className="flex-1 bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                  <button
                    type="button"
                    disabled={isAsking || !docQuestion.trim()}
                    onClick={handleAskDocumentQuestion}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    {isAsking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Ask</span>
                  </button>
                </div>

                {qaReply && (
                  <div className="p-4 rounded-xl bg-obsidian-950 border border-violet-500/30 text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {qaReply}
                  </div>
                )}
              </div>

              {extractedDoc.aiSummary ? (
                <div className="rounded-2xl bg-obsidian-900/95 border border-violet-500/35 p-5 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                    Live AI Document Summary ({extractedDoc.aiProvider})
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {extractedDoc.aiSummary}
                  </div>
                </div>
              ) : (
                extractedDoc.fallbackNotice && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                    {extractedDoc.fallbackNotice}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// ============================================================================
// 4. TRANSLATION STUDIO PAGE (/tools/translate)
// ============================================================================
const CLINICAL_TERM_DICTIONARY: {
  term: string;
  hi: string;
  hinglish: string;
  gu: string;
  ur: string;
}[] = [
  {
    term: 'Hemoglobin',
    hi: 'हीमोग्लोबिन (रक्त में ऑक्सीजन ले जाने वाला प्रोटीन)',
    hinglish: 'Hemoglobin (Khoon mein oxygen carry karne wala protein)',
    gu: 'હિમોગ્લોબિન (લોહીમાં ઓક્સિજન પહોંચાડતું પ્રોટીન)',
    ur: 'ہیموگلوبن (خون میں آکسیجن پہنچانے والا پروٹین)',
  },
  {
    term: 'Fasting Blood Glucose',
    hi: 'फास्टिंग ब्लड शुगर (खाली पेट रक्त शर्करा की जांच)',
    hinglish: 'Fasting Blood Sugar (Khali pet blood sugar test)',
    gu: 'ફાસ્ટિંગ બ્લડ સુગર (ખાલી પેટે લોહીમાં શર્કરાની તપાસ)',
    ur: 'فاسٹنگ بلڈ شوگر (خالی پیٹ خون میں شوگر کا ٹیسٹ)',
  },
  {
    term: 'HbA1c',
    hi: 'एचबीए1सी (पिछले 2-3 महीनों का औसत ब्लड शुगर स्तर)',
    hinglish: 'HbA1c (Pichle 2-3 mahino ka average blood sugar level)',
    gu: 'HbA1c (છેલ્લા 2-3 મહિનાનું સરેરાશ બ્લડ સુગર સ્તર)',
    ur: 'ایچ بی اے ون سی (پچھلے 2 سے 3 مہینوں کی اوسط بلڈ شوگر)',
  },
  {
    term: 'Cholesterol / Lipid Profile',
    hi: 'लिपिड प्रोफाइल / कोलेस्ट्रॉल (रक्त में वसा की जांच)',
    hinglish: 'Lipid Profile / Cholesterol (Khoon mein fat aur cholesterol ki jaanch)',
    gu: 'લિપિડ પ્રોફાઇલ / કોલેસ્ટ્રોલ (લોહીમાં ચરબીનું પ્રમાણ)',
    ur: 'لپڈ پروفائل / کولیسٹرول (خون میں چکنائی کا ٹیسٹ)',
  },
  {
    term: 'TSH (Thyroid)',
    hi: 'टीएसएच (थायरॉइड ग्रंथि के हार्मोन संतुलन की जांच)',
    hinglish: 'TSH (Thyroid gland ke hormone balance ki jaanch)',
    gu: 'TSH (થાઇરોઇડ ગ્રંથિના હોર્મોન સંતુલનની તપાસ)',
    ur: 'ٹی ایس ایچ (تھائیرائیڈ غدود کے ہارمون کا ٹیسٹ)',
  },
  {
    term: 'Creatinine',
    hi: 'सीरम क्रिएटिनिन (गुर्दे / किडनी की छानने की क्षमता की जांच)',
    hinglish: 'Serum Creatinine (Kidney filtration capacity ki jaanch)',
    gu: 'સીરમ ક્રિએટિનિન (કિડનીની ગાળણ ક્ષમતાની તપાસ)',
    ur: 'سیرم کریٹینن (گردوں کی کارکردگی کا ٹیسٹ)',
  },
];

export const TranslationStudioPage: React.FC = () => {
  const { preferredLanguage } = useAppContext();
  const [targetLang, setTargetLang] = useState<SupportedLanguage>(
    preferredLanguage === 'en' ? 'hi' : preferredLanguage
  );
  const [sourceText, setSourceText] = useState(
    'Your Fasting Blood Glucose and HbA1c are slightly above the printed reference range, while your Hemoglobin and Creatinine are within normal limits. Please discuss dietary adjustments with your doctor.'
  );
  const [translatedOutput, setTranslatedOutput] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const matchedGlossaryTerms = useMemo(() => {
    const lower = sourceText.toLowerCase();
    return CLINICAL_TERM_DICTIONARY.filter((item) =>
      lower.includes(item.term.toLowerCase().split(' ')[0])
    );
  }, [sourceText]);

  const handleRunTranslation = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    try {
      const targetMeta =
        SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) ||
        SUPPORTED_LANGUAGES[0];
      const res = await runSmartToolPrompt({
        prompt: `Translate the following text accurately into ${targetMeta.name} (${targetMeta.nativeName}), preserving clinical and technical clarity:\n\n"${sourceText}"`,
        language: targetLang,
        category: 'translation',
      });
      setTranslatedOutput(res.content);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="pb-4 border-b border-white/10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            Multilingual Communication
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
            Translation Studio &mdash; Hindi, Hinglish, Gujarati, Urdu &amp; English
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Translate medical instructions, document excerpts, and everyday text with instant clinical terminology matching.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 rounded-2xl bg-obsidian-900/95 border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Source Text:</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Translate to:</span>
                <select
                  value={targetLang}
                  onChange={(e) =>
                    setTargetLang(e.target.value as SupportedLanguage)
                  }
                  className="bg-obsidian-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-semibold text-cyan-300"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              rows={6}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full rounded-xl bg-obsidian-950 border border-white/10 p-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 leading-relaxed"
            />

            <button
              type="button"
              disabled={isTranslating || !sourceText.trim()}
              onClick={handleRunTranslation}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-glow-violet transition-all flex items-center justify-center gap-2"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>Translate Text</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {/* Deterministic Clinical Terminology Matches */}
            <div className="rounded-2xl bg-obsidian-900/95 border border-white/10 p-5 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Detected Medical Terminology Translations
              </h2>
              {matchedGlossaryTerms.length === 0 ? (
                <p className="text-xs text-slate-400">
                  Include medical terms like Hemoglobin, HbA1c, Fasting Glucose, Cholesterol, TSH, or Creatinine to see instant verified translations.
                </p>
              ) : (
                <div className="space-y-2">
                  {matchedGlossaryTerms.map((item) => (
                    <div
                      key={item.term}
                      className="p-3 rounded-xl bg-obsidian-950 border border-white/10 space-y-1 text-xs"
                    >
                      <div className="font-bold text-white">{item.term}</div>
                      <div className="text-slate-300">
                        <span className="text-violet-400 font-semibold">Hindi: </span>
                        {item.hi}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-cyan-400 font-semibold">Hinglish: </span>
                        {item.hinglish}
                      </div>
                      <div className="text-slate-300">
                        <span className="text-emerald-400 font-semibold">Gujarati: </span>
                        {item.gu}
                      </div>
                      <div className="text-slate-300" dir="rtl">
                        <span className="text-amber-400 font-semibold">Urdu: </span>
                        {item.ur}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {translatedOutput && (
              <div className="rounded-2xl bg-obsidian-900/95 border border-violet-500/35 p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300">
                  Translation Result
                </h3>
                <div
                  dir={targetLang === 'ur' ? 'rtl' : 'ltr'}
                  className="text-xs sm:text-sm text-slate-100 whitespace-pre-line leading-relaxed"
                >
                  {translatedOutput}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
