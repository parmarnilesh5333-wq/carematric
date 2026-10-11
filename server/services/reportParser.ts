import {
  BiomarkerStatus,
  ExtractedBiomarker,
  LanguageSummary,
  MedicalLanguage,
  UrgentCareAlert,
  UrgentCareFlaggedTest,
} from '../../src/types/report';
import {
  buildFallbackBiomarkerExplanation,
  matchBiomarkerCatalog,
} from './clinicalGlossary';

interface ParsedRange {
  raw: string;
  min: number | null;
  max: number | null;
}

const IGNORED_HEADER_PATTERNS = [
  /^test\s+name/i,
  /^investigation/i,
  /^parameter/i,
  /^patient\s+(name|id)/i,
  /^sample\s+(date|collected|type)/i,
  /^collected\s+on/i,
  /^reported\s+on/i,
  /^age\s*\/\s*sex/i,
  /^ref(erred)?\s+by/i,
  /^page\s+\d+/i,
  /^end\s+of\s+report/i,
  /^disclaimer/i,
  /^note\s*:/i,
  /^method\s*:/i,
  /^department\s+of/i,
];

const KNOWN_UNITS =
  '(?:g\\/dL|mg\\/dL|ng\\/mL|pg\\/mL|mIU\\/L|uIU\\/mL|µIU\\/mL|IU\\/L|U\\/L|mmol\\/L|mEq\\/L|10\\^3\\/µL|10\\^3\\/uL|10\\^6\\/µL|x10\\^3\\/uL|cells\\/mcL|cells\\/cumm|\\/cumm|lakhs\\/cumm|%|fL|pg|mm\\/hr|umol\\/L|µmol\\/L|g\\/L|ng\\/dL|mL\\/min(?:\\/1\\.73m2)?)';

function parseReferenceRangeString(rawRange: string | undefined): ParsedRange | null {
  if (!rawRange) return null;
  const cleaned = rawRange.trim().replace(/^\[|\]$/g, '').trim();
  if (!cleaned || /^(n\/a|none|not\s+provided|-|--)$/i.test(cleaned)) {
    return null;
  }

  // Pattern 1: min - max (e.g., "13.2 - 16.6", "4.0 to 5.6", "70 – 99")
  const intervalMatch = cleaned.match(
    /^(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)/i
  );
  if (intervalMatch) {
    const min = parseFloat(intervalMatch[1]);
    const max = parseFloat(intervalMatch[2]);
    if (!isNaN(min) && !isNaN(max) && min <= max) {
      return { raw: cleaned, min, max };
    }
  }

  // Pattern 2: < max or <= max or "Up to max" (e.g., "< 200", "<= 100", "Up to 40")
  const upperMatch = cleaned.match(/^(?:<|<=|≤|up\s*to|less\s*than)\s*(\d+(?:\.\d+)?)/i);
  if (upperMatch) {
    const max = parseFloat(upperMatch[1]);
    if (!isNaN(max)) {
      return { raw: cleaned, min: null, max };
    }
  }

  // Pattern 3: > min or >= min (e.g., "> 40", ">= 60")
  const lowerMatch = cleaned.match(/^(?:>|>=|≥|greater\s*than)\s*(\d+(?:\.\d+)?)/i);
  if (lowerMatch) {
    const min = parseFloat(lowerMatch[1]);
    if (!isNaN(min)) {
      return { raw: cleaned, min, max: null };
    }
  }

  return null;
}

