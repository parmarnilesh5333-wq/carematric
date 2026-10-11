import {
  AiGenerationMeta,
  AssistantCategory,
  ChatMessage,
  ExtractedBiomarker,
  LanguageSummary,
  MedicalLanguage,
  ReportAnalysis,
  SupportedLanguage,
} from '../../src/types/report';
import { parseBiomarkersFromText } from './reportParser';

export interface ActiveAiConfig {
  configured: boolean;
  provider: 'Google Gemini' | 'OpenAI' | 'Groq' | 'Unconfigured';
  model: string | null;
  apiKey: string | null;
}

export function getActiveAiConfig(): ActiveAiConfig {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey && geminiKey.length > 10) {
    return {
      configured: true,
      provider: 'Google Gemini',
      model: process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash',
      apiKey: geminiKey,
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey && openaiKey.length > 10) {
    return {
      configured: true,
      provider: 'OpenAI',
      model: process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini',
      apiKey: openaiKey,
    };
  }

  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey && groqKey.length > 10) {
    return {
      configured: true,
      provider: 'Groq',
      model: process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile',
      apiKey: groqKey,
    };
  }

  return {
    configured: false,
    provider: 'Unconfigured',
    model: null,
    apiKey: null,
  };
}

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी in Devanagari script)',
  hinglish: 'Hinglish (Conversational Hindi written in Latin/English script)',
  gu: 'Gujarati (ગુજરાતી in Gujarati script)',
  ur: 'Urdu (اردو in Urdu script)',
};

// Deterministic safety check to block medication prescription or dosage adjustment requests
const PRESCRIPTION_DOSAGE_PATTERNS = [
  /\b(prescribe|prescription|which\s+medicine|what\s+medicine|which\s+tablet|which\s+drug|which\s+pill)\b/i,
  /\b(what\s+dose|what\s+dosage|how\s+many\s+mg|increase\s+my\s+dose|decrease\s+my\s+dose|stop\s+taking|change\s+my\s+medication)\b/i,
  /\b(kaun\s*si\s*dawa|kitni\s*dose|dawa\s*batao|medicine\s*suggest)\b/i,
  /\b(मेटफॉर्मिन|दवा\s+बताएं|कौन\s+सी\s+दवा|कितनी\s+खुराक|दवा\s+बंद)\b/i,
  /\b(કઈ\s+દવા|કેટલો\s+ડોઝ|દવા\s+બંધ)\b/i,
  /\b(کون\s+سی\s+دوا|کتنی\s+خوراک|دوا\s+بند)\b/i,
];

