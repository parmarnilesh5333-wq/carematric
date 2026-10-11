import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import {
  AssistantCategory,
  ChatAttachmentMeta,
  ChatMessage,
  ExtractedDocumentResult,
  MedicalLanguage,
  ReportAnalysis,
  SupportedLanguage,
  SystemAiStatus,
} from '../src/types/report';
import {
  answerContextualReportQuestion,
  enrichReportWithLiveAi,
  generateAssistantChatResponse,
  getActiveAiConfig,
} from './services/aiService';
import {
  clearConversationMessages,
  createConversationForSession,
  deleteConversationForSession,
  getConversationForSession,
  listConversationsForSession,
  saveConversationForSession,
} from './services/conversationStore';
import {
  extractTextFromAnyAttachment,
  extractTextFromDocument,
  validateFileMagicBytes,
} from './services/documentExtractor';
import {
  deleteReportForSession,
  getReportForSession,
  grantConsentForReport,
  listConsentedReportsForSession,
  purgeAllReportsForSession,
  storeAnalyzedReport,
  updateReportInStore,
} from './services/historyStore';
import {
  buildBaselineSummaries,
  buildUrgentCareAlert,
  extractLabMetadata,
  parseBiomarkersFromText,
} from './services/reportParser';
import {
  generateSamplePdfBuffer,
  SAMPLE_REPORT_PRESETS,
} from './services/sampleReports';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB) || 10;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
});

function getSessionId(req: Request): string {
  const headerToken = req.header('x-carematric-session')?.trim();
  if (headerToken && /^[a-zA-Z0-9_-]{12,128}$/.test(headerToken)) {
    return headerToken;
  }
  return 'anonymous-ephemeral-session';
}

function normalizeLanguage(lang: unknown): SupportedLanguage {
  if (
    lang === 'hi' ||
    lang === 'hinglish' ||
    lang === 'gu' ||
    lang === 'ur' ||
    lang === 'en'
  ) {
    return lang;
  }
  return 'en';
}

function normalizeMedicalLanguage(lang: unknown): MedicalLanguage {
  if (lang === 'hi' || lang === 'gu' || lang === 'ur' || lang === 'en') {
    return lang;
  }
  return 'en';
}

function normalizeCategory(cat: unknown): AssistantCategory {
  if (
    cat === 'general' ||
    cat === 'medical_report' ||
    cat === 'study' ||
    cat === 'coding' ||
    cat === 'document' ||
    cat === 'translation'
  ) {
    return cat;
  }
  return 'general';
}

// 1. System & AI Configuration Status
app.get('/api/system/ai-status', (_req: Request, res: Response) => {
  const aiConfig = getActiveAiConfig();
  const status: SystemAiStatus = {
    aiConfigured: aiConfig.configured,
    activeProvider: aiConfig.provider,
    activeModel: aiConfig.model,
    supportedLanguages: ['en', 'hi', 'hinglish', 'gu', 'ur'],
    maxUploadBytes: MAX_UPLOAD_BYTES,
    ocrEngine: 'Tesseract.js v6 (Local Server OCR)',
    pdfEngine: 'pdf-parse + Native PDF Stream Extractor',
    privacyMode: 'Consent-Gated Session Isolation (Ephemeral Default)',
  };
  res.json(status);
});

app.get('/api/health', (_req: Request, res: Response) => {
  const aiConfig = getActiveAiConfig();
  res.json({
    status: 'ok',
    ai: {
      liveAiConfigured: aiConfig.configured,
      provider: aiConfig.provider,
      model: aiConfig.model,
    },
  });
});

// 2. List Synthetic Sample Presets
app.get('/api/samples', (_req: Request, res: Response) => {
  res.json(
    SAMPLE_REPORT_PRESETS.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      badge: p.badge,
      fileName: p.fileName,
    }))
  );
});

