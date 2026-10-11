import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileSearch,
  FileText,
  Globe2,
  HelpCircle,
  Languages,
  Lock,
  MessageSquareText,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UploadCloud,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { analyzeSamplePreset } from '../services/api';
import {
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../types/report';

interface HeroPreviewMarker {
  name: string;
  category: string;
  value: string;
  unit: string;
  refRange: string;
  status: 'normal' | 'high' | 'low' | 'range_not_provided';
  explanations: Record<SupportedLanguage, string>;
}

const HERO_PREVIEW_MARKERS: HeroPreviewMarker[] = [
  {
    name: 'Glycated Hemoglobin (HbA1c)',
    category: 'Glycemic Control',
    value: '6.3',
    unit: '%',
    refRange: '4.0 – 5.6',
    status: 'high',
    explanations: {
      en: 'Above the printed laboratory reference range (4.0–5.6%). HbA1c reflects average blood sugar over the past 8–12 weeks. Discuss dietary and lifestyle targets with your physician.',
      hi: 'लैब की संदर्भ सीमा (4.0–5.6%) से अधिक। HbA1c पिछले 8–12 हफ्तों के औसत ब्लड शुगर को दर्शाता है। आहार और जीवनशैली पर अपने डॉक्टर से चर्चा करें।',
      hinglish:
        'Lab ki reference range (4.0–5.6%) se upar hai. HbA1c pichle 8–12 weeks ke average blood sugar ko dikhata hai. Diet aur lifestyle targets ke liye apne doctor se salah lein.',
      gu: 'લેબની સંદર્ભ રેન્જ (4.0–5.6%) કરતાં વધુ. HbA1c છેલ્લા 8–12 અઠવાડિયાના સરેરાશ બ્લડ સુગરને દર્શાવે છે. ખોરાક અને જીવનશૈલી અંગે ડૉક્ટરની સલાહ લો.',
      ur: 'لیبارٹری ریفرنس رینج (4.0–5.6%) سے زیادہ۔ HbA1c پچھلے 8 سے 12 ہفتوں کی اوسط بلڈ شوگر کو ظاہر کرتا ہے۔ خوراک اور طرزِ زندگی کے حوالے سے اپنے ڈاکٹر سے مشورہ کریں۔',
    },
  },
  {
    name: 'Hemoglobin (Hb)',
    category: 'Complete Blood Count',
    value: '13.8',
    unit: 'g/dL',
    refRange: '13.0 – 17.0',
    status: 'normal',
    explanations: {
      en: 'Within the laboratory reference range (13.0–17.0 g/dL). Indicates healthy oxygen-carrying red blood cell protein levels.',
      hi: 'लैब संदर्भ सीमा (13.0–17.0 g/dL) के भीतर है। यह शरीर में ऑक्सीजन ले जाने वाले हीमोग्लोबिन के सामान्य स्तर को दर्शाता है।',
      hinglish:
        'Lab reference range (13.0–17.0 g/dL) ke andar hai. Yeh body mein oxygen carry karne wale hemoglobin ke normal level ko darshata hai.',
      gu: 'લેબ સંદર્ભ રેન્જ (13.0–17.0 g/dL) ની અંદર છે. તે શરીરમાં ઓક્સિજન પહોંચાડતા હિમોગ્લોબિનનું સામાન્ય પ્રમાણ દર્શાવે છે.',
      ur: 'لیبارٹری ریفرنس رینج (13.0–17.0 g/dL) کے اندر ہے۔ یہ جسم میں آکسیجن پہنچانے والے ہیموگلوبن کی نارمل سطح کو ظاہر کرتا ہے۔',
    },
  },
  {
    name: 'Vitamin D (25-Hydroxy)',
    category: 'Nutritional Markers',
    value: '18.4',
    unit: 'ng/mL',
    refRange: '30.0 – 100.0',
    status: 'low',
    explanations: {
      en: 'Below the sufficiency interval (30.0–100.0 ng/mL). Vitamin D supports calcium absorption and bone health; ask your clinician about appropriate repletion.',
      hi: 'संदर्भ सीमा (30.0–100.0 ng/mL) से कम। विटामिन D हड्डियों की मजबूती और कैल्शियम अवशोषण में मदद करता है; इसके लिए डॉक्टर से परामर्श करें।',
      hinglish:
        'Reference range (30.0–100.0 ng/mL) se kam hai. Vitamin D bones ki strength aur calcium absorption mein madad karta hai; apne clinician se consult karein.',
      gu: 'સંદર્ભ રેન્જ (30.0–100.0 ng/mL) કરતાં ઓછું. વિટામિન D હાડકાંની મજબૂતી અને કેલ્શિયમના શોષણ માટે જરૂરી છે; ડૉક્ટરની સલાહ લો.',
      ur: 'ریفرنس رینج (30.0–100.0 ng/mL) سے کم۔ وٹامن ڈی ہڈیوں کی مضبوطی اور کیلشیم کے جذب ہونے میں مدد دیتا ہے؛ اپنے ڈاکٹر سے مشورہ کریں۔',
    },
  },
];

const FAQ_ITEMS = [
  {
    question: 'Does CareMatric AI diagnose medical conditions or prescribe medications?',
    answer:
      'No. CareMatric AI is strictly a health-literacy, laboratory education, and multifunctional AI assistant platform. Its Medical Report Analyzer extracts the test parameters and reference ranges printed on your report and explains what each test measures in plain language. It never diagnoses diseases, never prescribes medications, and never recommends changing medication dosages.',
  },
  {
    question: 'How does CareMatric AI prevent hallucinated numbers or fake reference ranges?',
    answer:
      'Every uploaded medical document first passes through a deterministic extraction and verification layer before any AI explanation is generated. Measured values, units, and reference ranges are parsed directly from the report text. If a laboratory report does not print a reference range for a parameter, CareMatric AI explicitly displays "Not specified on report" rather than guessing or inventing a range.',
  },
  {
    question: 'Which languages are supported across the AI Assistant and Medical Analyzer?',
    answer:
      'CareMatric AI supports Hindi (हिन्दी), Hinglish, English, Gujarati (ગુજરાતી), and Urdu (اردو — including full right-to-left typography layout). You can switch languages dynamically at any time.',
  },
  {
    question: 'What Smart Tools are included alongside the Medical Report Analyzer?',
    answer:
      'In addition to the dedicated Medical Report Analyzer, CareMatric AI includes an interactive AI Chatbot with document/image attachments, Study AI (notes, explanations, and interactive quizzes), Coding AI (code diagnostics, explanations, and debugging), Document Analysis (OCR & PDF Q&A), and Translation Studio.',
  },
  {
    question: 'Are my uploaded laboratory reports saved automatically?',
    answer:
      'No. Following strict data-minimization principles, CareMatric AI processes medical reports in ephemeral session memory by default. A report is saved to your isolated Report History only if you explicitly grant informed consent, and you can delete individual reports or purge your entire history at any time with a single click.',
  },
  {
    question: 'Where are AI API keys stored, and what happens if no AI key is configured?',
    answer:
      'API keys (such as GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY) are kept exclusively on the backend server in environment variables and are never exposed to the browser. If no AI API key is configured on the server, CareMatric AI transparently notifies you and never fakes LLM responses.',
  },
];

export const LandingPage: React.FC = () => {
  const { preferredLanguage, setPreferredLanguage, setActiveReport } =
    useAppContext();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [loadingSample, setLoadingSample] = useState(false);
  const navigate = useNavigate();

  const isRtl = preferredLanguage === 'ur';

  const handleOpenLiveSample = async () => {
    setLoadingSample(true);
    try {
      const report = await analyzeSamplePreset(
        'comprehensive-metabolic',
        preferredLanguage,
        false
      );
      setActiveReport(report);
      navigate(`/dashboard/analysis/${report.id}`);
    } catch {
      navigate('/medical');
    } finally {
      setLoadingSample(false);
    }
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-white/[0.08] overflow-hidden bg-ai-mesh">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Headline & CTAs */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Multifunctional AI Platform &bull; Clinical Lab Literacy</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.14]">
                  Understand Your Health Reports.{' '}
                  <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                    In Your Language.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                  CareMatric AI pairs deterministic medical laboratory report analysis with a multifunctional AI assistant for study, coding, document OCR, and translation across{' '}
                  <strong className="font-semibold text-white">
                    English, Hindi, Hinglish, Gujarati, and Urdu
                  </strong>
                  .
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                  <Link
                    to="/medical"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-glow-violet transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Analyze My Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/15 text-sm font-semibold transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span>Open AI Assistant Home</span>
                  </Link>

                  <button
                    type="button"
                    onClick={scrollToFeatures}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-slate-300 hover:text-white text-sm font-semibold transition-all"
                  >
                    <span>Explore Features</span>
                  </button>
                </div>

                {/* Trust Highlights */}
                <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/[0.08] text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Verbatim Facts</div>
                      <div className="text-[11px] text-slate-400">Zero invented ranges</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Languages className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">5 Languages</div>
                      <div className="text-[11px] text-slate-400">HI &bull; Hinglish &bull; EN &bull; GU &bull; UR</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Consent-First</div>
                      <div className="text-[11px] text-slate-400">Ephemeral by default</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Product Preview Card */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl bg-obsidian-900/95 border border-white/[0.1] shadow-clinical-lg overflow-hidden">
                  {/* Preview Top Bar */}
                  <div className="px-5 py-3.5 bg-obsidian-950 text-white border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span className="text-xs font-semibold tracking-wide">
                        Interactive Sample Report Preview
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 font-mono">
                        SYNTHETIC DEMO
                      </span>
                    </div>

                    {/* Interactive Language Switcher inside Hero Preview */}
                    <div className="flex items-center gap-1 bg-obsidian-900 p-1 rounded-lg border border-white/10">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setPreferredLanguage(lang.code)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                            preferredLanguage === lang.code
                              ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lang.nativeName}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Legend: Fact vs Explanation */}
                  <div className="px-5 py-2.5 bg-obsidian-950/50 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-300">
                        <span className="w-2 h-2 rounded-xs bg-slate-400" />
                        Extracted Lab Fact (Verbatim)
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-cyan-300">
                        <span className="w-2 h-2 rounded-xs bg-cyan-400" />
                        Educational Explanation ({preferredLanguage.toUpperCase()})
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono">3 of 13 markers shown</span>
                  </div>

                  {/* Biomarker Rows */}
                  <div className="divide-y divide-white/[0.06]">
                    {HERO_PREVIEW_MARKERS.map((marker) => (
                      <div key={marker.name} className="p-4 sm:p-5 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{marker.name}</span>
                              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-white/[0.06] text-slate-300">
                                {marker.category}
                              </span>
                            </div>
                          </div>

                          {/* Extracted Facts Pill */}
                          <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 rounded-md bg-obsidian-950 border border-white/10 text-xs font-mono text-white">
                              <span className="font-bold">{marker.value}</span>{' '}
                              <span className="text-slate-400">{marker.unit}</span>
                              <span className="mx-1.5 text-slate-600">|</span>
                              <span className="text-[11px] text-slate-300">
                                Ref: {marker.refRange}
                              </span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                marker.status === 'normal'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : marker.status === 'high'
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                              }`}
                            >
                              {marker.status === 'normal'
                                ? 'Within Range'
                                : marker.status === 'high'
                                  ? 'Above Range'
                                  : 'Below Range'}
                            </span>
                          </div>
                        </div>

                        {/* Plain-Language Multilingual Explanation Box */}
                        <div
                          dir={isRtl ? 'rtl' : 'ltr'}
                          className={`p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-slate-200 leading-relaxed lang-${preferredLanguage}`}
                        >
                          {marker.explanations[preferredLanguage] ||
                            marker.explanations.en}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Preview Footer Action */}
                  <div className="px-5 py-3.5 bg-obsidian-950/80 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      Includes Doctor Discussion Questions &amp; Contextual Report Q&amp;A
                    </span>
                    <button
                      type="button"
                      disabled={loadingSample}
                      onClick={handleOpenLiveSample}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-semibold transition-all disabled:opacity-60"
                    >
                      <span>
                        {loadingSample
                          ? 'Loading Sample Analysis...'
                          : 'Open Full 13-Marker Sample in Analyzer'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-16 sm:py-24 bg-obsidian-950 border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Clinical Verification Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                How CareMatric AI Analyzes Your Report
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                A deterministic, safety-first pipeline that separates raw laboratory facts from plain-language medical education.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-obsidian-900/90 border border-white/[0.08] shadow-clinical space-y-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-sm">
                  01
                </div>
                <h3 className="text-base font-bold text-white">
                  Upload PDF or Scanned Report Image
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Select or drag-and-drop your laboratory report in PDF, PNG, or JPG format (up to 10 MB). Files are verified using binary magic-byte inspection and processed via PDF text extraction or Tesseract OCR.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-obsidian-900/90 border border-white/[0.08] shadow-clinical space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-sm">
                  02
                </div>
                <h3 className="text-base font-bold text-white">
                  Deterministic Fact &amp; Range Verification
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Our parser identifies test names, measured values, units, and the exact reference intervals printed on your report. Missing reference ranges are explicitly marked as not provided—never fabricated.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-obsidian-900/90 border border-white/[0.08] shadow-clinical space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-sm">
                  03
                </div>
                <h3 className="text-base font-bold text-white">
                  Multilingual Explanation &amp; Doctor Guide
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Read clear, non-diagnostic explanations in English, Hindi, Gujarati, or Urdu, review tailored questions for your physician appointment, and ask follow-up questions in the contextual report chat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. KEY FEATURES SECTION */}
        <section id="features" className="py-16 sm:py-24 bg-obsidian-900/50 border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-3 mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                Engineered for Clinical Trust &amp; Multifunctional Productivity
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Key Capabilities Across CareMatric AI
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                Designed from the ground up to eliminate medical jargon while offering dedicated AI workspaces for study, code, documents, and translation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Scale,
                  title: 'Fact vs. Explanation Separation',
                  desc: 'Every biomarker row visually separates verbatim numbers extracted from your lab sheet from educational AI explanations, with a raw source-line inspector.',
                },
                {
                  icon: FileSearch,
                  title: 'Zero-Hallucination Range Check',
                  desc: 'Compares your measured value strictly against the laboratory reference range printed on your report. Never invents missing values, units, or reference intervals.',
                },
                {
                  icon: Globe2,
                  title: '5-Language Native Clarity',
                  desc: 'Switch effortlessly between English, Hindi (हिन्दी), Hinglish, Gujarati (ગુજરાતી), and Urdu (اردو with native right-to-left formatting) at any point.',
                },
                {
                  icon: BookOpen,
                  title: 'Study AI & Interactive Quizzes',
                  desc: 'Generate structured revision notes, step-by-step concept breakdowns, and interactive self-assessment quizzes on any academic or science topic.',
                },
                {
                  icon: Code2,
                  title: 'Coding AI & Static Diagnostics',
                  desc: 'Inspect source code with deterministic static diagnostics alongside line-by-line explanations, bug root-cause analysis, and clean refactoring.',
                },
                {
                  icon: FileText,
                  title: 'Document OCR & Translation Studio',
                  desc: 'Extract text from PDFs and scanned images via OCR, summarize key findings, and translate documents across supported languages.',
                },
              ].map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-6 rounded-2xl bg-obsidian-900/90 border border-white/[0.08] hover:border-violet-500/40 shadow-clinical transition-all space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-cyan-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. SUPPORTED LANGUAGES SECTION */}
        <section id="languages" className="py-16 sm:py-24 bg-obsidian-950 border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Multilingual Accessibility
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Complex Terminology Explained in Your Preferred Language
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                CareMatric AI bridges the comprehension gap for patients, students, and developers across Hindi, Hinglish, English, Gujarati, and Urdu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const sampleExplanation =
                  HERO_PREVIEW_MARKERS[0].explanations[lang.code] ||
                  HERO_PREVIEW_MARKERS[0].explanations.en;
                const isSelected = preferredLanguage === lang.code;
                return (
                  <div
                    key={lang.code}
                    onClick={() => setPreferredLanguage(lang.code)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/15 border-violet-500/50 shadow-glow-violet'
                        : 'bg-obsidian-900/80 border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-obsidian-950 border border-white/10 text-cyan-300 text-xs font-bold">
                          {lang.nativeName}
                        </span>
                        <span className="text-sm font-bold text-white">
                          {lang.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p
                      dir={lang.direction}
                      className={`text-xs text-slate-300 bg-obsidian-950/90 p-3.5 rounded-xl border border-white/[0.06] lang-${lang.code}`}
                    >
                      {sampleExplanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. PRIVACY & DATA MINIMIZATION SECTION */}
        <section id="privacy" className="py-16 sm:py-24 bg-obsidian-900/60 border-b border-white/[0.08] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy &amp; Data Minimization Architecture</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Your Health Data Belongs Exclusively to You.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Health reports contain sensitive personal information. CareMatric AI is engineered with strict session isolation, ephemeral default processing, and informed user consent before any report is stored.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    to="/privacy"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold transition-all"
                  >
                    <span>Read Privacy Architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/dashboard/history"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 border border-white/10 text-xs font-semibold transition-all"
                  >
                    <span>Manage Saved History</span>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/[0.08] space-y-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    Consent-Gated Storage
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Reports are analyzed in ephemeral memory by default and are only saved to your Report History if you explicitly opt in via Informed Consent.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/[0.08] space-y-2">
                  <Activity className="w-5 h-5 text-violet-400" />
                  <h3 className="text-sm font-bold text-white">
                    PII Strip Before AI Enrichment
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Only structured biomarker names, values, units, and reference ranges are passed to the server AI—never patient names, addresses, or phone numbers.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/[0.08] space-y-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    Strict Session Isolation
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Every client receives an isolated cryptographic session token. One user can never view, list, or access another user&apos;s uploaded reports.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-obsidian-900 border border-white/[0.08] space-y-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Instant Right-to-Erasure
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Delete any individual report or purge your entire saved report history and rotate your session identifier immediately from the dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQS SECTION */}
        <section id="faqs" className="py-16 sm:py-24 bg-obsidian-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 inline-flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Common Questions About CareMatric AI
              </h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={item.question}
                    className="rounded-2xl border border-white/[0.08] bg-obsidian-900/90 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-bold text-white">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-cyan-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.06]">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA Card */}
            <div className="mt-14 p-8 rounded-2xl bg-gradient-to-br from-violet-950/60 via-obsidian-900 to-cyan-950/40 border border-violet-500/30 text-center space-y-4">
              <h3 className="text-xl font-bold text-white">
                Ready to Explore CareMatric AI?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                Start a conversation in the AI Assistant Hub or upload a laboratory report in the Medical Report Analyzer.
              </p>
              <div className="pt-1 flex flex-wrap justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-glow-violet transition-all"
                >
                  <MessageSquareText className="w-4 h-4" />
                  <span>Open AI Assistant</span>
                </Link>
                <Link
                  to="/medical"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-sm font-semibold transition-all"
                >
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  <span>Analyze Medical Report</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