export function checkMedicationSafetyGuardrail(
  userQuery: string,
  language: SupportedLanguage
): { blocked: boolean; safeResponse?: string } {
  const isMedicationRequest = PRESCRIPTION_DOSAGE_PATTERNS.some((pattern) =>
    pattern.test(userQuery)
  );

  if (!isMedicationRequest) {
    return { blocked: false };
  }

  const responses: Record<SupportedLanguage, string> = {
    en: `**Clinical Safety Notice (Non-Prescribing Guardrail):**\n\nCareMatric AI is an educational health-literacy and productivity platform and **cannot prescribe medications, recommend specific drugs, or advise you to start, stop, or change a medication dosage**.\n\nMedication decisions safely require a licensed physician who knows your full medical history, kidney/liver function, allergies, and current prescriptions. Here is what you can ask your doctor:\n- *"Based on these lab values, do my current medications or dosages need any adjustment?"*\n- *"Are lifestyle or nutritional measures appropriate first, or is pharmacological therapy indicated?"*`,
    hi: `**चिकित्सा सुरक्षा सूचना (दवा एवं खुराक नियम):**\n\nCareMatric AI एक शैक्षिक स्वास्थ्य एवं AI सहायक मंच है और **यह कोई दवा लिख नहीं सकता, किसी विशेष दवा का सुझाव नहीं दे सकता, और न ही किसी दवा को शुरू करने, बंद करने या उसकी खुराक (डोज़) बदलने की सलाह दे सकता है।**\n\nदवा से जुड़े निर्णय केवल आपके डॉक्टर ही आपकी पूरी मेडिकल हिस्ट्री और शारीरिक जांच के आधार पर ले सकते हैं। आप अपने डॉक्टर से पूछ सकते हैं:\n- *"इन लैब परिणामों के आधार पर क्या मेरी वर्तमान दवाओं या उनकी खुराक में किसी बदलाव की आवश्यकता है?"*`,
    hinglish: `**Clinical Safety Notice (Non-Prescribing Rule):**\n\nCareMatric AI ek educational health aur AI assistant platform hai. **Hum koi bhi medicine prescribe nahi kar sakte, na hi kisi dawa ka naam ya dosage (mg) badalne ki salah de sakte hain.**\n\nMedicine aur dosage ka faisla sirf aapke qualified doctor aapki complete medical history dekh kar kar sakte hain. Aap apne doctor se yeh pooch sakte hain:\n- *"Mere lab report ke hisaab se kya meri current medicines ya dosage mein koi change zaroori hai?"*`,
    gu: `**તબીબી સુરક્ષા સૂચના (દવા અને ડોઝ અંગેનો નિયમ):**\n\nCareMatric AI એ માત્ર શિક્ષણ અને માહિતી માટેનું માધ્યમ છે અને **તે કોઈ દવા લખી શકતું નથી, કોઈ ચોક્કસ દવાની ભલામણ કરી શકતું નથી, અથવા દવાનો ડોઝ વધારવા, ઘટાડવા કે બંધ કરવાની સલાહ આપી શકતું નથી.**\n\nદવા અંગેનો નિર્ણય માત્ર તમારા ડૉક્ટર જ તમારી સંપૂર્ણ તબીબી વિગતો તપાસીને લઈ શકે છે. તમે તમારા ડૉક્ટરને પૂછી શકો છો:\n- *"આ લેબ રિપોર્ટના આધારે શું મારી ચાલુ દવાઓ કે તેના ડોઝમાં કોઈ ફેરફાર કરવાની જરૂર છે?"*`,
    ur: `**طبی حفاظتی انتباہ (ادویات اور خوراک سے متعلق اصول):**\n\nCareMatric AI ایک تعلیمی ٹول ہے اور **یہ کوئی دوا تجویز نہیں کر سکتا، نہ ہی کسی دوا کو شروع کرنے، بند کرنے یا اس کی خوراک (ڈوز) تبدیل کرنے کا مشورہ دے سکتا ہے۔**\n\nادویات سے متعلق فیصلے صرف آپ کے مستند ڈاکٹر ہی آپ کی مکمل طبی ہسٹری کو دیکھ کر کر سکتے ہیں۔ آپ اپنے ڈاکٹر سے یہ سوال پوچھ سکتے ہیں:\n- *"ان لیب نتائج کی روشنی میں کیا میری موجودہ ادویات یا ان کی خوراک میں کسی تبدیلی کی ضرورت ہے؟"*`,
  };

  return {
    blocked: true,
    safeResponse: responses[language],
  };
}