// 3. Download a Real Synthetic Sample PDF
app.get('/api/samples/:presetId/pdf', async (req: Request, res: Response) => {
  try {
    const preset = SAMPLE_REPORT_PRESETS.find((p) => p.id === req.params.presetId);
    if (!preset) {
      res.status(404).json({ error: 'Sample report preset not found.' });
      return;
    }
    const pdfBuffer = await generateSamplePdfBuffer(preset);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${preset.fileName}"`
    );
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to generate sample PDF.' });
  }
});

// 4. Analyze a Synthetic Sample Preset through the Real PDF Pipeline
app.post('/api/reports/sample/:presetId', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req);
    const language = normalizeMedicalLanguage(req.body?.language);
    const consentGranted = Boolean(req.body?.consentGranted);

    const preset = SAMPLE_REPORT_PRESETS.find((p) => p.id === req.params.presetId);
    if (!preset) {
      res.status(404).json({ error: 'Synthetic sample preset not found.' });
      return;
    }

    const pdfBuffer = await generateSamplePdfBuffer(preset);
    const extraction = await extractTextFromDocument(pdfBuffer, 'pdf');
    const parsedBiomarkers = parseBiomarkersFromText(extraction.rawText);
    const labMetadata = extractLabMetadata(extraction.rawText);
    const baselineSummaries = buildBaselineSummaries(parsedBiomarkers);
    const urgentCare = buildUrgentCareAlert(parsedBiomarkers);

    const enriched = await enrichReportWithLiveAi(
      parsedBiomarkers,
      baselineSummaries,
      language
    );

    const normalCount = enriched.biomarkers.filter((b) => b.status === 'normal').length;
    const criticalCount = enriched.biomarkers.filter(
      (b) => b.status === 'critical_low' || b.status === 'critical_high'
    ).length;
    const outOfRangeCount = enriched.biomarkers.filter(
      (b) =>
        b.status === 'low' ||
        b.status === 'high' ||
        b.status === 'critical_low' ||
        b.status === 'critical_high'
    ).length;
    const rangeNotProvidedCount = enriched.biomarkers.filter(
      (b) => b.status === 'range_not_provided'
    ).length;

    const report: ReportAnalysis = {
      id: `rep_${crypto.randomUUID().slice(0, 12)}`,
      sessionId,
      fileName: preset.fileName,
      fileType: 'sample_pdf',
      fileSizeBytes: pdfBuffer.length,
      uploadedAt: new Date().toISOString(),
      isSyntheticSample: true,
      consentSaved: consentGranted,
      consentTimestamp: consentGranted ? new Date().toISOString() : null,
      extractionMethod: extraction.method,
      extractionConfidence: extraction.confidence,
      rawExtractedText: extraction.rawText,
      labMetadata,
      biomarkers: enriched.biomarkers,
      stats: {
        totalTests: enriched.biomarkers.length,
        normalCount,
        outOfRangeCount,
        criticalCount,
        rangeNotProvidedCount,
      },
      urgentCare,
      aiGenerationMeta: enriched.aiMeta,
      summaries: enriched.summaries,
    };

    const stored = storeAnalyzedReport(report, consentGranted);
    res.json(stored);
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'Failed to analyze synthetic sample report.',
    });
  }
});