export function evaluateBiomarkerStatus(
  testName: string,
  measuredValueNumeric: number | null,
  parsedRange: ParsedRange | null
): { status: BiomarkerStatus; deviationPercent: number | null } {
  if (!parsedRange || measuredValueNumeric === null) {
    return { status: 'range_not_provided', deviationPercent: null };
  }

  const catalogEntry = matchBiomarkerCatalog(testName);

  if (parsedRange.min !== null && measuredValueNumeric < parsedRange.min) {
    const dev =
      parsedRange.min !== 0
        ? Math.round(((measuredValueNumeric - parsedRange.min) / parsedRange.min) * 100)
        : null;
    const isCritical =
      (catalogEntry?.criticalLow !== undefined &&
        measuredValueNumeric <= catalogEntry.criticalLow) ||
      (dev !== null && dev <= -45);
    return {
      status: isCritical ? 'critical_low' : 'low',
      deviationPercent: dev,
    };
  }

  if (parsedRange.max !== null && measuredValueNumeric > parsedRange.max) {
    const dev =
      parsedRange.max !== 0
        ? Math.round(((measuredValueNumeric - parsedRange.max) / parsedRange.max) * 100)
        : null;
    const isCritical =
      (catalogEntry?.criticalHigh !== undefined &&
        measuredValueNumeric >= catalogEntry.criticalHigh) ||
      (dev !== null && dev >= 85);
    return {
      status: isCritical ? 'critical_high' : 'high',
      deviationPercent: dev,
    };
  }

  return { status: 'normal', deviationPercent: 0 };
}

