export type SupportedLanguage = 'en' | 'hi' | 'hinglish' | 'gu' | 'ur';

export type MedicalLanguage = 'en' | 'hi' | 'gu' | 'ur';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
  direction: 'ltr' | 'rtl';
  speechLang: string;
  regionNote: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    direction: 'ltr',
    speechLang: 'en-US',
    regionNote: 'International Plain English',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    direction: 'ltr',
    speechLang: 'hi-IN',
    regionNote: 'सरल हिन्दी व्याख्या',
  },
  {
    code: 'hinglish',
    name: 'Hinglish',
    nativeName: 'Hinglish',
    script: 'Conversational Latin-Hindi',
    direction: 'ltr',
    speechLang: 'en-IN',
    regionNote: 'Conversational Hindi in English script',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    direction: 'ltr',
    speechLang: 'gu-IN',
    regionNote: 'સરળ ગુજરાતી સમજૂતી',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'Nastaliq / Arabic',
    direction: 'rtl',
    speechLang: 'ur-PK',
    regionNote: 'آسان اردو وضاحت',
  },
];

export const MEDICAL_REPORT_LANGUAGES: LanguageOption[] = SUPPORTED_LANGUAGES.filter(
  (l) => l.code === 'en' || l.code === 'hi' || l.code === 'gu' || l.code === 'ur'
);

export type BiomarkerStatus =
  | 'normal'
  | 'low'
  | 'high'
  | 'critical_low'
  | 'critical_high'
  | 'range_not_provided';

export interface BiomarkerLanguageExplanation {
  whatItMeasures: string;
  whatResultMeans: string;
  educationalNote: string;
  sourceType: 'live_ai' | 'clinical_glossary';
}

export interface ExtractedBiomarker {
  id: string;
  testName: string;
  canonicalCode: string | null;
  category: string;
  measuredValueRaw: string;
  measuredValueNumeric: number | null;
  unit: string | null;
  referenceRangeRaw: string | null;
  referenceMin: number | null;
  referenceMax: number | null;
  status: BiomarkerStatus;
  deviationPercent: number | null;
  rawSourceLine: string;
  explanation: Record<MedicalLanguage, BiomarkerLanguageExplanation>;
}

export interface UrgentCareFlaggedTest {
  testName: string;
  value: string;
  unit: string | null;
  reason: Record<MedicalLanguage, string>;
}

export interface UrgentCareAlert {
  triggered: boolean;
  severity: 'none' | 'moderate' | 'urgent';
  flaggedTests: UrgentCareFlaggedTest[];
  guidance: Record<MedicalLanguage, string>;
}

export interface LanguageSummary {
  overview: string;
  keyFindings: string[];
  doctorQuestions: string[];
  lifestyleEducation: string[];
}

export interface AiGenerationMeta {
  aiConfigured: boolean;
  provider: string;
  model: string | null;
  generatedByLiveAi: boolean;
  fallbackReason?: string;
}

export interface ReportAnalysis {
  id: string;
  sessionId: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'sample_pdf';
  fileSizeBytes: number;
  uploadedAt: string;
  isSyntheticSample: boolean;
  consentSaved: boolean;
  consentTimestamp: string | null;
  extractionMethod: 'pdf_text' | 'tesseract_ocr' | 'hybrid_pdf_ocr';
  extractionConfidence: number;
  rawExtractedText: string;
  labMetadata: {
    labName: string | null;
    reportDate: string | null;
    specimenType: string | null;
  };
  biomarkers: ExtractedBiomarker[];
  stats: {
    totalTests: number;
    normalCount: number;
    outOfRangeCount: number;
    criticalCount: number;
    rangeNotProvidedCount: number;
  };
  urgentCare: UrgentCareAlert;
  aiGenerationMeta: AiGenerationMeta;
  summaries: Record<MedicalLanguage, LanguageSummary>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: SupportedLanguage;
  timestamp: string;
  sourceMode: 'live_ai' | 'clinical_guardrail' | 'ai_unconfigured_notice';
  safetyFlagged?: boolean;
  attachment?: ChatAttachmentMeta | null;
}

export type AssistantCategory =
  | 'general'
  | 'medical_report'
  | 'study'
  | 'coding'
  | 'document'
  | 'translation';

export interface ChatAttachmentMeta {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  extractionMethod: string;
  extractedPreview: string;
  detectedBiomarkerCount?: number;
}

export interface ConversationThread {
  id: string;
  sessionId: string;
  title: string;
  category: AssistantCategory;
  language: SupportedLanguage;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  documentContext?: {
    fileName: string;
    extractedText: string;
    extractionMethod: string;
    wordCount: number;
  } | null;
}

export interface ExtractedDocumentResult {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  detectedFormat: string;
  extractionMethod: string;
  confidence: number;
  rawText: string;
  wordCount: number;
  charCount: number;
  estimatedReadingMinutes: number;
  extractiveKeyPoints: string[];
  detectedBiomarkerCount: number;
  aiSummary: string | null;
  aiConfigured: boolean;
  aiProvider: string;
  fallbackNotice?: string;
}

export interface SystemAiStatus {
  aiConfigured: boolean;
  activeProvider: string;
  activeModel: string | null;
  supportedLanguages: SupportedLanguage[];
  maxUploadBytes: number;
  ocrEngine: string;
  pdfEngine: string;
  privacyMode: string;
}