// 5. Upload and Analyze Real User Medical Report File (PDF, PNG, JPG)
app.post(
  '/api/reports/analyze',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({
            error: `File exceeds the maximum allowed upload size of ${MAX_UPLOAD_MB} MB. Please upload a smaller PDF or compressed image.`,
          });
          return;
        }
        res.status(400).json({ error: `Upload error: ${err.message}` });
        return;
      }
      if (err) {
        res.status(400).json({ error: err.message || 'File upload failed.' });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req);
      const language = normalizeMedicalLanguage(req.body?.language);
      const consentGranted =
        req.body?.consentGranted === 'true' || req.body?.consentGranted === true;

      if (!req.file) {
        res.status(400).json({
          error: 'No file was provided. Please select a PDF, JPG, or PNG laboratory report.',
        });
        return;
      }

      const magicCheck = validateFileMagicBytes(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      if (!magicCheck.valid || !magicCheck.format) {
        res.status(415).json({
          error:
            magicCheck.error ||
            'Invalid file format. Only authentic PDF, PNG, and JPEG files are accepted.',
        });
        return;
      }

      const extraction = await extractTextFromDocument(
        req.file.buffer,
        magicCheck.format
      );

      const parsedBiomarkers = parseBiomarkersFromText(extraction.rawText);

      if (parsedBiomarkers.length === 0) {
        res.status(422).json({
          error:
            'Text was extracted from the document, but no structured laboratory test parameters (Test Name + Numeric Value) were detected. Please ensure you uploaded a laboratory test report with readable test rows.',
          extractedTextPreview: extraction.rawText.slice(0, 400),
        });
        return;
      }

      const labMetadata = extractLabMetadata(extraction.rawText);
      const baselineSummaries = buildBaselineSummaries(parsedBiomarkers);
      const urgentCare = buildUrgentCareAlert(parsedBiomarkers);

      const enriched = await enrichReportWithLiveAi(
        parsedBiomarkers,
        baselineSummaries,
        language
      );

      const normalCount = enriched.biomarkers.filter((b) => b.status === 'normal').length;
      const criticalCount = enriched.biomarkers.filter(
        (b) => b.status === 'critical_low' || b.status === 'critical_high'
      ).length;
      const outOfRangeCount = enriched.biomarkers.filter(
        (b) =>
          b.status === 'low' ||
          b.status === 'high' ||
          b.status === 'critical_low' ||
          b.status === 'critical_high'
      ).length;
      const rangeNotProvidedCount = enriched.biomarkers.filter(
        (b) => b.status === 'range_not_provided'
      ).length;

      const isSynthetic =
        /synthetic\s+demonstration\s+report/i.test(extraction.rawText) ||
        /carematric_synthetic/i.test(req.file.originalname);

      const report: ReportAnalysis = {
        id: `rep_${crypto.randomUUID().slice(0, 12)}`,
        sessionId,
        fileName: req.file.originalname,
        fileType: magicCheck.format === 'pdf' ? 'pdf' : 'image',
        fileSizeBytes: req.file.size,
        uploadedAt: new Date().toISOString(),
        isSyntheticSample: isSynthetic,
        consentSaved: consentGranted,
        consentTimestamp: consentGranted ? new Date().toISOString() : null,
        extractionMethod: extraction.method,
        extractionConfidence: extraction.confidence,
        rawExtractedText: extraction.rawText,
        labMetadata,
        biomarkers: enriched.biomarkers,
        stats: {
          totalTests: enriched.biomarkers.length,
          normalCount,
          outOfRangeCount,
          criticalCount,
          rangeNotProvidedCount,
        },
        urgentCare,
        aiGenerationMeta: enriched.aiMeta,
        summaries: enriched.summaries,
      };

      const stored = storeAnalyzedReport(report, consentGranted);
      res.json(stored);
    } catch (err: any) {
      res.status(422).json({
        error:
          err?.message ||
          'An error occurred while extracting or validating the laboratory report.',
      });
    }
  }
);

// 6. List Consented Report History (Session-Scoped)
app.get('/api/reports/history', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const reports = listConsentedReportsForSession(sessionId);
  res.json(reports);
});

// 7. Get Single Report by ID (Session-Scoped)
app.get('/api/reports/:id', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const report = getReportForSession(String(req.params.id), sessionId);
  if (!report) {
    res.status(404).json({
      error:
        'Report not found in your active session or consented history. Unconsented reports are ephemeral and are never shared across sessions.',
    });
    return;
  }
  res.json(report);
});

// 8. Enrich / Translate Report for a Selected Language
app.post('/api/reports/:id/translate', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req);
    const language = normalizeMedicalLanguage(req.body?.language);
    const report = getReportForSession(String(req.params.id), sessionId);

    if (!report) {
      res.status(404).json({ error: 'Report not found for this session.' });
      return;
    }

    const enriched = await enrichReportWithLiveAi(
      report.biomarkers,
      report.summaries,
      language
    );

    const updated: ReportAnalysis = {
      ...report,
      biomarkers: enriched.biomarkers,
      summaries: enriched.summaries,
      aiGenerationMeta: enriched.aiMeta,
    };

    updateReportInStore(updated, sessionId);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to translate report.' });
  }
});

