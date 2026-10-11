# CareMatric AI — Multifunctional AI Assistant & Medical Report Literacy Platform

**What can I help you with today? • Understand Your Health Reports. In Your Language.**

CareMatric AI is a multifunctional AI assistant and medical laboratory report literacy platform featuring a dark navy & obsidian interface with violet, purple, and cyan accents. It combines a dedicated **Medical Report Analyzer** (supporting **English (`en`)**, **Hindi (`hi`)**, **Gujarati (`gu`)**, and **Urdu (`ur`)**) with an **AI Chatbot** and **Smart Tools** for **Study AI**, **Coding AI**, **Document Analysis (OCR & PDF Q&A)**, and **Translation Studio** across **English, Hindi, Hinglish, Gujarati, and Urdu**.

---

## Quick Start & Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment configuration template and add your AI API key
cp .env.example .env

# 3. Start both the Express API server (port 3001) and Vite frontend (port 5173)
npm run dev

# 4. Production build & typecheck
npm run build
```

- **Local Frontend URL**: `http://localhost:5173/`
- **Local Backend API URL**: `http://localhost:3001/api/system/ai-status`

---

## Application Routes & Workspaces

| Route | Workspace / Feature | Description |
| :--- | :--- | :--- |
| `/` | **AI Assistant Home & Chat** | Headline *"What can I help you with today?"*, prominent AI chat composer with file attachment, voice input, New Chat button, Recent Conversations sidebar, Copy/Regenerate/Clear actions, and 6 Quick Action cards. |
| `/medical` & `/dashboard` | **Medical Report Analyzer** | Dedicated medical laboratory report upload (PDF, PNG, JPG up to 10 MB), synthetic sample report presets, and informed-consent toggle. |
| `/dashboard/analysis/:id` | **Report Analysis View** | Fact vs. Explanation table, Reference Range Visualizer, Urgent-Care Threshold banner, Physician Discussion Guide, and Contextual Report Q&A Chat. |
| `/dashboard/history` | **Consent-Gated Report History** | Session-isolated report storage, single-report deletion, full session purge, and session token rotation. |
| `/tools/documents` | **Document Analysis & OCR** | PDF text extraction & Tesseract OCR for images, word/reading-time metrics, key sentence extraction, and document Q&A. |
| `/tools/study` | **Study AI** | Structured revision notes, concept explanations, and interactive self-assessment quizzes. |
| `/tools/coding` | **Coding AI** | Deterministic static code diagnostics + AI code explanation, debugging, and refactoring. |
| `/tools/translate` | **Translation Studio** | Multilingual translation across Hindi, Hinglish, English, Gujarati, and Urdu with clinical glossary detection. |
| `/overview` | **Platform Overview** | Interactive biomarker preview, How It Works, Key Features, Supported Languages, Privacy Architecture, and FAQs. |

---

## Required Environment Variables & AI API Configuration

All API keys and secrets are kept **exclusively on the backend server** (`server/services/aiService.ts`) in `.env` and are never exposed to the browser client.

| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | Optional | Backend Express server port (default: `3001`) |
| `GEMINI_API_KEY` | Recommended | Google Gemini API key (`gemini-2.5-flash`) for live AI chat, Smart Tools, and multilingual report explanations |
| `OPENAI_API_KEY` | Optional | OpenAI API key (`gpt-4o-mini`) used if `GEMINI_API_KEY` is not set |
| `GROQ_API_KEY` | Optional | Groq API key (`llama-3.3-70b-versatile`) used if neither Gemini nor OpenAI is set |
| `MAX_UPLOAD_MB` | Optional | Maximum file upload size in megabytes (default: `10`) |

### Transparent AI Offline Behavior (Zero Faked Responses)
If no AI API key (`GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY`) is configured in `.env`, CareMatric AI **never fakes** AI responses:
1. **Medical Report Analyzer & Document OCR**: Deterministic PDF parsing (`pdf-parse` + native stream parser), image OCR (`tesseract.js`), reference-range comparison, and the curated multilingual **Clinical Biomarker Glossary** (`en`, `hi`, `gu`, `ur`) work out of the box.
2. **AI Chatbot & Smart Tools**: Transparently display a `Server AI Key Required` status notice explaining how to configure `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY` in `.env`, while still running deterministic document extraction, static code diagnostics, and clinical glossary term matching.

---

## Medical Safety & Privacy Guardrails

1. **Dedicated Medical Report Analyzer**: Preserved and enhanced as a dedicated clinical literacy tool (`/medical`) with strict separation between verbatim extracted lab numbers and educational explanations.
2. **Zero Invented Values or Reference Ranges**: Values are compared strictly against the reference interval printed on the uploaded report. Missing reference ranges are explicitly marked as `Range Not Specified` (`Not specified on report`).
3. **Non-Prescribing & Non-Diagnostic Guardrails**: Both deterministic regex guardrails (`checkMedicationSafetyGuardrail`) and system prompts block medication prescriptions, drug recommendations, or dosage changes across both the Medical Analyzer and General AI Chat.
4. **Consent-Gated Privacy & Right to Erasure**: Medical reports are processed in ephemeral memory by default and saved to Report History only with explicit user consent, isolated per cryptographic session token (`X-CareMatric-Session`).