export function extractLabMetadata(rawText: string): {
  labName: string | null;
  reportDate: string | null;
  specimenType: string | null;
} {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let labName: string | null = null;
  let reportDate: string | null = null;
  let specimenType: string | null = null;

  for (const line of lines.slice(0, 18)) {
    if (!labName && /(diagnostics|laboratory|pathology|labs|medical\s+center|healthcare)/i.test(line)) {
      labName = line.replace(/^[#*|-]+\s*/, '').slice(0, 80);
    }
    if (!reportDate) {
      const dateMatch = line.match(
        /(?:date|reported|collected)\s*[:\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i
      );
      if (dateMatch) {
        reportDate = dateMatch[1];
      }
    }
    if (!specimenType) {
      const specMatch = line.match(
        /(?:specimen|sample\s+type)\s*[:\-]?\s*([A-Za-z0-9\s,\/()\-]{3,40})/i
      );
      if (specMatch) {
        specimenType = specMatch[1].trim();
      }
    }
  }

  return { labName, reportDate, specimenType };
}

export function parseBiomarkersFromText(rawText: string): ExtractedBiomarker[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/\t+/g, '  ').trim())
    .filter((l) => l.length >= 4);

  const extracted: ExtractedBiomarker[] = [];
  const seenNames = new Set<string>();

  // Strategy 1: Pipe or structured delimiter format:
  // e.g. "Hemoglobin (Hb) | 11.4 | g/dL | 13.0 - 17.0"
  // Strategy 2: Standard laboratory tabular row:
  // e.g. "Hemoglobin (Hb)   11.4   g/dL   13.0 - 17.0"
  // e.g. "Fasting Blood Glucose : 138 mg/dL (Ref: 70 - 99)"
  // e.g. "LDL Cholesterol   162 mg/dL   < 100"
  // e.g. "C-Reactive Protein (CRP)   4.2 mg/L" (no reference range provided)

  const regexWithUnitAndRange = new RegExp(
    `^([A-Za-z][A-Za-z0-9\\s(),.\\/-]{1,48}?)\\s*(?:\\||:|\\s{2,})\\s*(\\d+(?:\\.\\d+)?)\\s*(?:\\|\\s*)?(${KNOWN_UNITS})?\\s*(?:\\||Ref(?:erence)?(?:\\s*Range)?\\s*[:\\-]?|\\s{2,}|\\[|\\()?\\s*((?:<|<=|>|>=|up\\s*to\\s*)?\\d+(?:\\.\\d+)?(?:\\s*(?:-|–|—|to)\\s*\\d+(?:\\.\\d+)?)?)\\s*(?:\\]|\\))?(?:\\s*${KNOWN_UNITS})?$`,
    'i'
  );

  const regexWithUnitNoRange = new RegExp(
    `^([A-Za-z][A-Za-z0-9\\s(),.\\/-]{2,45}?)\\s*(?:\\||:|\\s{2,})\\s*(\\d+(?:\\.\\d+)?)\\s*(?:\\|\\s*)?(${KNOWN_UNITS})(?:\\s*\\|\\s*(?:N\\/A|Not\\s+Provided|-|--))?$`,
    'i'
  );

  for (const line of lines) {
    if (IGNORED_HEADER_PATTERNS.some((p) => p.test(line))) {
      continue;
    }

    let testName = '';
    let valueStr = '';
    let unitStr: string | null = null;
    let rangeStr: string | null = null;

    // Check pipe-separated explicitly first
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 2 && /^\d+(?:\.\d+)?$/.test(parts[1])) {
        testName = parts[0];
        valueStr = parts[1];
        unitStr = parts[2] && !/^(n\/a|-|--)$/i.test(parts[2]) ? parts[2] : null;
        rangeStr = parts[3] && !/^(n\/a|not\s+provided|-|--)$/i.test(parts[3]) ? parts[3] : null;
      }
    }

    if (!testName) {
      const m1 = line.match(regexWithUnitAndRange);
      if (m1) {
        testName = m1[1].trim().replace(/[:\-|]+$/, '').trim();
        valueStr = m1[2].trim();
        unitStr = m1[3] ? m1[3].trim() : null;
        rangeStr = m1[4] ? m1[4].trim() : null;
      } else {
        const m2 = line.match(regexWithUnitNoRange);
        if (m2) {
          testName = m2[1].trim().replace(/[:\-|]+$/, '').trim();
          valueStr = m2[2].trim();
          unitStr = m2[3] ? m2[3].trim() : null;
          rangeStr = null;
        }
      }
    }

    if (!testName || !valueStr) continue;
    if (testName.length < 2 || /^\d+$/.test(testName)) continue;
    if (/^(page|date|time|age|sex|phone|mobile|id|ref|dr\.|doctor|hospital)$/i.test(testName)) {
      continue;
    }

    const normalizedKey = testName.toLowerCase().replace(/\s+/g, ' ');
    if (seenNames.has(normalizedKey)) continue;
    seenNames.add(normalizedKey);

    const measuredValueNumeric = parseFloat(valueStr);
    const parsedRange = parseReferenceRangeString(rangeStr ?? undefined);
    const { status, deviationPercent } = evaluateBiomarkerStatus(
      testName,
      isNaN(measuredValueNumeric) ? null : measuredValueNumeric,
      parsedRange
    );

    const catalogEntry = matchBiomarkerCatalog(testName);
    const category = catalogEntry ? catalogEntry.category : 'General Laboratory Panel';
    const canonicalCode = catalogEntry ? catalogEntry.code : null;

    const explanation = buildFallbackBiomarkerExplanation(
      testName,
      status,
      valueStr,
      unitStr,
      parsedRange ? parsedRange.raw : null
    );

    extracted.push({
      id: `bio-${extracted.length + 1}`,
      testName,
      canonicalCode,
      category,
      measuredValueRaw: valueStr,
      measuredValueNumeric: isNaN(measuredValueNumeric) ? null : measuredValueNumeric,
      unit: unitStr,
      referenceRangeRaw: parsedRange ? parsedRange.raw : null,
      referenceMin: parsedRange ? parsedRange.min : null,
      referenceMax: parsedRange ? parsedRange.max : null,
      status,
      deviationPercent,
      rawSourceLine: line,
      explanation,
    });
  }

  return extracted;
}