export async function callProviderJson(
  config: ActiveAiConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (!config.configured || !config.apiKey) {
    throw new Error('AI API key is not configured on the server.');
  }

  if (config.provider === 'Google Gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${encodeURIComponent(config.apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.25,
          responseMimeType: 'application/json',
        },
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${errText.slice(0, 200)}`);
    }
    const data: any = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  const baseUrl =
    config.provider === 'OpenAI'
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.groq.com/openai/v1/chat/completions';

  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.25,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${config.provider} API HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data: any = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

export async function enrichReportWithLiveAi(
  biomarkers: ExtractedBiomarker[],
  baselineSummaries: Record<MedicalLanguage, LanguageSummary>,
  targetLanguage: MedicalLanguage
): Promise<{
  biomarkers: ExtractedBiomarker[];
  summaries: Record<MedicalLanguage, LanguageSummary>;
  aiMeta: AiGenerationMeta;
}> {
  const config = getActiveAiConfig();

  if (!config.configured) {
    return {
      biomarkers,
      summaries: baselineSummaries,
      aiMeta: {
        aiConfigured: false,
        provider: 'Unconfigured (Server .env)',
        model: null,
        generatedByLiveAi: false,
        fallbackReason:
          'No GEMINI_API_KEY, OPENAI_API_KEY, or GROQ_API_KEY is configured in the server environment. Extracted laboratory values and reference ranges are verified deterministically, and explanations are served from the curated Clinical Biomarker Glossary.',
      },
    };
  }

  const sanitizedFacts = biomarkers.map((b) => ({
    id: b.id,
    testName: b.testName,
    measuredValue: b.measuredValueRaw,
    unit: b.unit ?? 'Not specified on report',
    referenceRange: b.referenceRangeRaw ?? 'Not specified on report',
    deterministicStatus: b.status,
  }));

  const systemPrompt = `You are CareMatric AI, a clinical health-literacy assistant.
STRICT SAFETY RULES:
1. NEVER invent, alter, or guess any measured value, unit, or reference range. Use ONLY the exact numbers provided in the input JSON.
2. If a reference range is "Not specified on report", state clearly that the laboratory did not print a reference range on the report and do NOT invent one.
3. NEVER diagnose diseases, prescribe medications, or recommend medication dosage changes.
4. Clearly distinguish extracted facts from general educational explanations.
5. Respond in valid JSON matching this schema:
{
  "overview": "string in ${LANGUAGE_LABELS[targetLanguage]}",
  "doctorQuestions": ["string in ${LANGUAGE_LABELS[targetLanguage]}"],
  "lifestyleEducation": ["string in ${LANGUAGE_LABELS[targetLanguage]}"],
  "biomarkerExplanations": {
    "<id>": {
      "whatItMeasures": "string in ${LANGUAGE_LABELS[targetLanguage]}",
      "whatResultMeans": "string in ${LANGUAGE_LABELS[targetLanguage]}",
      "educationalNote": "string in ${LANGUAGE_LABELS[targetLanguage]}"
    }
  }
}`;

  const userPrompt = `Generate plain-language medical report education in ${LANGUAGE_LABELS[targetLanguage]} for these validated laboratory parameters:\n${JSON.stringify(sanitizedFacts, null, 2)}`;

  try {
    const rawJson = await callProviderJson(config, systemPrompt, userPrompt);
    const parsed = JSON.parse(rawJson);

    const updatedBiomarkers = biomarkers.map((b) => {
      const aiExp = parsed?.biomarkerExplanations?.[b.id];
      if (aiExp && aiExp.whatItMeasures && aiExp.whatResultMeans) {
        return {
          ...b,
          explanation: {
            ...b.explanation,
            [targetLanguage]: {
              whatItMeasures: String(aiExp.whatItMeasures),
              whatResultMeans: String(aiExp.whatResultMeans),
              educationalNote: String(
                aiExp.educationalNote || b.explanation[targetLanguage].educationalNote
              ),
              sourceType: 'live_ai' as const,
            },
          },
        };
      }
      return b;
    });

    const updatedSummaries: Record<MedicalLanguage, LanguageSummary> = {
      ...baselineSummaries,
      [targetLanguage]: {
        overview:
          typeof parsed?.overview === 'string' && parsed.overview.trim()
            ? parsed.overview.trim()
            : baselineSummaries[targetLanguage].overview,
        keyFindings: baselineSummaries[targetLanguage].keyFindings,
        doctorQuestions:
          Array.isArray(parsed?.doctorQuestions) && parsed.doctorQuestions.length > 0
            ? parsed.doctorQuestions.map(String)
            : baselineSummaries[targetLanguage].doctorQuestions,
        lifestyleEducation:
          Array.isArray(parsed?.lifestyleEducation) && parsed.lifestyleEducation.length > 0
            ? parsed.lifestyleEducation.map(String)
            : baselineSummaries[targetLanguage].lifestyleEducation,
      },
    };

    return {
      biomarkers: updatedBiomarkers,
      summaries: updatedSummaries,
      aiMeta: {
        aiConfigured: true,
        provider: config.provider,
        model: config.model,
        generatedByLiveAi: true,
      },
    };
  } catch (err: any) {
    return {
      biomarkers,
      summaries: baselineSummaries,
      aiMeta: {
        aiConfigured: true,
        provider: config.provider,
        model: config.model,
        generatedByLiveAi: false,
        fallbackReason: `Live AI request encountered an error (${err?.message || 'Provider error'}). Showing verified Clinical Glossary explanations.`,
      },
    };
  }
}

export async function answerContextualReportQuestion(
  report: ReportAnalysis,
  question: string,
  language: SupportedLanguage
): Promise<{
  answer: string;
  sourceMode: 'live_ai' | 'clinical_guardrail' | 'ai_unconfigured_notice';
  safetyFlagged: boolean;
}> {
  const safety = checkMedicationSafetyGuardrail(question, language);
  if (safety.blocked && safety.safeResponse) {
    return {
      answer: safety.safeResponse,
      sourceMode: 'clinical_guardrail',
      safetyFlagged: true,
    };
  }

  const config = getActiveAiConfig();
  const medLang: MedicalLanguage =
    language === 'hi' || language === 'gu' || language === 'ur' ? language : 'en';

  if (!config.configured) {
    const qLower = question.toLowerCase();
    const matchedBiomarkers = report.biomarkers.filter(
      (b) =>
        qLower.includes(b.testName.toLowerCase().split('(')[0].trim()) ||
        (b.canonicalCode && qLower.includes(b.canonicalCode.toLowerCase()))
    );

    const targetBiomarkers =
      matchedBiomarkers.length > 0
        ? matchedBiomarkers
        : report.biomarkers.filter((b) => b.status !== 'normal').slice(0, 3);

    const detailsList = targetBiomarkers
      .map((b) => {
        const exp = b.explanation[medLang];
        const rangeText = b.referenceRangeRaw ?? 'Not specified on report';
        return `- **${b.testName}**: \`${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}\` (Ref: \`${rangeText}\`)\n  - *${exp.whatItMeasures}*\n  - ${exp.whatResultMeans}`;
      })
      .join('\n\n');

    const notices: Record<SupportedLanguage, string> = {
      en: `**Live AI API Not Configured on Server (\`GEMINI_API_KEY\` / \`OPENAI_API_KEY\` not set in \`.env\`)**\n\nBecause no live LLM API key is configured on the server, CareMatric AI does not simulate or fake free-form AI chat. However, here is the **verified deterministic data from your uploaded report** relevant to your question:\n\n${detailsList || 'All extracted biomarkers are listed in the table.'}\n\n*Tip: To enable live conversational AI in English, Hindi, Hinglish, Gujarati, and Urdu, add \`GEMINI_API_KEY\`, \`OPENAI_API_KEY\`, or \`GROQ_API_KEY\` to your server \`.env\` file.*`,
      hi: `**सर्वर पर लाइव AI API कॉन्फ़िगर नहीं है (\`.env\` में \`GEMINI_API_KEY\` / \`OPENAI_API_KEY\` सेट नहीं है)**\n\nचूंकि सर्वर पर कोई लाइव AI कुंजी सेट नहीं है, CareMatric AI नकली AI चैट का दिखावा नहीं करता है। आपके प्रश्न से संबंधित **आपकी रिपोर्ट के सत्यापित तथ्य और क्लिनिकल शब्दकोश विवरण** नीचे दिए गए हैं:\n\n${detailsList}\n\n*नोट: लाइव AI चैट सक्रिय करने के लिए सर्वर की \`.env\` फ़ाइल में \`GEMINI_API_KEY\` या \`OPENAI_API_KEY\` जोड़ें।*`,
      hinglish: `**Server par Live AI API Key Configured Nahi Hai (\`.env\` mein \`GEMINI_API_KEY\` / \`OPENAI_API_KEY\` set nahi hai)**\n\nKyunki server par abhi koi live LLM API key set nahi hai, CareMatric AI fake AI responses generate nahi karta. Lekin aapke uploaded report ke **verified deterministic facts** yahan hain:\n\n${detailsList}\n\n*Tip: Live AI chat enable karne ke liye server ki \`.env\` file mein \`GEMINI_API_KEY\`, \`OPENAI_API_KEY\`, ya \`GROQ_API_KEY\` add karein.*`,
      gu: `**સર્વર પર લાઇવ AI API કોન્ફિગર કરેલ નથી (\`.env\` માં \`GEMINI_API_KEY\` / \`OPENAI_API_KEY\` સેટ નથી)**\n\nસર્વર પર લાઇવ AI કી સેટ ન હોવાથી, CareMatric AI કૃત્રિમ AI ચેટનો દેખાવ કરતું નથી. તમારા પ્રશ્નને લગતી **તમારા રિપોર્ટની ચકાસાયેલ વિગતો** નીચે મુજબ છે:\n\n${detailsList}\n\n*નોંધ: લાઇવ AI ચેટ સક્રિય કરવા માટે સર્વરની \`.env\` ફાઇલમાં \`GEMINI_API_KEY\` અથવા \`OPENAI_API_KEY\` ઉમેરો.*`,
      ur: `**سرور پر لائیو AI API کنفیگر نہیں ہے (\`.env\` میں \`GEMINI_API_KEY\` یا \`OPENAI_API_KEY\` موجود نہیں)**\n\nچونکہ سرور پر لائیو AI کلید سیٹ نہیں ہے، اس لیے CareMatric AI فرضی AI چیٹ پیش نہیں کرتا۔ آپ کے سوال سے متعلق **آپ کی رپورٹ کے تصدیق شدہ حقائق** درج ذیل ہیں:\n\n${detailsList}\n\n*نوٹ: لائیو AI چیٹ فعال کرنے کے لیے سرور کی \`.env\` فائل میں \`GEMINI_API_KEY\` شامل کریں۔*`,
    };

    return {
      answer: notices[language],
      sourceMode: 'ai_unconfigured_notice',
      safetyFlagged: false,
    };
  }

  const sanitizedFacts = report.biomarkers.map((b) => ({
    testName: b.testName,
    measuredValue: b.measuredValueRaw,
    unit: b.unit ?? 'Not specified on report',
    referenceRange: b.referenceRangeRaw ?? 'Not specified on report',
    status: b.status,
  }));

  const systemPrompt = `You are CareMatric AI, a clinical health-literacy assistant answering a user's question about their uploaded laboratory report.
Respond in ${LANGUAGE_LABELS[language]}.
STRICT RULES:
1. Ground your explanation strictly in the extracted biomarkers provided below. Never invent missing test results or reference ranges.
2. Clearly distinguish what is printed on the report (extracted facts) from general medical education.
3. NEVER diagnose a condition, prescribe medicines, or suggest dosage changes.
4. Always encourage the user to discuss specific findings with their physician.
5. Return valid JSON: { "answer": "markdown string in ${LANGUAGE_LABELS[language]}" }`;

  const userPrompt = `Report Extracted Biomarkers:\n${JSON.stringify(sanitizedFacts, null, 2)}\n\nUser Question: ${question}`;

  const rawJson = await callProviderJson(config, systemPrompt, userPrompt);
  const parsed = JSON.parse(rawJson);

  return {
    answer: String(parsed?.answer || 'Please consult your physician regarding this test result.'),
    sourceMode: 'live_ai',
    safetyFlagged: false,
  };
}