// 9. Grant Informed Consent to Save Report in History
app.post('/api/reports/:id/consent', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const updated = grantConsentForReport(String(req.params.id), sessionId);
  if (!updated) {
    res.status(404).json({ error: 'Report not found for this session.' });
    return;
  }
  res.json(updated);
});

// 10. Delete a Single Report
app.delete('/api/reports/:id', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const deleted = deleteReportForSession(String(req.params.id), sessionId);
  if (!deleted) {
    res.status(404).json({ error: 'Report not found or already deleted.' });
    return;
  }
  res.json({ deleted: true, id: req.params.id });
});

// 11. Purge All Reports for Current Session
app.delete('/api/reports', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const purgedCount = purgeAllReportsForSession(sessionId);
  res.json({ purged: true, purgedCount });
});

// 12. Contextual AI Chat about a Specific Medical Report
app.post('/api/reports/:id/chat', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req);
    const report = getReportForSession(String(req.params.id), sessionId);
    if (!report) {
      res.status(404).json({ error: 'Report not found for this session.' });
      return;
    }

    const question = String(req.body?.question || '').trim();
    const language = normalizeLanguage(req.body?.language);

    if (!question) {
      res.status(400).json({ error: 'Please enter a question about your report.' });
      return;
    }

    const response = await answerContextualReportQuestion(
      report,
      question,
      language
    );

    res.json({
      id: `msg_${crypto.randomUUID().slice(0, 8)}`,
      role: 'assistant',
      content: response.answer,
      language,
      timestamp: new Date().toISOString(),
      sourceMode: response.sourceMode,
      safetyFlagged: response.safetyFlagged,
    });
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'Unable to process question at this time.',
    });
  }
});

// ============================================================================
// MULTIFUNCTIONAL AI ASSISTANT & CONVERSATION ENDPOINTS
// ============================================================================

// 13. List Conversations for Current Session
app.get('/api/conversations', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  res.json(listConversationsForSession(sessionId));
});

// 14. Create a New Conversation Thread
app.post('/api/conversations', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const title = req.body?.title ? String(req.body.title) : 'New AI Chat';
  const category = normalizeCategory(req.body?.category);
  const language = normalizeLanguage(req.body?.language);

  const thread = createConversationForSession(sessionId, {
    title,
    category,
    language,
  });
  res.json(thread);
});

// 15. Get a Single Conversation Thread
app.get('/api/conversations/:id', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const thread = getConversationForSession(String(req.params.id), sessionId);
  if (!thread) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  res.json(thread);
});