export function buildUrgentCareAlert(biomarkers: ExtractedBiomarker[]): UrgentCareAlert {
  const criticalBiomarkers = biomarkers.filter(
    (b) => b.status === 'critical_low' || b.status === 'critical_high'
  );
  const outOfRangeBiomarkers = biomarkers.filter(
    (b) => b.status === 'low' || b.status === 'high'
  );

  if (criticalBiomarkers.length > 0) {
    const flaggedTests: UrgentCareFlaggedTest[] = criticalBiomarkers.map((b) => ({
      testName: b.testName,
      value: b.measuredValueRaw,
      unit: b.unit,
      reason: {
        en: `${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}) is significantly outside the laboratory reference interval (${b.referenceRangeRaw ?? 'N/A'}).`,
        hi: `${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}) लैब संदर्भ सीमा (${b.referenceRangeRaw ?? 'N/A'}) से काफी बाहर है।`,
        gu: `${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}) લેબ સંદર્ભ રેન્જ (${b.referenceRangeRaw ?? 'N/A'}) કરતાં ઘણું બહાર છે.`,
        ur: `${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}) لیبارٹری ریفرنس رینج (${b.referenceRangeRaw ?? 'N/A'}) سے کافی باہر ہے۔`,
      },
    }));

    return {
      triggered: true,
      severity: 'urgent',
      flaggedTests,
      guidance: {
        en: 'One or more values on this report fall into a markedly out-of-range threshold. Please contact your ordering physician or an urgent clinical care provider promptly to review these results—especially if you are experiencing symptoms such as dizziness, chest discomfort, shortness of breath, severe fatigue, or confusion.',
        hi: 'इस रिपोर्ट में एक या अधिक मान सामान्य सीमा से काफी बाहर हैं। कृपया इन परिणामों की समीक्षा के लिए तुरंत अपने डॉक्टर या नजदीकी स्वास्थ्य केंद्र से संपर्क करें—विशेषकर यदि आपको चक्कर आना, सांस लेने में तकलीफ, सीने में असहजता या अत्यधिक कमजोरी महसूस हो रही हो।',
        gu: 'આ રિપોર્ટમાં એક અથવા વધુ મૂલ્યો સામાન્ય મર્યાદા કરતાં ઘણા બહાર છે. કૃપા કરીને આ પરિણામોની સમીક્ષા માટે તાત્કાલિક તમારા ડૉક્ટર અથવા નજીકના આરોગ્ય કેન્દ્રનો સંપર્ક કરો—ખાસ કરીને જો તમને ચક્કર આવવા, શ્વાસ લેવામાં તકલીફ કે અશક્તિ અનુભવાતી હોય.',
        ur: 'اس رپورٹ میں ایک یا زائد قدریں نارمل حد سے کافی باہر ہیں۔ براہ کرم ان نتائج کے جائزے کے لیے فوری طور پر اپنے ڈاکٹر یا قریبی طبی مرکز سے رابطہ کریں، خصوصاً اگر آپ کو چکر آنے، سانس پھولنے یا شدید کمزوری کی علامات محسوس ہو رہی ہوں۔',
      },
    };
  }

  if (outOfRangeBiomarkers.length > 0) {
    return {
      triggered: false,
      severity: 'moderate',
      flaggedTests: [],
      guidance: {
        en: 'Some parameters are outside the printed laboratory reference range. Schedule a routine follow-up consultation with your physician to review these findings in the context of your health history.',
        hi: 'कुछ पैरामीटर लैब की संदर्भ सीमा से बाहर हैं। अपने स्वास्थ्य इतिहास के संदर्भ में इन परिणामों को समझने के लिए अपने डॉक्टर से परामर्श करें।',
        gu: 'કેટલાક પેરામીટર્સ લેબની સંદર્ભ રેન્જની બહાર છે. તમારા સ્વાસ્થ્ય ઇતિહાસના સંદર્ભમાં આ પરિણામો સમજવા માટે તમારા ડૉક્ટરની સલાહ લો.',
        ur: 'کچھ پیرامیٹرز لیبارٹری کی ریفرنس رینج سے باہر ہیں۔ اپنی طبی ہسٹری کی روشنی میں ان نتائج پر اپنے ڈاکٹر سے مشورہ کریں۔',
      },
    };
  }

  return {
    triggered: false,
    severity: 'none',
    flaggedTests: [],
    guidance: {
      en: 'All biomarkers with printed reference ranges fall within the laboratory intervals. Continue routine preventive care with your healthcare provider.',
      hi: 'संदर्भ सीमा वाले सभी परीक्षण लैब के सामान्य दायरे में हैं। अपने डॉक्टर के साथ नियमित स्वास्थ्य देखभाल जारी रखें।',
      gu: 'સંદર્ભ રેન્જ ધરાવતા તમામ પરીક્ષણો લેબની સામાન્ય મર્યાદામાં છે. તમારા ડૉક્ટર સાથે નિયમિત સ્વાસ્થ્ય કાળજી ચાલુ રાખો.',
      ur: 'ریفرنس رینج والے تمام ٹیسٹ لیبارٹری کی نارمل حدود میں ہیں۔ اپنے ڈاکٹر کے ساتھ معمول کی احتیاطی دیکھ بھال جاری رکھیں۔',
    },
  };
}