/**
 * Multifunctional AI Assistant Chat Handler
 * Supports General AI Chat, Medical Reports, Study AI, Coding AI, Document Q&A, and Translation
 * across English, Hindi, Hinglish, Gujarati, and Urdu.
 * Never fakes AI responses when unconfigured.
 */
export async function generateAssistantChatResponse(params: {
  prompt: string;
  language: SupportedLanguage;
  category: AssistantCategory;
  history: ChatMessage[];
  documentContext?: {
    fileName: string;
    extractedText: string;
    extractionMethod: string;
    wordCount: number;
  } | null;
}): Promise<{
  content: string;
  sourceMode: 'live_ai' | 'clinical_guardrail' | 'ai_unconfigured_notice';
  safetyFlagged: boolean;
}> {
  const { prompt, language, category, history, documentContext } = params;

  // 1. Check strict non-prescribing medical safety guardrail
  const safety = checkMedicationSafetyGuardrail(prompt, language);
  if (safety.blocked && safety.safeResponse) {
    return {
      content: safety.safeResponse,
      sourceMode: 'clinical_guardrail',
      safetyFlagged: true,
    };
  }

  const config = getActiveAiConfig();

  // 2. If AI API key is NOT configured on the server, NEVER fake a response!
  if (!config.configured) {
    // If the user attached a document, provide real deterministic facts extracted from that document
    let docBreakdown = '';
    if (documentContext?.extractedText) {
      const biomarkers = parseBiomarkersFromText(documentContext.extractedText);
      const lines = documentContext.extractedText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 20)
        .slice(0, 5);

      if (biomarkers.length > 0) {
        const medLang: MedicalLanguage =
          language === 'hi' || language === 'gu' || language === 'ur' ? language : 'en';
        const markerSummary = biomarkers
          .slice(0, 6)
          .map(
            (b) =>
              `- **${b.testName}**: \`${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}\` (Ref: \`${b.referenceRangeRaw ?? 'Not specified'}\`) — **${b.status.toUpperCase()}**\n  - ${b.explanation[medLang].whatResultMeans}`
          )
          .join('\n');
        docBreakdown = `\n\n### Deterministic Lab Biomarkers Extracted from \`${documentContext.fileName}\` (${biomarkers.length} found):\n${markerSummary}\n\n*(Tip: Open the **Medical Reports** tool in the sidebar for the full interactive biomarker table and range charts.)*`;
      } else {
        docBreakdown = `\n\n### Verbatim Document Extraction from \`${documentContext.fileName}\` (${documentContext.wordCount} words via ${documentContext.extractionMethod}):\n${lines.map((l) => `> ${l}`).join('\n')}`;
      }
    }

    const unconfiguredMessages: Record<SupportedLanguage, string> = {
      en: `### ⚠️ Live AI API Key Required for Conversational Generation\n\nCareMatric AI never fakes or simulates AI responses. Currently, no live AI provider key (\`GEMINI_API_KEY\`, \`OPENAI_API_KEY\`, or \`GROQ_API_KEY\`) is configured in the server \`.env\` file.\n\n**How to enable live AI Chat, Study AI, Coding AI, & Translation:**\n1. Open the \`.env\` file in the project root.\n2. Add your API key: \`GEMINI_API_KEY=your_key_here\` (or \`OPENAI_API_KEY\` / \`GROQ_API_KEY\`).\n3. Save the file — the backend server will automatically detect it and activate live responses.\n\n**What works right now without an API key:**\n- **Medical Report Analyzer**: Full PDF & Tesseract OCR extraction, deterministic reference-range comparison, urgent-care threshold alerts, and our curated 4-language Clinical Biomarker Glossary.${docBreakdown}`,
      hi: `### ⚠️ लाइव AI चैट के लिए सर्वर API कुंजी आवश्यक है\n\nCareMatric AI कभी भी नकली (fake) AI उत्तर नहीं देता है। वर्तमान में सर्वर की \`.env\` फ़ाइल में कोई लाइव AI कुंजी (\`GEMINI_API_KEY\`, \`OPENAI_API_KEY\`, या \`GROQ_API_KEY\`) सेट नहीं है।\n\n**लाइव AI कैसे सक्रिय करें:**\n1. प्रोजेक्ट की \`.env\` फ़ाइल खोलें।\n2. अपनी API कुंजी जोड़ें: \`GEMINI_API_KEY=your_key_here\`।\n3. फ़ाइल सेव करें — सर्वर स्वतः लाइव AI सक्रिय कर देगा।\n\n**बिना API कुंजी के अभी क्या काम करता है:**\n- **मेडिकल रिपोर्ट एनालाइज़र**: PDF और OCR टेक्स्ट निष्कर्षण, रेफरेंस रेंज की सटीक तुलना और 4-भाषा क्लिनिकल ग्लॉसरी।${docBreakdown}`,
      hinglish: `### ⚠️ Live AI Responses Ke Liye Server API Key Configure Karein\n\nCareMatric AI kabhi bhi fake AI responses generate nahi karta. Abhi server ki \`.env\` file mein koi live AI API key (\`GEMINI_API_KEY\`, \`OPENAI_API_KEY\`, ya \`GROQ_API_KEY\`) set nahi hai.\n\n**Live AI Chat, Study AI aur Coding AI kaise enable karein:**\n1. Project root mein \`.env\` file open karein.\n2. Apni key add karein: \`GEMINI_API_KEY=your_key_here\`.\n3. File save karte hi backend server live AI activate kar dega.\n\n**Bina API Key ke abhi kya-kya 100% kaam karta hai:**\n- **Medical Report Analyzer**: Real PDF & OCR extraction, reference range verification, aur 4-language Clinical Biomarker Glossary.${docBreakdown}`,
      gu: `### ⚠️ લાઇવ AI ચેટ માટે સર્વર API કી જરૂરી છે\n\nCareMatric AI ક્યારેય ખોટા (fake) AI જવાબો આપતું નથી. હાલમાં સર્વરની \`.env\` ફાઇલમાં કોઈ લાઇવ AI કી (\`GEMINI_API_KEY\`, \`OPENAI_API_KEY\`, અથવા \`GROQ_API_KEY\`) સેટ કરેલ નથી.\n\n**લાઇવ AI કેવી રીતે સક્રિય કરવું:**\n1. પ્રોજેક્ટની \`.env\` ફાઇલ ખોલો.\n2. તમારી API કી ઉમેરો: \`GEMINI_API_KEY=your_key_here\`.\n3. ફાઇલ સેવ કરો — સર્વર આપમેળે લાઇવ AI સક્રિય કરશે.${docBreakdown}`,
      ur: `### ⚠️ لائیو AI چیٹ کے لیے سرور API کلید درکار ہے\n\nCareMatric AI کبھی بھی فرضی AI جوابات پیش نہیں کرتا۔ اس وقت سرور کی \`.env\` فائل میں کوئی لائیو AI کلید (\`GEMINI_API_KEY\`، \`OPENAI_API_KEY\` یا \`GROQ_API_KEY\`) موجود نہیں ہے۔\n\n**لائیو AI فعال کرنے کا طریقہ:**\n1. پروجیکٹ کی \`.env\` فائل کھولیں۔\n2. اپنی کلید شامل کریں: \`GEMINI_API_KEY=your_key_here\`۔${docBreakdown}`,
    };

    return {
      content: unconfiguredMessages[language],
      sourceMode: 'ai_unconfigured_notice',
      safetyFlagged: false,
    };
  }

  // 3. Live AI Provider Call
  const categoryInstructions: Record<AssistantCategory, string> = {
    general:
      'You are CareMatric AI, a versatile, helpful, and accurate multifunctional AI assistant.',
    medical_report:
      'You are CareMatric AI Medical Literacy Mode. Explain laboratory parameters and health concepts clearly. Never invent test values or reference ranges, never diagnose medical conditions, and never prescribe medications or dosage changes.',
    study:
      'You are CareMatric Study AI. Provide structured study notes, clear step-by-step explanations, key takeaways, and practice quiz questions with answers.',
    coding:
      'You are CareMatric Coding AI. Provide clean, production-grade code explanations, step-by-step debugging analysis, complexity notes, and corrected code snippets.',
    document:
      'You are CareMatric Document Analysis AI. Answer questions, summarize, or extract insights strictly grounded in the user-provided document context.',
    translation:
      'You are CareMatric Translation AI. Provide accurate, natural translations preserving technical and medical nuances.',
  };

  const recentContext = history
    .slice(-6)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const docSection = documentContext?.extractedText
    ? `\n\nATTACHED DOCUMENT CONTEXT (${documentContext.fileName} via ${documentContext.extractionMethod}):\n"""\n${documentContext.extractedText.slice(0, 12000)}\n"""`
    : '';

  const systemPrompt = `${categoryInstructions[category]}
Respond in ${LANGUAGE_LABELS[language]}.
MEDICAL SAFETY RULE: Never prescribe medicines, recommend dosage adjustments, or present explanations as a definitive clinical diagnosis. Never fabricate laboratory reference ranges.
Return valid JSON matching: { "reply": "markdown formatted response in ${LANGUAGE_LABELS[language]}" }`;

  const userPrompt = `${recentContext ? `Previous Conversation:\n${recentContext}\n\n` : ''}${docSection}\n\nUser Request: ${prompt}`;

  const rawJson = await callProviderJson(config, systemPrompt, userPrompt);
  const parsed = JSON.parse(rawJson);

  return {
    content: String(parsed?.reply || 'Response generated.'),
    sourceMode: 'live_ai',
    safetyFlagged: false,
  };
}