// 16. Send Message (with Optional Document/Image Attachment) in Conversation
app.post(
  '/api/conversations/:id/message',
  (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.header('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      upload.single('file')(req, res, (err: any) => {
        if (err) {
          res.status(400).json({ error: err.message || 'Attachment upload failed.' });
          return;
        }
        next();
      });
    } else {
      next();
    }
  },
  async (req: Request, res: Response) => {
    try {
      const sessionId = getSessionId(req);
      let thread = getConversationForSession(String(req.params.id), sessionId);
      if (!thread) {
        thread = createConversationForSession(sessionId, {
          title: 'New AI Chat',
          category: normalizeCategory(req.body?.category),
          language: normalizeLanguage(req.body?.language),
        });
      }

      const promptText = String(req.body?.message || '').trim();
      const language = normalizeLanguage(req.body?.language || thread.language);
      const category = normalizeCategory(req.body?.category || thread.category);

      let attachmentMeta: ChatAttachmentMeta | null = null;

      if (req.file) {
        const extracted = await extractTextFromAnyAttachment(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        const biomarkers = parseBiomarkersFromText(extracted.rawText);
        const words = extracted.rawText.split(/\s+/).filter(Boolean).length;

        thread.documentContext = {
          fileName: req.file.originalname,
          extractedText: extracted.rawText,
          extractionMethod: extracted.method,
          wordCount: words,
        };

        attachmentMeta = {
          fileName: req.file.originalname,
          fileType: extracted.detectedFormat,
          fileSizeBytes: req.file.size,
          extractionMethod: extracted.method,
          extractedPreview: extracted.rawText.slice(0, 260),
          detectedBiomarkerCount: biomarkers.length,
        };
      }

      const effectivePrompt =
        promptText ||
        (attachmentMeta
          ? `Analyze and summarize the attached document "${attachmentMeta.fileName}".`
          : '');

      if (!effectivePrompt) {
        res.status(400).json({ error: 'Please enter a message or attach a file.' });
        return;
      }

      const userMessage: ChatMessage = {
        id: `u_${crypto.randomUUID().slice(0, 8)}`,
        role: 'user',
        content: effectivePrompt,
        language,
        timestamp: new Date().toISOString(),
        sourceMode: 'live_ai',
        attachment: attachmentMeta,
      };

      thread.messages.push(userMessage);

      // Update conversation title from first user message
      if (thread.messages.length <= 2 && thread.title === 'New AI Chat') {
        thread.title = effectivePrompt.slice(0, 48);
      }
      thread.language = language;
      thread.category = category;

      const aiReply = await generateAssistantChatResponse({
        prompt: effectivePrompt,
        language,
        category,
        history: thread.messages.slice(0, -1),
        documentContext: thread.documentContext,
      });

      const assistantMessage: ChatMessage = {
        id: `a_${crypto.randomUUID().slice(0, 8)}`,
        role: 'assistant',
        content: aiReply.content,
        language,
        timestamp: new Date().toISOString(),
        sourceMode: aiReply.sourceMode,
        safetyFlagged: aiReply.safetyFlagged,
      };

      thread.messages.push(assistantMessage);
      thread.updatedAt = new Date().toISOString();

      const saved = saveConversationForSession(thread, sessionId);
      res.json(saved);
    } catch (err: any) {
      res.status(422).json({
        error: err?.message || 'Failed to process message.',
      });
    }
  }
);

// 17. Regenerate Last Assistant Response in Conversation
app.post('/api/conversations/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const sessionId = getSessionId(req);
    const thread = getConversationForSession(String(req.params.id), sessionId);
    if (!thread || thread.messages.length === 0) {
      res.status(404).json({ error: 'Conversation has no messages to regenerate.' });
      return;
    }

    const language = normalizeLanguage(req.body?.language || thread.language);

    // Pop trailing assistant message if present
    if (thread.messages[thread.messages.length - 1]?.role === 'assistant') {
      thread.messages.pop();
    }

    const lastUserMsg = [...thread.messages]
      .reverse()
      .find((m) => m.role === 'user');
    if (!lastUserMsg) {
      res.status(400).json({ error: 'No user prompt found to regenerate.' });
      return;
    }

    const aiReply = await generateAssistantChatResponse({
      prompt: lastUserMsg.content,
      language,
      category: thread.category,
      history: thread.messages.slice(0, -1),
      documentContext: thread.documentContext,
    });

    const assistantMessage: ChatMessage = {
      id: `a_${crypto.randomUUID().slice(0, 8)}`,
      role: 'assistant',
      content: aiReply.content,
      language,
      timestamp: new Date().toISOString(),
      sourceMode: aiReply.sourceMode,
      safetyFlagged: aiReply.safetyFlagged,
    };

    thread.messages.push(assistantMessage);
    thread.updatedAt = new Date().toISOString();

    const saved = saveConversationForSession(thread, sessionId);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to regenerate response.' });
  }
});

// 18. Clear Messages in a Conversation
app.post('/api/conversations/:id/clear', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const updated = clearConversationMessages(String(req.params.id), sessionId);
  if (!updated) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  res.json(updated);
});