export function buildBaselineSummaries(
  biomarkers: ExtractedBiomarker[]
): Record<MedicalLanguage, LanguageSummary> {
  const total = biomarkers.length;
  const normal = biomarkers.filter((b) => b.status === 'normal');
  const abnormal = biomarkers.filter(
    (b) =>
      b.status === 'low' ||
      b.status === 'high' ||
      b.status === 'critical_low' ||
      b.status === 'critical_high'
  );
  const missingRange = biomarkers.filter((b) => b.status === 'range_not_provided');

  const abnormalNamesEn = abnormal
    .map(
      (b) =>
        `${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}, Ref: ${b.referenceRangeRaw})`
    )
    .join('; ');

  const doctorQuestionsEn: string[] = [];
  const doctorQuestionsHi: string[] = [];
  const doctorQuestionsGu: string[] = [];
  const doctorQuestionsUr: string[] = [];

  for (const b of abnormal) {
    const matched = matchBiomarkerCatalog(b.testName);
    if (matched) {
      doctorQuestionsEn.push(matched.doctorQuestionIfAbnormal.en);
      doctorQuestionsHi.push(matched.doctorQuestionIfAbnormal.hi);
      doctorQuestionsGu.push(matched.doctorQuestionIfAbnormal.gu);
      doctorQuestionsUr.push(matched.doctorQuestionIfAbnormal.ur);
    } else {
      doctorQuestionsEn.push(
        `Could you help me understand why my ${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}) is outside the lab reference range (${b.referenceRangeRaw})?`
      );
      doctorQuestionsHi.push(
        `कृपया मुझे समझाएं कि मेरा ${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}) लैब संदर्भ सीमा (${b.referenceRangeRaw}) से बाहर क्यों है?`
      );
      doctorQuestionsGu.push(
        `કૃપા કરીને મને સમજાવશો કે મારું ${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}) લેબ સંદર્ભ રેન્જ (${b.referenceRangeRaw}) ની બહાર કેમ છે?`
      );
      doctorQuestionsUr.push(
        `براہ کرم مجھے بتائیں کہ میرا ${b.testName} (${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''}) لیبارٹری ریفرنس رینج (${b.referenceRangeRaw}) سے باہر کیوں ہے؟`
      );
    }
  }

  if (doctorQuestionsEn.length === 0) {
    doctorQuestionsEn.push(
      'Are all of my laboratory results optimal for my age and medical history, and when should I schedule my next routine screening?'
    );
    doctorQuestionsHi.push(
      'क्या मेरी उम्र और स्वास्थ्य इतिहास के अनुसार मेरे सभी लैब परिणाम अनुकूल हैं, और मुझे अगली नियमित जांच कब करानी चाहिए?'
    );
    doctorQuestionsGu.push(
      'શું મારી ઉંમર અને સ્વાસ્થ્ય ઇતિહાસ મુજબ મારા તમામ લેબ પરિણામો યોગ્ય છે, અને મારે આગામી નિયમિત તપાસ ક્યારે કરાવવી જોઈએ?'
    );
    doctorQuestionsUr.push(
      'کیا میری عمر اور طبی ہسٹری کے مطابق میرے تمام لیب نتائج درست ہیں، اور مجھے اگلا معمول کا ٹیسٹ کب کروانا چاہیے؟'
    );
  }

  return {
    en: {
      overview:
        abnormal.length > 0
          ? `We extracted ${total} laboratory parameters from your report. ${normal.length} fall within the printed laboratory reference ranges, ${abnormal.length} are outside the printed reference ranges (${abnormalNamesEn}), and ${missingRange.length} had no reference range printed on the report.`
          : `We extracted ${total} laboratory parameters from your report. ${normal.length} fall within the laboratory reference intervals printed on the report${missingRange.length > 0 ? `, and ${missingRange.length} did not list a reference range on the report` : ''}.`,
      keyFindings: biomarkers.map((b) => {
        const rangeInfo = b.referenceRangeRaw
          ? `Lab Ref: ${b.referenceRangeRaw}`
          : 'Ref range not specified on report';
        const statusLabel =
          b.status === 'normal'
            ? 'Within Range'
            : b.status === 'range_not_provided'
              ? 'Range Not Provided'
              : b.status.replace('_', ' ').toUpperCase();
        return `${b.testName}: ${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''} (${rangeInfo}) — ${statusLabel}`;
      }),
      doctorQuestions: doctorQuestionsEn.slice(0, 5),
      lifestyleEducation: [
        'Always review laboratory results alongside your symptoms, physical examination, and prior baseline trends with a qualified physician.',
        'Do not start, stop, or change the dosage of any prescription medication or supplement based solely on automated report explanations.',
        'Hydration status, fasting duration, time of sample collection, and laboratory assay methods can influence individual biomarker readings.',
      ],
    },
    hi: {
      overview:
        abnormal.length > 0
          ? `आपकी रिपोर्ट से कुल ${total} लैब पैरामीटर निकाले गए हैं। इनमें से ${normal.length} छपी हुई संदर्भ सीमा के भीतर हैं, ${abnormal.length} संदर्भ सीमा से बाहर हैं, और ${missingRange.length} के लिए रिपोर्ट में संदर्भ सीमा मुद्रित नहीं थी।`
          : `आपकी रिपोर्ट से कुल ${total} लैब पैरामीटर निकाले गए हैं। संदर्भ सीमा वाले सभी ${normal.length} परीक्षण सामान्य सीमा के भीतर हैं।`,
      keyFindings: biomarkers.map((b) => {
        const rangeInfo = b.referenceRangeRaw
          ? `संदर्भ सीमा: ${b.referenceRangeRaw}`
          : 'रिपोर्ट में संदर्भ सीमा नहीं दी गई';
        const statusLabel =
          b.status === 'normal'
            ? 'सामान्य सीमा में'
            : b.status === 'range_not_provided'
              ? 'संदर्भ सीमा अनुपलब्ध'
              : b.status.includes('low')
                ? 'सीमा से कम (Low)'
                : 'सीमा से अधिक (High)';
        return `${b.testName}: ${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''} (${rangeInfo}) — ${statusLabel}`;
      }),
      doctorQuestions: doctorQuestionsHi.slice(0, 5),
      lifestyleEducation: [
        'हमेशा अपने लक्षणों, शारीरिक जांच और पिछली रिपोर्ट्स के साथ मिलाकर अपने डॉक्टर से इन परिणामों की समीक्षा कराएं।',
        'केवल रिपोर्ट की शैक्षिक व्याख्या के आधार पर किसी भी दवा या सप्लीमेंट को शुरू, बंद या उसकी खुराक में बदलाव न करें।',
        'सैंपल देने से पहले उपवास (फास्टिंग) की अवधि और शरीर में पानी की मात्रा जांच के परिणामों को प्रभावित कर सकती है।',
      ],
    },
    gu: {
      overview:
        abnormal.length > 0
          ? `તમારા રિપોર્ટમાંથી કુલ ${total} લેબ પેરામીટર્સ કાઢવામાં આવ્યા છે. તેમાંથી ${normal.length} છાપેલ સંદર્ભ રેન્જની અંદર છે, ${abnormal.length} સંદર્ભ રેન્જની બહાર છે, અને ${missingRange.length} માટે રિપોર્ટમાં સંદર્ભ રેન્જ આપેલ નથી.`
          : `તમારા રિપોર્ટમાંથી કુલ ${total} લેબ પેરામીટર્સ કાઢવામાં આવ્યા છે. સંદર્ભ રેન્જ ધરાવતા તમામ ${normal.length} પરીક્ષણો સામાન્ય મર્યાદામાં છે.`,
      keyFindings: biomarkers.map((b) => {
        const rangeInfo = b.referenceRangeRaw
          ? `સંદર્ભ રેન્જ: ${b.referenceRangeRaw}`
          : 'રિપોર્ટમાં સંદર્ભ રેન્જ આપેલ નથી';
        const statusLabel =
          b.status === 'normal'
            ? 'સામાન્ય રેન્જમાં'
            : b.status === 'range_not_provided'
              ? 'રેન્જ ઉપલબ્ધ નથી'
              : b.status.includes('low')
                ? 'રેન્જ કરતાં ઓછું (Low)'
                : 'રેન્જ કરતાં વધુ (High)';
        return `${b.testName}: ${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''} (${rangeInfo}) — ${statusLabel}`;
      }),
      doctorQuestions: doctorQuestionsGu.slice(0, 5),
      lifestyleEducation: [
        'હંમેશા તમારા લક્ષણો અને અગાઉના રિપોર્ટ્સ સાથે જોડીને તમારા ડૉક્ટર પાસે આ પરિણામોની સમીક્ષા કરાવો.',
        'માત્ર શૈક્ષણિક માહિતીના આધારે કોઈપણ દવા કે સપ્લીમેન્ટ શરૂ, બંધ અથવા તેના ડોઝમાં ફેરફાર કરશો નહીં.',
        'સેમ્પલ આપતા પહેલા ઉપવાસ (ફાસ્ટિંગ) નો સમય અને શરીરમાં પાણીનું પ્રમાણ ટેસ્ટના પરિણામોને અસર કરી શકે છે.',
      ],
    },
    ur: {
      overview:
        abnormal.length > 0
          ? `آپ کی رپورٹ سے کل ${total} لیبارٹری پیرامیٹرز حاصل کیے گئے ہیں۔ ان میں سے ${normal.length} درج شدہ ریفرنس رینج کے اندر ہیں، ${abnormal.length} ریفرنس رینج سے باہر ہیں، اور ${missingRange.length} کے لیے رپورٹ میں ریفرنس رینج درج نہیں تھی۔`
          : `آپ کی رپورٹ سے کل ${total} لیبارٹری پیرامیٹرز حاصل کیے گئے ہیں۔ ریفرنس رینج والے تمام ${normal.length} ٹیسٹ نارمل حدود میں ہیں۔`,
      keyFindings: biomarkers.map((b) => {
        const rangeInfo = b.referenceRangeRaw
          ? `ریفرنس رینج: ${b.referenceRangeRaw}`
          : 'ریفرنس رینج درج نہیں';
        const statusLabel =
          b.status === 'normal'
            ? 'نارمل رینج میں'
            : b.status === 'range_not_provided'
              ? 'رینج دستیاب نہیں'
              : b.status.includes('low')
                ? 'حد سے کم (Low)'
                : 'حد سے زیادہ (High)';
        return `${b.testName}: ${b.measuredValueRaw}${b.unit ? ' ' + b.unit : ''} (${rangeInfo}) — ${statusLabel}`;
      }),
      doctorQuestions: doctorQuestionsUr.slice(0, 5),
      lifestyleEducation: [
        'ہمیشہ اپنی علامات اور سابقہ رپورٹس کی روشنی میں اپنے مستند ڈاکٹر سے ان نتائج کا جائزہ کروائیں۔',
        'صرف معلوماتی وضاحت کی بنیاد پر کوئی بھی دوا خود سے شروع، بند یا اس کی خوراک میں تبدیلی نہ کریں۔',
        'ٹیسٹ سے پہلے فاسٹنگ کا دورانیہ اور جسم میں پانی کی مقدار لیبارٹری کے نتائج پر اثر انداز ہو سکتی ہے۔',
      ],
    },
  };
}