// 19. Delete a Conversation Thread
app.delete('/api/conversations/:id', (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const deleted = deleteConversationForSession(String(req.params.id), sessionId);
  if (!deleted) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  res.json({ deleted: true, id: req.params.id });
});

// 20. Document Smart Tool: Extract Text, Key Sentences, Metrics & Optional AI Summary
app.post(
  '/api/tools/document-extract',
  (req: Request, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        res.status(400).json({ error: err.message || 'File upload failed.' });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Please select a PDF, image, or text document.' });
        return;
      }
      const language = normalizeLanguage(req.body?.language);
      const extracted = await extractTextFromAnyAttachment(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      const words = extracted.rawText.split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const charCount = extracted.rawText.length;
      const estimatedReadingMinutes = Math.max(1, Math.ceil(wordCount / 200));

      const sentences = extracted.rawText
        .split(/(?<=[.!?])\s+|\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 25 && s.length <= 280)
        .slice(0, 6);

      const biomarkers = parseBiomarkersFromText(extracted.rawText);
      const aiConfig = getActiveAiConfig();

      let aiSummary: string | null = null;
      let fallbackNotice: string | undefined;

      if (aiConfig.configured) {
        const reply = await generateAssistantChatResponse({
          prompt: `Provide a concise executive summary and key bullet points of this document.`,
          language,
          category: 'document',
          history: [],
          documentContext: {
            fileName: req.file.originalname,
            extractedText: extracted.rawText,
            extractionMethod: extracted.method,
            wordCount,
          },
        });
        aiSummary = reply.content;
      } else {
        fallbackNotice =
          'Live AI summarization requires GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY in server .env. Showing verbatim extracted text, document metrics, and deterministic key lines below.';
      }

      const result: ExtractedDocumentResult = {
        id: `doc_${crypto.randomUUID().slice(0, 10)}`,
        fileName: req.file.originalname,
        fileSizeBytes: req.file.size,
        detectedFormat: extracted.detectedFormat,
        extractionMethod: extracted.method,
        confidence: extracted.confidence,
        rawText: extracted.rawText,
        wordCount,
        charCount,
        estimatedReadingMinutes,
        extractiveKeyPoints: sentences,
        detectedBiomarkerCount: biomarkers.length,
        aiSummary,
        aiConfigured: aiConfig.configured,
        aiProvider: aiConfig.provider,
        fallbackNotice,
      };

      res.json(result);
    } catch (err: any) {
      res.status(422).json({
        error: err?.message || 'Unable to extract text from document.',
      });
    }
  }
);

// 21. Smart Tools Execution Endpoint (Study AI, Coding AI, Translation, Document Q&A)
app.post('/api/tools/run', async (req: Request, res: Response) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    const language = normalizeLanguage(req.body?.language);
    const category = normalizeCategory(req.body?.category);
    const documentText = req.body?.documentText
      ? String(req.body.documentText)
      : undefined;
    const documentName = req.body?.documentName
      ? String(req.body.documentName)
      : 'Document';

    if (!prompt) {
      res.status(400).json({ error: 'Please provide input text or a question.' });
      return;
    }

    const result = await generateAssistantChatResponse({
      prompt,
      language,
      category,
      history: [],
      documentContext: documentText
        ? {
            fileName: documentName,
            extractedText: documentText,
            extractionMethod: 'Document Context',
            wordCount: documentText.split(/\s+/).length,
          }
        : null,
    });

    res.json({
      content: result.content,
      sourceMode: result.sourceMode,
      safetyFlagged: result.safetyFlagged,
      language,
      category,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'Failed to execute Smart Tool request.',
    });
  }
});

// Serve static build in standalone Node production mode
if (!process.env.VERCEL) {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        next();
      }
    });
  });

  app.listen(PORT, () => {
    const ai = getActiveAiConfig();
    console.log(
      `[CareMatric AI Server] Listening on http://localhost:${PORT} | AI Provider: ${ai.provider} (${ai.configured ? ai.model : 'Offline Deterministic + Clinical Glossary Mode'})`
    );
  });
}

export { app };
export default app;
