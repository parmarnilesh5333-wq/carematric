import { BiomarkerStatus, MedicalLanguage } from '../../src/types/report';

export interface BiomarkerCatalogEntry {
  code: string;
  canonicalName: string;
  category: string;
  aliases: RegExp[];
  criticalLow?: number;
  criticalHigh?: number;
  whatItMeasures: Record<MedicalLanguage, string>;
  statusTemplates: {
    normal: Record<MedicalLanguage, string>;
    low: Record<MedicalLanguage, string>;
    high: Record<MedicalLanguage, string>;
    range_not_provided: Record<MedicalLanguage, string>;
  };
  educationalNote: Record<MedicalLanguage, string>;
  doctorQuestionIfAbnormal: Record<MedicalLanguage, string>;
}

export const BIOMARKER_CATALOG: BiomarkerCatalogEntry[] = [
  {
    code: 'HGB',
    canonicalName: 'Hemoglobin (Hb)',
    category: 'Complete Blood Count (CBC)',
    aliases: [/^h(a)?emoglobin\b/i, /^hb\b/i, /^hgb\b/i],
    criticalLow: 7.5,
    criticalHigh: 19.5,
    whatItMeasures: {
      en: 'An iron-rich protein in red blood cells that carries oxygen from the lungs to tissues throughout the body.',
      hi: 'लाल रक्त कोशिकाओं (RBC) में पाया जाने वाला आयरन-युक्त प्रोटीन जो फेफड़ों से पूरे शरीर के ऊतकों तक ऑक्सीजन पहुंचाता है।',
      gu: 'રક્તકણો (RBC) માં રહેલું આયર્ન-સમૃદ્ધ પ્રોટીન જે ફેફસાંમાંથી આખા શરીરના કોષો સુધી ઓક્સિજન પહોંચાડે છે.',
      ur: 'سرخ خون کے خلیوں میں موجود آئرن سے بھرپور پروٹین جو پھیپھڑوں سے پورے جسم کے خلیات تک آکسیجن پہنچاتا ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Your measured value falls within the reference interval printed on your laboratory report.',
        hi: 'आपका मापा गया मान आपकी लैब रिपोर्ट में दिए गए संदर्भ (रेफरेंस) रेंज के भीतर है।',
        gu: 'તમારું માપેલું મૂલ્ય તમારા લેબ રિપોર્ટમાં આપેલ સંદર્ભ (રેફરન્સ) રેન્જની અંદર છે.',
        ur: 'آپ کی پیمائش شدہ قدر آپ کی لیبارٹری رپورٹ پر درج ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the laboratory reference range. Lower hemoglobin is commonly discussed with clinicians in the context of iron, vitamin B12/folate nutrition, or anemia evaluation.',
        hi: 'लैब संदर्भ सीमा से कम। कम हीमोग्लोबिन की स्थिति में डॉक्टर अक्सर आयरन, विटामिन B12/फोलेट पोषण या एनीमिया की जांच पर चर्चा करते हैं।',
        gu: 'લેબ સંદર્ભ રેન્જ કરતાં ઓછું. ઓછા હિમોગ્લોબિનના કિસ્સામાં ડૉક્ટર સામાન્ય રીતે આયર્ન, વિટામિન B12/ફોલેટ પોષણ અથવા એનિમિયા અંગે તપાસ કરે છે.',
        ur: 'لیبارٹری ریفرنس رینج سے کم۔ ہیموگلوبن کی کمی کی صورت میں ڈاکٹر عموماً آئرن، وٹامن بی 12 یا خون کی کمی (انیمیا) کے حوالے سے جائزہ لیتے ہیں۔',
      },
      high: {
        en: 'Above the laboratory reference range. Elevated hemoglobin can be influenced by hydration levels, altitude, smoking, or bone marrow red cell production.',
        hi: 'लैब संदर्भ सीमा से अधिक। बढ़ा हुआ हीमोग्लोबिन शरीर में पानी की कमी (डिहाइड्रेशन), ऊंचाई वाले स्थान, या लाल रक्त कोशिकाओं के अधिक बनने से जुड़ा हो सकता है।',
        gu: 'લેબ સંદર્ભ રેન્જ કરતાં વધુ. વધેલું હિમોગ્લોબિન શરીરમાં પાણીની ઓછપ (ડિહાઇડ્રેશન) અથવા રક્તકણોના વધુ ઉત્પાદન સાથે સંબંધિત હોઈ શકે છે.',
        ur: 'لیبارٹری ریفرنس رینج سے زیادہ۔ ہیموگلوبن میں اضافہ جسم میں پانی کی کمی (ڈی ہائیڈریشن) یا دیگر عوامل سے متاثر ہو سکتا ہے۔',
      },
      range_not_provided: {
        en: 'A value was recorded on the report, but a laboratory reference range was not printed on this line.',
        hi: 'रिपोर्ट में मान दर्ज है, लेकिन इस पंक्ति में लैब संदर्भ सीमा (रेफरेंस रेंज) उपलब्ध नहीं है।',
        gu: 'રિપોર્ટમાં મૂલ્ય નોંધાયેલ છે, પરંતુ આ લાઇનમાં લેબ સંદર્ભ રેન્જ છાપેલ નથી.',
        ur: 'رپورٹ میں قدر درج ہے لیکن اس سطر میں لیبارٹری ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Reference ranges for hemoglobin vary by biological sex, age, pregnancy status, and laboratory analyzer.',
      hi: 'हीमोग्लोबिन की सामान्य सीमा उम्र, लिंग और लैब के उपकरण के अनुसार थोड़ी भिन्न हो सकती है।',
      gu: 'હિમોગ્લોબિનની સામાન્ય રેન્જ ઉંમર, જાતિ અને લેબોરેટરીના સાધનો પ્રમાણે બદલાઈ શકે છે.',
      ur: 'ہیموگلوبن کی نارمل رینج عمر، جنس اور لیبارٹری کے آلات کے مطابق مختلف ہو سکتی ہے۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'Should we check iron studies (ferritin, serum iron) or vitamin levels based on my Hemoglobin result?',
      hi: 'क्या मेरे हीमोग्लोबिन परिणाम के आधार पर आयरन प्रोफाइल (फेरिटिन) या विटामिन की जांच करानी चाहिए?',
      gu: 'શું મારા હિમોગ્લોબિનના પરિણામના આધારે આયર્ન પ્રોફાઇલ (ફેરિટિન) કે વિટામિનની તપાસ કરાવવી જોઈએ?',
      ur: 'کیا میرے ہیموگلوبن کے نتیجے کی بنیاد پر آئرن اسٹڈیز (فیریٹن) یا وٹامنز کا ٹیسٹ کروانا چاہیے؟',
    },
  },
  {
    code: 'WBC',
    canonicalName: 'Total Leukocyte Count (WBC)',
    category: 'Complete Blood Count (CBC)',
    aliases: [/^total\s+leukocyte\s+count/i, /^tlc\b/i, /^wbc(\s+count)?/i, /^white\s+blood\s+cell/i],
    criticalLow: 2.0,
    criticalHigh: 25.0,
    whatItMeasures: {
      en: 'White blood cells that form part of your immune system and help defend the body against infections and inflammation.',
      hi: 'श्वेत रक्त कोशिकाएं (WBC) जो आपकी रोग प्रतिरोधक प्रणाली का हिस्सा हैं और शरीर को संक्रमण व सूजन से बचाने में मदद करती हैं।',
      gu: 'શ્વેતકણો (WBC) જે તમારી રોગપ્રતિકારક શક્તિનો ભાગ છે અને શરીરને ચેપ તથા સોજા સામે રક્ષણ આપવામાં મદદ કરે છે.',
      ur: 'سفید خون کے خلیے (WBC) جو مدافعتی نظام کا حصہ ہیں اور جسم کو انفیکشن اور سوزش سے بچانے میں مدد دیتے ہیں۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory reference interval, suggesting a typical baseline white blood cell count.',
        hi: 'लैब की संदर्भ सीमा के भीतर है, जो सामान्य श्वेत रक्त कोशिका स्तर दर्शाता है।',
        gu: 'લેબની સંદર્ભ રેન્જની અંદર છે, જે સામાન્ય શ્વેતકણોનું પ્રમાણ દર્શાવે છે.',
        ur: 'لیبارٹری کی ریفرنس رینج کے اندر ہے، جو سفید خلیوں کی معمول کی تعداد ظاہر کرتا ہے۔',
      },
      low: {
        en: 'Below the reference interval. Lower WBC counts (leukopenia) can occur after viral illnesses, certain medications, or nutritional deficiencies.',
        hi: 'संदर्भ सीमा से कम। वायरल संक्रमण के बाद, कुछ दवाओं के प्रभाव या पोषण की कमी से WBC कम हो सकता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં ઓછું. વાયરલ તાવ પછી, અમુક દવાઓ અથવા પોષણની ઉણપથી WBC ઘટી શકે છે.',
        ur: 'ریفرنس رینج سے کم۔ وائرل بیماری کے بعد، بعض ادویات یا غذائی کمی سے سفید خلیوں کی تعداد کم ہو سکتی ہے۔',
      },
      high: {
        en: 'Above the reference interval. Elevated WBC counts (leukocytosis) often reflect an active immune response to infection, inflammation, or physical stress.',
        hi: 'संदर्भ सीमा से अधिक। बढ़ा हुआ WBC अक्सर किसी संक्रमण, सूजन या शारीरिक तनाव के प्रति प्रतिरक्षा प्रतिक्रिया को दर्शाता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં વધુ. વધેલું WBC ઘણીવાર ચેપ (ઇન્ફેક્शन), સોજા અથવા શારીરિક તણાવ સામે રોગપ્રતિકારક પ્રતિક્રિયા દર્શાવે છે.',
        ur: 'ریفرنس رینج سے زیادہ۔ سفید خلیوں کی زیادتی عموماً کسی انفیکشن، سوزش یا جسمانی تناؤ کے خلاف مدافعتی ردعمل کو ظاہر کرتی ہے۔',
      },
      range_not_provided: {
        en: 'Measured value extracted; reference range was not printed on this report row.',
        hi: 'मापा गया मान निकाला गया है; इस पंक्ति में संदर्भ सीमा मुद्रित नहीं है।',
        gu: 'માપેલું મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ છાપેલ નથી.',
        ur: 'پیمائش شدہ قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Labs may report WBC in cells/mcL (e.g., 4,000–11,000) or in 10^3/µL (e.g., 4.0–11.0). Always compare against the exact unit on your sheet.',
      hi: 'लैब WBC को cells/mcL (4,000–11,000) या 10^3/µL (4.0–11.0) में लिख सकती हैं। हमेशा अपनी रिपोर्ट की इकाई (यूनिट) से तुलना करें।',
      gu: 'લેબ WBC ને cells/mcL (4,000–11,000) અથવા 10^3/µL (4.0–11.0) માં દર્શાવી શકે છે. હંમેશા તમારા રિપોર્ટના એકમ સાથે સરખામણી કરો.',
      ur: 'لیبارٹریز WBC کو cells/mcL یا 10^3/µL میں درج کر سکتی ہیں۔ ہمیشہ اپنی رپورٹ پر درج یونٹ کے مطابق موازنہ کریں۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'Does my white blood cell count alongside my differential count suggest a recent viral or bacterial infection?',
      hi: 'क्या मेरा WBC काउंट किसी हालिया वायरल या बैक्टीरियल संक्रमण की ओर संकेत करता है?',
      gu: 'શું મારું WBC કાઉન્ટ કોઈ તાજેતરના વાયરલ કે બેક્ટેરિયલ ચેપનું સૂચન કરે છે?',
      ur: 'کیا میرا ڈبلیو بی سی کاؤنٹ کسی حالیہ وائرل یا بیکٹیریل انفیکشن کی نشاندہی کرتا ہے؟',
    },
  },
  {
    code: 'PLT',
    canonicalName: 'Platelet Count',
    category: 'Complete Blood Count (CBC)',
    aliases: [/^platelet(\s+count)?/i, /^plt\b/i],
    criticalLow: 50,
    criticalHigh: 1000,
    whatItMeasures: {
      en: 'Tiny cell fragments in blood that help form clots and stop bleeding when blood vessels are injured.',
      hi: 'रक्त में मौजूद सूक्ष्म कण जो चोट लगने पर रक्त का थक्का जमाने और रक्तस्राव रोकने में मदद करते हैं।',
      gu: 'લોહીમાં રહેલા સૂક્ષ્મ કણો જે ઈજા થાય ત્યારે લોહી ગંઠાઈ જવામાં અને кровоस्त्राव (લોહી વહેતું) અટકાવવામાં મદદ કરે છે.',
      ur: 'خون میں موجود چھوٹے ذرات جو چوٹ لگنے پر خون جمانے اور خون بہنے کو روکنے میں مدد کرتے ہیں۔',
    },
    statusTemplates: {
      normal: {
        en: 'Your platelet count is within the laboratory reference range.',
        hi: 'आपकी प्लेटलेट संख्या लैब की सामान्य संदर्भ सीमा के भीतर है।',
        gu: 'તમારા પ્લેટલેટની સંખ્યા લેબની સામાન્ય સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کے پلیٹلیٹس کی تعداد لیبارٹری کی ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the laboratory reference range (thrombocytopenia). Viral fevers, medications, or vitamin deficiencies can lower platelet counts.',
        hi: 'संदर्भ सीमा से कम। वायरल बुखार, कुछ दवाएं या विटामिन की कमी से प्लेटलेट्स कम हो सकते हैं।',
        gu: 'સંદર્ભ રેન્જ કરતાં ઓછું. વાયરલ તાવ, અમુક દવાઓ અથવા વિટામિનની ઉણપથી પ્લેટલેટ્સ ઘટી શકે છે.',
        ur: 'ریفرنس رینج سے کم۔ وائرل بخار، بعض ادویات یا وٹامن کی کمی سے پلیٹلیٹس کم ہو سکتے ہیں۔',
      },
      high: {
        en: 'Above the laboratory reference range (thrombocytosis). Reactive elevation can follow inflammation, iron deficiency, or recovery from infection.',
        hi: 'संदर्भ सीमा से अधिक। सूजन, आयरन की कमी या संक्रमण से उबरने के दौरान प्लेटलेट्स बढ़ सकते हैं।',
        gu: 'સંદર્ભ રેન્જ કરતાં વધુ. સોજો, આયર્નની ઉણપ અથવા ચેપમાંથી સાજા થતી વખતે પ્લેટલેટ્સ વધી શકે છે.',
        ur: 'ریفرنس رینج سے زیادہ۔ سوزش، آئرن کی کمی یا انفیکشن سے صحت یابی کے دوران پلیٹلیٹس بڑھ سکتے ہیں۔',
      },
      range_not_provided: {
        en: 'Value extracted from report; reference interval not listed on this line.',
        hi: 'रिपोर्ट से मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'રિપોર્ટમાંથી મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'رپورٹ سے قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Platelets are often reported in thousands/µL (e.g., 150–450 x10^3/µL) or lakhs/cumm in Indian laboratories (1.5–4.5 Lakhs).',
      hi: 'भारतीय लैब्स में प्लेटलेट्स को अक्सर हजार/µL (150–450) या लाख/cumm (1.5–4.5 लाख) में दर्शाया जाता है।',
      gu: 'ભારતીય લેબોરેટરીમાં પ્લેટલેટ્સ ઘણીવાર હજાર/µL (150–450) અથવા લાખ/cumm (1.5–4.5 લાખ) માં દર્શાવાય છે.',
      ur: 'لیبارٹریز میں پلیٹلیٹس عموماً ہزار فی مائیکرو لیٹر (150 تا 450) یا لاکھ میں درج کیے جاتے ہیں۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'Do I need a repeat platelet count or peripheral blood smear to confirm this platelet reading?',
      hi: 'क्या इस प्लेटलेट रीडिंग की पुष्टि के लिए मुझे दोबारा जांच या पेरिफेरल ब्लड स्मीयर की आवश्यकता है?',
      gu: 'શું આ પ્લેટલેટ રીડિંગની પુષ્ટિ કરવા માટે ફરીથી ટેસ્ટ કે પેરિફેરલ બ્લડ સ્મીયર કરાવવાની જરૂર છે?',
      ur: 'کیا اس پلیٹلیٹ ریڈنگ کی تصدیق کے لیے دوبارہ ٹیسٹ کروانے کی ضرورت ہے؟',
    },
  },
  {
    code: 'HBA1C',
    canonicalName: 'Glycated Hemoglobin (HbA1c)',
    category: 'Metabolic & Glycemic Control',
    aliases: [/^hba1c\b/i, /^glycated\s+h(a)?emoglobin/i, /^glycosylated\s+h(a)?emoglobin/i, /^a1c\b/i],
    criticalHigh: 10.5,
    whatItMeasures: {
      en: 'Reflects your average blood glucose (sugar) level over the past 2 to 3 months by measuring glucose attached to hemoglobin.',
      hi: 'हीमोग्लोबिन से जुड़े ग्लूकोज को मापकर पिछले 2 से 3 महीनों के आपके औसत ब्लड शुगर स्तर को दर्शाता है।',
      gu: 'હિમોગ્લોબિન સાથે જોડાયેલા ગ્લુકોઝનું માપન કરીને છેલ્લા 2 થી 3 મહિનાના તમારા સરેરાશ બ્લડ સુગર (શર્કરા) સ્તરને દર્શાવે છે.',
      ur: 'ہیموگلوبن کے ساتھ جڑے گلوکوز کی پیمائش کر کے پچھلے 2 سے 3 مہینوں کی اوسط بلڈ شوگر کی سطح کو ظاہر کرتا ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory non-diabetic reference interval printed on your report.',
        hi: 'आपकी रिपोर्ट में मुद्रित सामान्य (नॉन-डायबिटिक) संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં છાપેલ સામાન્ય સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج نارمل ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the reference interval. Can be seen with low average blood glucose or shortened red blood cell lifespan.',
        hi: 'संदर्भ सीमा से कम। यह कम औसत ब्लड शुगर या लाल रक्त कोशिकाओं के कम जीवनकाल से जुड़ा हो सकता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં ઓછું. આ ઓછી સરેરાશ બ્લડ સુગર સાથે સંબંધિત હોઈ શકે છે.',
        ur: 'ریفرنس رینج سے کم۔ یہ کم اوسط بلڈ شوگر سے منسلک ہو سکتا ہے۔',
      },
      high: {
        en: 'Above the laboratory normal reference threshold. Elevated HbA1c indicates higher average blood sugar over the past 8–12 weeks and warrants physician review.',
        hi: 'लैब की सामान्य संदर्भ सीमा से अधिक। बढ़ा हुआ HbA1c पिछले 8–12 हफ्तों में बढ़े हुए औसत ब्लड शुगर को दर्शाता है, जिस पर डॉक्टर से परामर्श करना महत्वपूर्ण है।',
        gu: 'લેબની સામાન્ય સંદર્ભ મર્યાદા કરતાં વધુ. વધેલું HbA1c છેલ્લા 8–12 અઠવાડિયામાં ઊંચા સરેરાશ બ્લડ સુગરનું સૂચન કરે છે, જેના માટે ડૉક્ટરની સલાહ જરૂરી છે.',
        ur: 'لیبارٹری کی نارمل ریفرنس حد سے زیادہ۔ بڑھا ہوا HbA1c پچھلے 8 سے 12 ہفتوں کے دوران اوسط بلڈ شوگر کی بلند سطح کو ظاہر کرتا ہے جس پر ڈاکٹر سے مشورہ ضروری ہے۔',
      },
      range_not_provided: {
        en: 'HbA1c value extracted; laboratory reference interval was not printed on this line.',
        hi: 'HbA1c मान निकाला गया; इस पंक्ति में लैब संदर्भ सीमा नहीं दी गई है।',
        gu: 'HbA1c મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં લેબ સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'HbA1c قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Because red blood cells turn over every ~90–120 days, HbA1c is not affected by a single meal on the day of the test.',
      hi: 'चूंकि लाल रक्त कोशिकाएं लगभग 90–120 दिनों में बदलती हैं, इसलिए HbA1c जांच के दिन के भोजन से तुरंत प्रभावित नहीं होता।',
      gu: 'રક્તકણો આશરે 90–120 દિવસમાં બદલાતા હોવાથી, ટેસ્ટના દિવસના ખોરાકથી HbA1c પર તાત્કાલિક અસર થતી નથી.',
      ur: 'چونکہ سرخ خون کے خلیے تقریباً 90 سے 120 دنوں میں تبدیل ہوتے ہیں، اس لیے HbA1c ٹیسٹ کے دن کے کھانے سے متاثر نہیں ہوتا۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'What target HbA1c range is appropriate for me, and what dietary or monitoring steps should we focus on over the next 3 months?',
      hi: 'मेरे लिए उपयुक्त HbA1c लक्ष्य क्या होना चाहिए, और अगले 3 महीनों में मुझे खान-पान व जीवनशैली में क्या ध्यान रखना चाहिए?',
      gu: 'મારા માટે યોગ્ય HbA1c લક્ષ્ય શું હોવું જોઈએ, અને આગામી 3 મહિનામાં મારે ખોરાક તથા જીવનશૈલીમાં શું ધ્યાન રાખવું જોઈએ?',
      ur: 'میرے لیے مناسب HbA1c ہدف کیا ہے، اور اگلے 3 مہینوں میں خوراક اور طرزِ زندگی کے حوالے سے کیا اقدامات کرنے چاہئیں؟',
    },
  },
  {
    code: 'FBG',
    canonicalName: 'Fasting Blood Glucose (Sugar)',
    category: 'Metabolic & Glycemic Control',
    aliases: [/^fasting\s+(blood\s+)?(glucose|sugar)/i, /^fbs\b/i, /^fbg\b/i, /^glucose,\s*fasting/i, /^plasma\s+glucose\s*\(?fasting\)?/i],
    criticalLow: 55,
    criticalHigh: 300,
    whatItMeasures: {
      en: 'Measures the level of glucose (sugar) in your blood after an overnight fast of at least 8–10 hours.',
      hi: 'कम से कम 8–10 घंटे के उपवास (खाली पेट) के बाद आपके रक्त में ग्लूकोज (शर्करा) के स्तर को मापता है।',
      gu: 'ઓછામાં ઓછા 8–10 કલાકના ઉપવાસ (ખાલી পেটে) પછી તમારા લોહીમાં ગ્લુકોઝ (સુગર) નું પ્રમાણ માપે છે.',
      ur: 'کم از کم 8 سے 10 گھنٹے کے فاسٹنگ (خالی پیٹ) کے بعد خون میں گلوکوز (شوگر) کی مقدار کی پیمائش کرتا ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the fasting reference range printed by your laboratory.',
        hi: 'आपकी लैब द्वारा निर्धारित खाली पेट (फास्टिंग) संदर्भ सीमा के भीतर है।',
        gu: 'તમારી લેબ દ્વારા દર્શાવેલ ફાસ્ટિંગ (ખાલી પેટે) સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی لیبارٹری کی فاسٹنگ ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the fasting reference range (hypoglycemia range). If accompanied by dizziness, sweating, or shakiness, seek medical attention promptly.',
        hi: 'फास्टिंग संदर्भ सीमा से कम (हाइपोग्लाइसीमिया)। यदि चक्कर आना, पसीना आना या कंपकंपी महसूस हो, तो तुरंत चिकित्सा सहायता लें।',
        gu: 'ફાસ્ટિંગ સંદર્ભ રેન્જ કરતાં ઓછું (હાઈપોગ્લાયકેમિયા). જો ચક્કર આવવા, પરસેવો થવો કે ધ્રુજારી જેવું લાગે તો તાત્કાલિક ડૉક્ટરનો સંપર્ક કરો.',
        ur: 'فاسٹنگ ریفرنس رینج سے کم (ہائپوگلیسیمیا)۔ اگر چکر آنے، پسینہ آنے یا کپکپی کی علامات ہوں تو فوری طبی امداد حاصل کریں۔',
      },
      high: {
        en: 'Above the fasting reference range. Elevated fasting glucose is evaluated alongside HbA1c and clinical history to assess carbohydrate metabolism.',
        hi: 'फास्टिंग संदर्भ सीमा से अधिक। बढ़े हुए फास्टिंग ग्लूकोज का मूल्यांकन डॉक्टर HbA1c और आपके स्वास्थ्य इतिहास के साथ मिलाकर करते हैं।',
        gu: 'ફાસ્ટિંગ સંદર્ભ રેન્જ કરતાં વધુ. વધેલા ફાસ્ટિંગ ગ્લુકોઝનું મૂલ્યાંકન ડૉક્ટર HbA1c અને તમારા સ્વાસ્થ્ય ઇતિહાસ સાથે મળીને કરે છે.',
        ur: 'فاسٹنگ ریفرنس رینج سے زیادہ۔ بڑھے ہوئے فاسٹنگ گلوکوز کا جائزہ ڈاکٹر HbA1c اور آپ کی طبی ہسٹری کی روشنی میں لیتے ہیں۔',
      },
      range_not_provided: {
        en: 'Fasting glucose value extracted; reference range not printed on this report row.',
        hi: 'फास्टिंग ग्लूकोज मान निकाला गया; इस पंक्ति में संदर्भ सीमा मुद्रित नहीं है।',
        gu: 'ફાસ્ટિંગ ગ્લુકોઝ મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ છાપેલ નથી.',
        ur: 'فاسٹنگ گلوکوز کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'True fasting glucose requires no caloric intake (except plain water) for 8–12 hours prior to sample collection.',
      hi: 'सटीक फास्टिंग जांच के लिए सैंपल देने से पहले 8–12 घंटे तक सादे पानी के अलावा कुछ न लेना आवश्यक होता है।',
      gu: 'સાચા ફાસ્ટિંગ રિપોર્ટ માટે સેમ્પલ આપતા પહેલા 8–12 કલાક સુધી સાદા પાણી સિવાય કંઈ ન લેવું જરૂરી છે.',
      ur: 'درست فاسٹنگ ٹیسٹ کے لیے نمونہ دینے سے پہلے 8 سے 12 گھنٹے تک سادہ پانی کے علاوہ کچھ نہ کھانا پینا ضروری ہے۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'How does my Fasting Blood Glucose compare with my HbA1c, and should I monitor post-meal glucose as well?',
      hi: 'मेरा फास्टिंग ब्लड शुगर मेरे HbA1c से कैसे मेल खाता है, और क्या मुझे खाने के बाद (PP) शुगर की भी जांच करनी चाहिए?',
      gu: 'મારું ફાસ્ટિંગ બ્લડ સુગર મારા HbA1c સાથે કેવી રીતે સુસંગત છે, અને શું મારે જમ્યા પછીના (PP) સુગરની પણ તપાસ કરવી જોઈએ?',
      ur: 'میرا فاسٹنگ بلڈ گلوکوز میرے HbA1c کے مقابلے میں کیسا ہے، اور کیا مجھے کھانے کے بعد کی شوگر بھی چیک کرنی چاہیے؟',
    },
  },
  {
    code: 'CHOL_TOTAL',
    canonicalName: 'Total Cholesterol',
    category: 'Lipid Profile (Cardiovascular)',
    aliases: [/^total\s+cholesterol/i, /^cholesterol,\s*total/i, /^serum\s+cholesterol/i],
    criticalHigh: 320,
    whatItMeasures: {
      en: 'Measures the combined amount of cholesterol particles in your blood, including HDL, LDL, and VLDL fractions.',
      hi: 'आपके रक्त में HDL, LDL और VLDL सहित कुल कोलेस्ट्रॉल की संयुक्त मात्रा को मापता है।',
      gu: 'તમારા લોહીમાં HDL, LDL અને VLDL સહિત કુલ કોલેસ્ટ્રોલનું પ્રમાણ માપે છે.',
      ur: 'آپ کے خون میں HDL، LDL اور VLDL سمیت کولیسٹرول کی کل مقدار کی پیمائش کرتا ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the desirable laboratory reference range printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई वांछनीय (सामान्य) संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ સામાન્ય સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج مناسب ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the laboratory reference interval.',
        hi: 'लैब की संदर्भ सीमा से कम।',
        gu: 'લેબની સંદર્ભ રેન્જ કરતાં ઓછું.',
        ur: 'لیبارٹری کی ریفرنس رینج سے کم۔',
      },
      high: {
        en: 'Above the desirable reference threshold. Clinicians evaluate Total Cholesterol alongside LDL, HDL, and Triglycerides to understand overall cardiovascular risk.',
        hi: 'सामान्य संदर्भ सीमा से अधिक। हृदय स्वास्थ्य का आकलन करने के लिए डॉक्टर कुल कोलेस्ट्रॉल को LDL, HDL और ट्राइग्लिसराइड्स के साथ मिलाकर देखते हैं।',
        gu: 'સામાન્ય સંદર્ભ મર્યાદા કરતાં વધુ. હૃદયના સ્વાસ્થ્યનું મૂલ્યાંકન કરવા માટે ડૉક્ટર કુલ કોલેસ્ટ્રોલને LDL, HDL અને ટ્રાઇગ્લિસરાઇડ્સ સાથે જોડીને તપાસે છે.',
        ur: 'معمول کی حد سے زیادہ۔ دل کی صحت کا جائزہ لینے کے لیے ڈاکٹر ٹوٹل کولیسٹرول کو LDL، HDL اور ٹرائی گلیسرائیڈز کے ساتھ ملا کر دیکھتے ہیں۔',
      },
      range_not_provided: {
        en: 'Total Cholesterol value extracted; reference range not listed on this line.',
        hi: 'कुल कोलेस्ट्रॉल मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'કુલ કોલેસ્ટ્રોલ મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'ٹوٹل کولیسٹرول کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Total cholesterol alone does not tell the whole story—the balance between LDL ("bad" cholesterol) and HDL ("protective" cholesterol) is equally important.',
      hi: 'केवल कुल कोलेस्ट्रॉल पूरी जानकारी नहीं देता—LDL और HDL कोलेस्ट्रॉल के बीच का संतुलन भी उतना ही महत्वपूर्ण है।',
      gu: 'માત્ર કુલ કોલેસ્ટ્રોલ પૂરતી માહિતી આપતું નથી—LDL અને HDL કોલેસ્ટ્રોલ વચ્ચેનું સંતુલન પણ એટલું જ મહત્વનું છે.',
      ur: 'صرف ٹوٹل کولیسٹرول مکمل تصویر پیش نہیں کرتا بلکہ LDL اور HDL کے درمیان توازن بھی یکساں طور پر اہم ہے۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'Based on my complete Lipid Profile and personal risk factors, can we address my cholesterol through nutrition and exercise first?',
      hi: 'मेरी पूरी लिपिड प्रोफाइल के आधार पर, क्या हम पहले आहार और व्यायाम के माध्यम से कोलेस्ट्रॉल को नियंत्रित कर सकते हैं?',
      gu: 'મારી સંપૂર્ણ લિપિડ પ્રોફાઇલના આધારે, શું આપણે પ્રથમ ખોરાક અને કસરત દ્વારા કોલેસ્ટ્રોલને નિયંત્રિત કરી શકીએ?',
      ur: 'میری مکمل لپڈ پروفائل کی بنیاد پر کیا ہم پہلے غذا اور ورزش کے ذریعے کولیسٹرول کو بہتر بنا سکتے ہیں؟',
    },
  },
  {
    code: 'LDL',
    canonicalName: 'LDL Cholesterol (Direct / Calculated)',
    category: 'Lipid Profile (Cardiovascular)',
    aliases: [/^ldl(\s+cholesterol)?/i, /^low\s+density\s+lipoprotein/i, /^ldl-c\b/i],
    criticalHigh: 220,
    whatItMeasures: {
      en: 'Low-Density Lipoprotein carries cholesterol to arteries; excess LDL can contribute to plaque buildup inside blood vessel walls over time.',
      hi: 'लो-डेंसिटी लिपोप्रोटीन (LDL) धमनियों में कोलेस्ट्रॉल ले जाता है; इसकी अधिक मात्रा समय के साथ रक्त वाहिकाओं में जमाव (प्लाक) बढ़ा सकती है।',
      gu: 'લો-ડેન્સિટી લિપોપ્રોટીન (LDL) ધમનીઓમાં કોલેસ્ટ્રોલ પહોંચાડે છે; તેનું વધારે પ્રમાણ સમય જતાં રક્તવાહિનીઓમાં પ્લાક જમા કરી શકે છે.',
      ur: 'لو ڈینسٹی لیپو پروٹین (LDL) شریانوں میں کولیسٹرول لے جاتا ہے؛ اس کی زیادتی وقت کے ساتھ خون کی نالیوں میں جماؤ کا سبب بن سکتی ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory reference range printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the upper reference limit, which is generally favorable for arterial health.',
        hi: 'संदर्भ सीमा के निचले स्तर पर है, जो सामान्यतः धमनियों के स्वास्थ्य के लिए अनुकूल माना जाता है।',
        gu: 'સંદર્ભ રેન્જની નીચલી મર્યાદામાં છે, જે સામાન્ય રીતે ધમનીઓના સ્વાસ્થ્ય માટે અનુકૂળ ગણાય છે.',
        ur: 'ریفرنس کی حد سے کم ہے جو عموماً شریانوں کی صحت کے لیے موزوں سمجھا جاتا ہے۔',
      },
      high: {
        en: 'Above the laboratory reference limit. Doctors interpret LDL targets based on your age, blood pressure, diabetes status, and family history.',
        hi: 'लैब की संदर्भ सीमा से अधिक। डॉक्टर आपकी उम्र, ब्लड प्रेशर, शुगर और पारिवारिक इतिहास के आधार पर आपके लिए सही LDL लक्ष्य तय करते हैं।',
        gu: 'લેબની સંદર્ભ મર્યાદા કરતાં વધુ. ડૉક્ટર તમારી ઉંમર, બ્લડ પ્રેશર, ડાયાબિટીસ અને કૌટુંબિક ઇતિહાસના આધારે યોગ્ય LDL લક્ષ્ય નક્કી કરે છે.',
        ur: 'لیبارٹری کی ریفرنس حد سے زیادہ۔ ڈاکٹر آپ کی عمر، بلڈ پریشر، شوگر اور خاندانی ہسٹری کو مدنظر رکھتے ہوئے LDL ہدف کا تعین کرتے ہیں۔',
      },
      range_not_provided: {
        en: 'LDL Cholesterol value extracted; reference range not printed on this report row.',
        hi: 'LDL कोलेस्ट्रॉल मान निकाला गया; इस पंक्ति में संदर्भ सीमा मुद्रित नहीं है।',
        gu: 'LDL કોલેસ્ટ્રોલ મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ છાપેલ નથી.',
        ur: 'LDL کولیسٹرول کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Soluble fiber (oats, lentils, vegetables) and reducing trans/saturated fats are common dietary topics discussed for LDL management.',
      hi: 'घुलनशील फाइबर (दलिया, दालें, सब्जियां) और संतृप्त वसा (सैचुरेटेड फैट) को कम करना LDL प्रबंधन में सहायक होता है।',
      gu: 'દ્રાવ્ય ફાઇબર (ઓટ્સ, કઠોળ, લીલા શાકભાજી) અને તળેલા/સેચ્યુરેટેડ ફેટનો ઘટાડો LDL નિયંત્રણમાં મદદરૂપ થાય છે.',
      ur: 'حل پذیر فائبر (دلیہ، دالیں، سبزیاں) اور چکنائی والی غذاؤں میں کمی LDL کو متوازن رکھنے میں مددگار ثابت ہوتی ہے۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'What is my personalized target LDL level given my overall health profile?',
      hi: 'मेरे समग्र स्वास्थ्य को देखते हुए मेरे लिए सुरक्षित LDL स्तर क्या होना चाहिए?',
      gu: 'મારા એકંદર સ્વાસ્થ્યને ધ્યાનમાં રાખીને મારા માટે સુરક્ષિત LDL સ્તર કેટલું હોવું જોઈએ?',
      ur: 'میری مجموعی صحت کے پیشِ نظر میرے لیے محفوظ LDL لیول کیا ہونا چاہیے؟',
    },
  },
  {
    code: 'HDL',
    canonicalName: 'HDL Cholesterol',
    category: 'Lipid Profile (Cardiovascular)',
    aliases: [/^hdl(\s+cholesterol)?/i, /^high\s+density\s+lipoprotein/i, /^hdl-c\b/i],
    whatItMeasures: {
      en: 'High-Density Lipoprotein helps transport excess cholesterol away from arteries back to the liver for removal.',
      hi: 'हाई-डेंसिटी लिपोप्रोटीन (HDL) धमनियों से अतिरिक्त कोलेस्ट्रॉल को वापस लिवर तक ले जाकर शरीर से बाहर निकालने में मदद करता है।',
      gu: 'હાઈ-ડેન્સિટી લિપોપ્રોટીન (HDL) ધમનીઓમાંથી વધારાનું કોલેસ્ટ્રોલ પાછું લિવર સુધી લઈ જઈને શરીરમાંથી દૂર કરવામાં મદદ કરે છે.',
      ur: 'ہائی ڈینسٹی لیپو پروٹین (HDL) شریانوں سے اضافی کولیسٹرول کو واپس جگر تک لے جا کر خارج کرنے میں مدد دیتا ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory reference range printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the reference threshold. Unlike LDL, a higher HDL level is generally considered protective for cardiovascular health.',
        hi: 'संदर्भ सीमा से कम। LDL के विपरीत, HDL ("अच्छा कोलेस्ट्रॉल") का पर्याप्त होना हृदय स्वास्थ्य के लिए सुरक्षात्मक माना जाता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં ઓછું. LDL થી વિપરીત, HDL ("સારું કોલેસ્ટ્રોલ") નું પૂરતું પ્રમાણ હૃદયના સ્વાસ્થ્ય માટે રક્ષણાત્મક ગણાય છે.',
        ur: 'ریفرنس حد سے کم۔ LDL کے برعکس، HDL (اچھا کولیسٹرول) کی مناسب مقدار دل کی صحت کے لیے مفید سمجھی جاتی ہے۔',
      },
      high: {
        en: 'Above the upper reference bound.',
        hi: 'संदर्भ सीमा के ऊपरी स्तर से अधिक।',
        gu: 'સંદર્ભ રેન્જની ઉપલી મર્યાદા કરતાં વધુ.',
        ur: 'ریفرنس کی بالائی حد سے زیادہ۔',
      },
      range_not_provided: {
        en: 'HDL Cholesterol value extracted; reference range not listed on this line.',
        hi: 'HDL कोलेस्ट्रॉल मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'HDL કોલેસ્ટ્રોલ મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'HDL کولیسٹرول کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Regular aerobic physical activity and healthy unsaturated fats (such as nuts, seeds, and olive/mustard oil in moderation) support healthy HDL levels.',
      hi: 'नियमित शारीरिक व्यायाम और संतुलित आहार स्वस्थ HDL स्तर को बनाए रखने में मदद करते हैं।',
      gu: 'નિયમિત શારીરિક કસરત અને સંતુલિત આહાર તંદુરસ્ત HDL સ્તર જાળવવામાં મદદ કરે છે.',
      ur: 'باقاعدہ جسمانی ورزش اور متوازن غذا صحت مند HDL سطح کو برقرار رکھنے میں مدد دیتی ہے۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'What lifestyle habits can help improve my HDL cholesterol alongside my overall lipid ratio?',
      hi: 'मेरी जीवनशैली में कौन से बदलाव HDL कोलेस्ट्रॉल को बेहतर बनाने में मदद कर सकते हैं?',
      gu: 'મારી જીવનશૈલીમાં કયા ફેરફારો HDL કોલેસ્ટ્રોલ સુધારવામાં મદદ કરી શકે છે?',
      ur: 'طرزِ زندگی میں کون سی تبدیلیاں میرے HDL کولیسٹرول کو بہتر بنانے میں مدد کر سکتی ہیں؟',
    },
  },
  {
    code: 'TRIG',
    canonicalName: 'Triglycerides',
    category: 'Lipid Profile (Cardiovascular)',
    aliases: [/^triglyceride(s)?\b/i, /^tg\b/i, /^serum\s+triglycerides/i],
    criticalHigh: 500,
    whatItMeasures: {
      en: 'The most common type of fat in the blood, used to store excess energy from the food and carbohydrates you consume.',
      hi: 'रक्त में पाया जाने वाला एक प्रकार का वसा (फैट), जो भोजन और कार्बोहाइड्रेट से मिलने वाली अतिरिक्त ऊर्जा को संग्रहीत करता है।',
      gu: 'લોહીમાં જોવા મળતી એક પ્રકારની ચરબી, જે ખોરાક અને કાર્બોહાઇડ્રેટ્સમાંથી મળતી વધારાની ઊર્જાનો સંગ્રહ કરે છે.',
      ur: 'خون میں پائی جانے والی چکنائی کی ایک عام قسم جو خوراک اور کاربوہائیڈریٹس سے حاصل ہونے والی اضافی توانائی کو ذخیرہ کرتی ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory reference range printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the reference interval.',
        hi: 'संदर्भ सीमा से कम।',
        gu: 'સંદર્ભ રેન્જ કરતાં ઓછું.',
        ur: 'ریفرنس رینج سے کم۔',
      },
      high: {
        en: 'Above the reference interval. Triglycerides are sensitive to recent meals, refined sugars, alcohol intake, and blood glucose balance.',
        hi: 'संदर्भ सीमा से अधिक। ट्राइग्लिसराइड्स का स्तर हालिया भोजन, मीठे/रिफाइंड कार्बोहाइड्रेट और ब्लड शुगर संतुलन से प्रभावित होता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં વધુ. ટ્રાઇગ્લિસરાઇડ્સનું પ્રમાણ તાજેતરના ખોરાક, ગળ્યા પદાર્થો અને બ્લડ સુગરના સંતુલનથી પ્રભાવિત થાય છે.',
        ur: 'ریفرنس رینج سے زیادہ۔ ٹرائی گلیسرائیڈز کی سطح حالیہ کھانے، میٹھی اشیاء اور بلڈ شوگر کے توازن سے متاثر ہوتی ہے۔',
      },
      range_not_provided: {
        en: 'Triglycerides value extracted; reference range not listed on this line.',
        hi: 'ट्राइग्लिसराइड्स मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'ટ્રાઇગ્લિસરાઇડ્સ મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'ٹرائی گلیسرائیڈز کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Triglyceride levels are most accurate when measured after a 10–12 hour overnight fast.',
      hi: '10–12 घंटे के खाली पेट (फास्टिंग) के बाद ट्राइग्लिसराइड्स की जांच सबसे सटीक परिणाम देती है।',
      gu: '10–12 કલાકના ઉપવાસ (ફાસ્ટિંગ) પછી ટ્રાઇગ્લિસરાઇડ્સનું પરીક્ષણ સૌથી સચોટ પરિણામ આપે છે.',
      ur: '10 سے 12 گھنٹے کے فاسٹنگ کے بعد ٹرائی گلیسرائیڈز کی پیمائش سب سے درست نتیجہ دیتی ہے۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'How much of my triglyceride elevation could be related to carbohydrate intake or fasting duration before the test?',
      hi: 'क्या मेरा बढ़ा हुआ ट्राइग्लिसराइड स्तर आहार में कार्बोहाइड्रेट या जांच से पहले फास्टिंग समय से संबंधित हो सकता है?',
      gu: 'શું મારું વધેલું ટ્રાઇગ્લિસરાઇડ ખોરાકમાં કાર્બોહાઇડ્રેટ અથવા ટેસ્ટ પહેલાના ફાસ્ટિંગ સમય સાથે સંબંધિત હોઈ શકે?',
      ur: 'کیا میرے ٹرائی گلیسرائیڈز میں اضافہ خوراک میں کاربوہائیڈریٹس یا ٹیسٹ سے پہلے فاسٹنگ کے دورانیے سے متعلق ہو سکتا ہے؟',
    },
  },
  {
    code: 'TSH',
    canonicalName: 'Thyroid Stimulating Hormone (TSH)',
    category: 'Thyroid Function Panel',
    aliases: [/^tsh\b/i, /^thyroid\s+stimulating\s+hormone/i, /^s\.\s*tsh/i, /^ultrasensitive\s+tsh/i],
    criticalLow: 0.05,
    criticalHigh: 20.0,
    whatItMeasures: {
      en: 'A pituitary hormone that signals the thyroid gland to produce T3 and T4 hormones, which regulate metabolism, energy, and heart rate.',
      hi: 'पिट्यूटरी ग्रंथि द्वारा स्रावित हार्मोन जो थायरॉइड ग्रंथि को T3 और T4 हार्मोन बनाने का संकेत देता है, जो शरीर के मेटाबॉलिज्म और ऊर्जा को नियंत्रित करते हैं।',
      gu: 'પિટ્યુટરી ગ્રંથિ દ્વારા ઉત્પન્ન થતો હોર્મોન જે થાઇરોઇડ ગ્રંથિને T3 અને T4 હોર્મોન બનાવવાનો સંકેત આપે છે, જે શરીરના ચયાપચય (મેટાબોલિઝમ) અને ઊર્જાનું નિયમન કરે છે.',
      ur: 'پچوٹری غدود سے خارج ہونے والا ہارمون جو تھائیرائیڈ گلینڈ کو T3 اور T4 ہارمون بنانے کا اشارہ دیتا ہے جو جسم کے میٹابولزم اور توانائی کو کنٹرول کرتے ہیں۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory euthyroid (normal) reference interval printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई सामान्य थायरॉइड संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ સામાન્ય થાઇરોઇડ સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج نارمل تھائیرائیڈ ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the reference interval. A low TSH can occur when thyroid hormone levels are high (hyperthyroidism) or when thyroid replacement dose is high.',
        hi: 'संदर्भ सीमा से कम। जब शरीर में थायरॉइड हार्मोन अधिक होता है (हाइपरथायरॉइडिज्म) तब TSH कम हो सकता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં ઓછું. જ્યારે શરીરમાં થાઇરોઇડ હોર્મોનનું પ્રમાણ વધારે હોય (હાઇપરથાઇરોઇડિઝમ) ત્યારે TSH ઓછું હોઈ શકે છે.',
        ur: 'ریفرنس رینج سے کم۔ جب جسم میں تھائیرائیڈ ہارمون کی مقدار زیادہ ہو (ہائپر تھائیرائیڈزم) تو TSH کم ہو سکتا ہے۔',
      },
      high: {
        en: 'Above the reference interval. An elevated TSH often indicates the pituitary is working harder to stimulate an underactive thyroid gland (hypothyroidism).',
        hi: 'संदर्भ सीमा से अधिक। बढ़ा हुआ TSH अक्सर यह संकेत देता है कि थायरॉइड ग्रंथि कम सक्रिय है (हाइपोथायरॉइडिज्म) और उसे अधिक संकेत की आवश्यकता पड़ रही है।',
        gu: 'સંદર્ભ રેન્જ કરતાં વધુ. વધેલું TSH ઘણીવાર દર્શાવે છે કે થાઇરોઇડ ગ્રંથિ ઓછી સક્રિય છે (હાઇપોથાઇરોઇડિઝમ).',
        ur: 'ریفرنس رینج سے زیادہ۔ بڑھا ہوا TSH عموماً اس بات کی نشاندہی کرتا ہے کہ تھائیرائیڈ غدود کم فعال ہے (ہائپو تھائیرائیڈزم)۔',
      },
      range_not_provided: {
        en: 'TSH value extracted; reference range not listed on this line.',
        hi: 'TSH मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'TSH મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'TSH کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'TSH moves in the opposite direction of thyroid gland activity: high TSH typically points toward lower thyroid hormone output, and vice versa.',
      hi: 'TSH थायरॉइड ग्रंथि की गतिविधि के विपरीत दिशा में चलता है: उच्च TSH आमतौर पर कम थायरॉइड हार्मोन उत्पादन की ओर इशारा करता है।',
      gu: 'TSH થાઇરોઇડ ગ્રંથિની સક્રિયતાની વિરુદ્ધ દિશામાં ચાલે છે: ઊંચું TSH સામાન્ય રીતે ઓછા થાઇરોઇડ હોર્મોન ઉત્પાદનનું સૂચન કરે છે.',
      ur: 'TSH تھائیرائیڈ غدود کی کارکردگی کے برعکس سمت میں چلتا ہے: بڑھا ہوا TSH عموماً تھائیرائیڈ ہارمون کی کمی کی طرف اشارہ کرتا ہے۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'Should we check Free T4, Free T3, or thyroid antibodies (Anti-TPO) to evaluate this TSH result?',
      hi: 'क्या इस TSH परिणाम के सटीक मूल्यांकन के लिए हमें Free T4, Free T3 या Anti-TPO की जांच करानी चाहिए?',
      gu: 'શું આ TSH પરિણામના મૂલ્યાંકન માટે આપણે Free T4, Free T3 કે Anti-TPO ટેસ્ટ કરાવવો જોઈએ?',
      ur: 'کیا اس TSH نتیجے کے مکمل جائزے کے لیے Free T4، Free T3 یا Anti-TPO ٹیسٹ کروانا چاہیے؟',
    },
  },
  {
    code: 'CREAT',
    canonicalName: 'Serum Creatinine',
    category: 'Kidney Function (Renal Panel)',
    aliases: [/^(serum\s+)?creatinine\b/i, /^s\.\s*creatinine/i],
    criticalHigh: 3.5,
    whatItMeasures: {
      en: 'A normal waste product from muscle metabolism that healthy kidneys filter out of the blood into urine.',
      hi: 'मांसपेशियों के मेटाबॉलिज्म से बनने वाला एक सामान्य अपशिष्ट पदार्थ, जिसे स्वस्थ गुर्दे (किडनी) रक्त से छानकर मूत्र के जरिए बाहर निकालते हैं।',
      gu: 'સ્નાયુઓના ચયાપચયમાંથી બનતો સામાન્ય કચરો, જેને તંદુરસ્ત કિડની લોહીમાંથી ગાળીને પેશાબ દ્વારા બહાર કાઢે છે.',
      ur: 'پٹھوں کے میٹابولزم سے بننے والا ایک قدرتی فاضل مادہ جسے صحت مند گردے خون سے چھان کر پیشاب کے ذریعے خارج کرتے ہیں۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory reference range printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई सामान्य संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ સામાન્ય સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج نارمل ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the reference interval, which can be associated with lower muscle mass or pregnancy.',
        hi: 'संदर्भ सीमा से कम, जो कम मांसपेशी द्रव्यमान (मसल मास) से जुड़ा हो सकता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં ઓછું, જે ઓછા સ્નાયુ દળ (મસલ માસ) સાથે સંબંધિત હોઈ શકે છે.',
        ur: 'ریفرنس رینج سے کم، جو پٹھوں کے کم حجم سے منسلک ہو سکتا ہے۔',
      },
      high: {
        en: 'Above the reference interval. Elevated creatinine can reflect dehydration, high protein/creatine intake, or reduced kidney filtration efficiency.',
        hi: 'संदर्भ सीमा से अधिक। बढ़ा हुआ क्रिएटिनिन शरीर में पानी की कमी (डिहाइड्रेशन) या गुर्दे की छानने की क्षमता में बदलाव को दर्शा सकता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં વધુ. વધેલું ક્રિએટિનિન શરીરમાં પાણીની ઓછપ (ડિહાઇડ્રેશન) અથવા કિડનીની ગાળણ ક્ષમતામાં ફેરફાર દર્શાવી શકે છે.',
        ur: 'ریفرنس رینج سے زیادہ۔ کریٹینن میں اضافہ جسم میں پانی کی کمی یا گردوں کی فلٹریشن صلاحیت میں تبدیلی کو ظاہر کر سکتا ہے۔',
      },
      range_not_provided: {
        en: 'Serum Creatinine value extracted; reference range not listed on this line.',
        hi: 'सीरम क्रिएटिनिन मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'સીરમ ક્રિએટિનિન મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'سیرم کریٹینن کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Doctors typically combine Serum Creatinine with your age and sex to calculate eGFR (estimated Glomerular Filtration Rate).',
      hi: 'डॉक्टर गुर्दे की कार्यक्षमता (eGFR) का आकलन करने के लिए सीरम क्रिएटिनिन को आपकी उम्र और लिंग के साथ मिलाकर देखते हैं।',
      gu: 'ડૉક્ટર કિડનીની કાર્યક્ષમતા (eGFR) જાણવા માટે સીરમ ક્રિએટિનિનને તમારી ઉંમર અને જાતિ સાથે જોડીને મૂલ્યાંકન કરે છે.',
      ur: 'ڈاکٹر گردوں کی کارکردگی (eGFR) کا اندازہ لگانے کے لیے سیرم کریٹینن کو عمر اور جنس کے ساتھ ملا کر دیکھتے ہیں۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'What is my calculated eGFR based on this creatinine reading, and could hydration have affected it?',
      hi: 'इस क्रिएटिनिन रीडिंग के आधार पर मेरा eGFR क्या है, और क्या पानी की मात्रा से इस पर असर पड़ा हो सकता है?',
      gu: 'આ ક્રિએટિનિન રીડિંગના આધારે મારું eGFR કેટલું છે, અને શું પાણીની માત્રાની તેના પર અસર થઈ હોઈ શકે?',
      ur: 'اس کریٹینن ریڈنگ کی بنیاد پر میرا eGFR کیا ہے، اور کیا پانی کی کمی سے اس پر اثر پڑا ہو سکتا ہے؟',
    },
  },
  {
    code: 'VIT_D',
    canonicalName: 'Vitamin D (25-Hydroxy)',
    category: 'Vitamins & Nutritional Markers',
    aliases: [/^vitamin\s*d\b/i, /^25\s*-?\s*(oh|hydroxy)\s*vitamin\s*d/i, /^25\(oh\)d/i],
    criticalLow: 8.0,
    criticalHigh: 120.0,
    whatItMeasures: {
      en: 'Measures 25-hydroxyvitamin D, the primary circulating store of Vitamin D essential for calcium absorption, bone strength, and immune function.',
      hi: '25-हाइड्रॉक्सीविटामिन D को मापता है, जो कैल्शियम के अवशोषण, हड्डियों की मजबूती और रोग प्रतिरोधक क्षमता के लिए आवश्यक है।',
      gu: '25-હાઇડ્રોક્સીવિટામિન D નું માપન કરે છે, જે કેલ્શિયમના શોષણ, હાડકાંની મજબૂતી અને રોગપ્રતિકારક શક્તિ માટે અત્યંત જરૂરી છે.',
      ur: 'وٹامن ڈی کے ذخیرے کی پیمائش کرتا ہے جو کیلشیم کے جذب ہونے، ہڈیوں کی مضبوطی اور مدافعتی نظام کے لیے ضروری ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the sufficient laboratory reference interval printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई पर्याप्त (सफिशिएंट) संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ પૂરતી (સફિશિયન્ટ) સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج مناسب ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the sufficiency reference threshold. Vitamin D insufficiency or deficiency is very common and is easily discussed with your physician.',
        hi: 'संदर्भ सीमा से कम। विटामिन D की कमी बहुत आम है और इस पर अपने डॉक्टर से परामर्श करना उपयोगी होता है।',
        gu: 'સંદર્ભ મર્યાદા કરતાં ઓછું. વિટામિન D ની ઉણપ ખૂબ જ સામાન્ય છે અને તે અંગે તમારા ડૉક્ટર સાથે ચર્ચા કરી શકાય છે.',
        ur: 'ریفرنس حد سے کم۔ وٹامن ڈی کی کمی بہت عام ہے اور اس بارے میں اپنے ڈاکٹر سے مشورہ کرنا مفید ہوتا ہے۔',
      },
      high: {
        en: 'Above the laboratory reference interval. Excessively high Vitamin D is usually related to high-dose supplementation.',
        hi: 'लैब संदर्भ सीमा से अधिक। विटामिन D का अधिक स्तर आमतौर पर सप्लीमेंट्स के अधिक सेवन से जुड़ा होता है।',
        gu: 'લેબ સંદર્ભ રેન્જ કરતાં વધુ. વિટામિન D નું ઊંચું પ્રમાણ સામાન્ય રીતે સપ્લીમેન્ટ્સના વધુ પડતા ઉપયોગ સાથે સંબંધિત હોય છે.',
        ur: 'لیبارٹری ریفرنس رینج سے زیادہ۔ وٹامن ڈی کی زیادتی عموماً سپلیمنٹس کے زیادہ استعمال سے وابستہ ہوتی ہے۔',
      },
      range_not_provided: {
        en: 'Vitamin D value extracted; reference range not listed on this line.',
        hi: 'विटामिन D मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'વિટામિન D મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'وٹامن ڈی کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Labs may report Vitamin D in ng/mL or nmol/L. Never start high-dose supplements without consulting your doctor for the right schedule.',
      hi: 'लैब विटामिन D को ng/mL या nmol/L में रिपोर्ट कर सकती हैं। बिना डॉक्टर की सलाह के उच्च खुराक वाले सप्लीमेंट शुरू न करें।',
      gu: 'લેબ વિટામિન D ને ng/mL અથવા nmol/L માં દર્શાવી શકે છે. ડૉક્ટરની સલાહ વિના હાઈ-ડોઝ સપ્લીમેન્ટ્સ શરૂ ન કરો.',
      ur: 'لیبارٹریز وٹامن ڈی کو ng/mL یا nmol/L میں درج کر سکتی ہیں۔ ڈاکٹر کے مشورے کے بغیر ہائی ڈوز سپلیمنٹس شروع نہ کریں۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'Based on my Vitamin D reading, do I need supplementation, and should we check serum calcium as well?',
      hi: 'मेरे विटामिन D परिणाम के आधार पर क्या मुझे सप्लीमेंट की आवश्यकता है, और क्या कैल्शियम की भी जांच करनी चाहिए?',
      gu: 'મારા વિટામિન D ના પરિણામના આધારે શું મારે સપ્લીમેન્ટની જરૂર છે, અને શું કેલ્શિયમની પણ તપાસ કરવી જોઈએ?',
      ur: 'میرے وٹامن ڈی کے نتیجے کی بنیاد پر کیا مجھے سپلیمنٹ کی ضرورت ہے، اور کیا کیلشیم کا ٹیسٹ بھی کروانا چاہیے؟',
    },
  },
  {
    code: 'VIT_B12',
    canonicalName: 'Vitamin B12 (Cyanocobalamin)',
    category: 'Vitamins & Nutritional Markers',
    aliases: [/^vitamin\s*b\s*-?12/i, /^cobalamin/i, /^serum\s+b12/i],
    criticalLow: 120,
    whatItMeasures: {
      en: 'An essential water-soluble vitamin required for healthy nerve function, DNA synthesis, and red blood cell production.',
      hi: 'तंत्रिका तंत्र (नर्वस सिस्टम) के कार्य, डीएनए निर्माण और लाल रक्त कोशिकाओं के बनने के लिए आवश्यक एक महत्वपूर्ण विटामिन।',
      gu: 'ચેતાતંત્ર (નર્વસ સિસ્ટમ) ની કામગીરી, ડીએનએ નિર્માણ અને રક્તકણોના ઉત્પાદન માટે જરૂરી એક મહત્વપૂર્ણ વિટામિન.',
      ur: 'اعصابی نظام کی کارکردگی، ڈی این اے کی تیاری اور سرخ خون کے خلیات بنانے کے لیے ضروری ایک اہم وٹامن۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory reference interval printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below the laboratory reference interval. Low B12 is common in vegetarian/vegan diets or reduced gastrointestinal absorption.',
        hi: 'संदर्भ सीमा से कम। शाकाहारी आहार या पाचन तंत्र में कम अवशोषण के कारण विटामिन B12 की कमी आम है।',
        gu: 'સંદર્ભ રેન્જ કરતાં ઓછું. શાકાહારી ખોરાક અથવા પાચનતંત્રમાં ઓછા શોષણને કારણે વિટામિન B12 ની ઉણપ સામાન્ય છે.',
        ur: 'ریفرنس رینج سے کم۔ سبزی خور غذا یا نظامِ ہاضمہ میں کم جذب ہونے کی وجہ سے وٹامن بی 12 کی کمی عام ہے۔',
      },
      high: {
        en: 'Above the laboratory reference interval, often seen with recent multivitamin or B-complex intake.',
        hi: 'लैब संदर्भ सीमा से अधिक, जो अक्सर हाल ही में लिए गए मल्टीविटामिन या B-कॉम्प्लेक्स से जुड़ा होता है।',
        gu: 'લેબ સંદર્ભ રેન્જ કરતાં વધુ, જે ઘણીવાર તાજેતરમાં લીધેલા મલ્ટિવિટામિન કે B-કોમ્પ્લેક્સને કારણે જોવા મળે છે.',
        ur: 'ریفرنس رینج سے زیادہ، جو اکثر حالیہ ملٹی وٹامن یا بی کمپلیکس کے استعمال کی وجہ سے ہوتا ہے۔',
      },
      range_not_provided: {
        en: 'Vitamin B12 value extracted; reference range not listed on this line.',
        hi: 'विटामिन B12 मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'વિટામિન B12 મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'وٹامن بی 12 کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Vitamin B12 works closely with folate and iron to maintain healthy red blood cell size and energy levels.',
      hi: 'विटामिन B12 स्वस्थ लाल रक्त कोशिकाओं और ऊर्जा स्तर को बनाए रखने के लिए फोलेट और आयरन के साथ मिलकर काम करता है।',
      gu: 'વિટામિન B12 તંદુરસ્ત રક્તકણો અને ઊર્જાનું સ્તર જાળવવા માટે ફોલેટ અને આયર્ન સાથે મળીને કામ કરે છે.',
      ur: 'وٹامن بی 12 صحت مند سرخ خلیات اور توانائی کی سطح برقرار رکھنے کے لیے فولیٹ اور آئرن کے ساتھ مل کر کام کرتا ہے۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'What dietary sources or B12 replacement options do you recommend for my Vitamin B12 level?',
      hi: 'मेरे विटामिन B12 स्तर को सुधारने के लिए आप किन आहार स्रोतों या विकल्पों की सलाह देंगे?',
      gu: 'મારા વિટામિન B12 ના સ્તરને સુધારવા માટે તમે કયા આહાર સ્ત્રોતો કે વિકલ્પોની ભલામણ કરશો?',
      ur: 'میرے وٹامن بی 12 کے لیول کو بہتر بنانے کے لیے آپ کون سے غذائی ذرائع تجویز کریں گے؟',
    },
  },
  {
    code: 'ALT',
    canonicalName: 'ALT (SGPT)',
    category: 'Liver Function (Hepatic Panel)',
    aliases: [/^alt\b/i, /^sgpt\b/i, /^alanine\s+(amino)?transferase/i],
    criticalHigh: 250,
    whatItMeasures: {
      en: 'An enzyme found predominantly in liver cells; when liver cells are stressed or inflamed, ALT can be released into the bloodstream.',
      hi: 'मुख्य रूप से लिवर की कोशिकाओं में पाया जाने वाला एंजाइम; लिवर पर दबाव या सूजन होने पर रक्त में इसका स्तर बढ़ सकता है।',
      gu: 'મુખ્યત્વે લિવરના કોષોમાં જોવા મળતું એન્ઝાઇમ; જ્યારે લિવરના કોષો પર તણાવ કે સોજો આવે ત્યારે લોહીમાં તેનું પ્રમાણ વધી શકે છે.',
      ur: 'بنیادی طور پر جگر کے خلیوں میں پایا جانے والا انزائم؛ جگر کے خلیات پر دباؤ یا سوزش کی صورت میں یہ خون میں شامل ہو سکتا ہے۔',
    },
    statusTemplates: {
      normal: {
        en: 'Within the laboratory reference interval printed on your report.',
        hi: 'आपकी रिपोर्ट में दी गई संदर्भ सीमा के भीतर है।',
        gu: 'તમારા રિપોર્ટમાં આપેલ સંદર્ભ રેન્જની અંદર છે.',
        ur: 'آپ کی رپورٹ پر درج ریفرنس رینج کے اندر ہے۔',
      },
      low: {
        en: 'Below or near the lower bound of the reference interval, which is generally normal.',
        hi: 'संदर्भ सीमा के निचले स्तर पर है, जो सामान्यतः सामान्य माना जाता है।',
        gu: 'સંદર્ભ રેન્જની નીચલી મર્યાદા પાસે છે, જે સામાન્ય રીતે નોર્મલ ગણાય છે.',
        ur: 'ریفرنس رینج کی نچلی حد کے قریب ہے جو عموماً نارمل سمجھا جاتا ہے۔',
      },
      high: {
        en: 'Above the laboratory reference interval. Mild elevations can be associated with fatty liver, medications, viral infections, or intense exercise.',
        hi: 'संदर्भ सीमा से अधिक। हल्का बढ़ा हुआ SGPT/ALT फैटी लिवर, कुछ दवाओं, वायरल संक्रमण या भारी व्यायाम से जुड़ा हो सकता है।',
        gu: 'સંદર્ભ રેન્જ કરતાં વધુ. SGPT/ALT માં સામાન્ય વધારો ફેટી લિવર, અમુક દવાઓ કે વાયરલ ચેપ સાથે સંબંધિત હોઈ શકે છે.',
        ur: 'ریفرنس رینج سے زیادہ۔ SGPT/ALT میں معمولی اضافہ فیٹی لیور، بعض ادویات یا وائرل انفیکشن سے منسلک ہو سکتا ہے۔',
      },
      range_not_provided: {
        en: 'ALT (SGPT) value extracted; reference range not listed on this line.',
        hi: 'ALT (SGPT) मान निकाला गया; इस पंक्ति में संदर्भ सीमा सूचीबद्ध नहीं है।',
        gu: 'ALT (SGPT) મૂલ્ય કાઢવામાં આવ્યું છે; આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.',
        ur: 'ALT (SGPT) کی قدر حاصل کی گئی ہے؛ اس سطر میں ریفرنس رینج درج نہیں ہے۔',
      },
    },
    educationalNote: {
      en: 'Clinicians review ALT alongside AST (SGOT), Alkaline Phosphatase, and Bilirubin to get a complete view of liver health.',
      hi: 'लिवर के संपूर्ण स्वास्थ्य को समझने के लिए डॉक्टर ALT (SGPT) को AST (SGOT) और बिलीरुबिन के साथ मिलाकर देखते हैं।',
      gu: 'લિવરના સંપૂર્ણ સ્વાસ્થ્યને સમજવા માટે ડૉક્ટર ALT (SGPT) ને AST (SGOT) અને બિલિરુબિન સાથે જોડીને તપાસે છે.',
      ur: 'جگر کی مکمل صحت کو سمجھنے کے لیے ڈاکٹر ALT کو AST اور بلیروبن کے ساتھ ملا کر دیکھتے ہیں۔',
    },
    doctorQuestionIfAbnormal: {
      en: 'Could my elevated ALT (SGPT) be related to metabolic/fatty liver factors or any current medications?',
      hi: 'क्या मेरा बढ़ा हुआ ALT (SGPT) फैटी लिवर या मेरी किसी वर्तमान दवा से संबंधित हो सकता है?',
      gu: 'શું મારું વધેલું ALT (SGPT) ફેટી લિવર અથવા મારી કોઈ ચાલુ દવા સાથે સંબંધિત હોઈ શકે છે?',
      ur: 'کیا میرا بڑھا ہوا ALT (SGPT) فیٹی لیور یا کسی موجودہ دوا سے متعلق ہو سکتا ہے؟',
    },
  },
];

export function matchBiomarkerCatalog(testName: string): BiomarkerCatalogEntry | null {
  const cleaned = testName.trim();
  for (const entry of BIOMARKER_CATALOG) {
    if (entry.aliases.some((regex) => regex.test(cleaned))) {
      return entry;
    }
  }
  return null;
}

export function buildFallbackBiomarkerExplanation(
  testName: string,
  status: BiomarkerStatus,
  measuredValueRaw: string,
  unit: string | null,
  referenceRangeRaw: string | null
): Record<
  MedicalLanguage,
  {
    whatItMeasures: string;
    whatResultMeans: string;
    educationalNote: string;
    sourceType: 'clinical_glossary';
  }
> {
  const matched = matchBiomarkerCatalog(testName);
  const valStr = `${measuredValueRaw}${unit ? ` ${unit}` : ''}`;
  const rangeStr = referenceRangeRaw || null;

  if (matched) {
    const templateKey =
      status === 'critical_low'
        ? 'low'
        : status === 'critical_high'
          ? 'high'
          : status;

    return {
      en: {
        whatItMeasures: matched.whatItMeasures.en,
        whatResultMeans: `${matched.statusTemplates[templateKey].en} (Extracted: ${valStr}${rangeStr ? `, Lab Reference: ${rangeStr}` : ''}).`,
        educationalNote: matched.educationalNote.en,
        sourceType: 'clinical_glossary',
      },
      hi: {
        whatItMeasures: matched.whatItMeasures.hi,
        whatResultMeans: `${matched.statusTemplates[templateKey].hi} (रिपोर्ट मान: ${valStr}${rangeStr ? `, संदर्भ सीमा: ${rangeStr}` : ''})।`,
        educationalNote: matched.educationalNote.hi,
        sourceType: 'clinical_glossary',
      },
      gu: {
        whatItMeasures: matched.whatItMeasures.gu,
        whatResultMeans: `${matched.statusTemplates[templateKey].gu} (રિપોર્ટ મૂલ્ય: ${valStr}${rangeStr ? `, સંદર્ભ રેન્જ: ${rangeStr}` : ''}).`,
        educationalNote: matched.educationalNote.gu,
        sourceType: 'clinical_glossary',
      },
      ur: {
        whatItMeasures: matched.whatItMeasures.ur,
        whatResultMeans: `${matched.statusTemplates[templateKey].ur} (رپورٹ قدر: ${valStr}${rangeStr ? `، ریفرنس رینج: ${rangeStr}` : ''})۔`,
        educationalNote: matched.educationalNote.ur,
        sourceType: 'clinical_glossary',
      },
    };
  }

  // Generic safe educational explanation for any arbitrary laboratory test extracted from a report
  const genericStatusEn =
    status === 'normal'
      ? `Your measured value (${valStr}) is within the laboratory reference range (${rangeStr}) printed on your report.`
      : status === 'low' || status === 'critical_low'
        ? `Your measured value (${valStr}) is below the laboratory reference range (${rangeStr}) printed on your report.`
        : status === 'high' || status === 'critical_high'
          ? `Your measured value (${valStr}) is above the laboratory reference range (${rangeStr}) printed on your report.`
          : `Your measured value (${valStr}) was extracted from the report. No reference range was printed on this line, so no range comparison is made.`;

  const genericStatusHi =
    status === 'normal'
      ? `आपका मापा गया मान (${valStr}) आपकी रिपोर्ट में दी गई संदर्भ सीमा (${rangeStr}) के भीतर है।`
      : status === 'low' || status === 'critical_low'
        ? `आपका मापा गया मान (${valStr}) आपकी रिपोर्ट में दी गई संदर्भ सीमा (${rangeStr}) से कम है।`
        : status === 'high' || status === 'critical_high'
          ? `आपका मापा गया मान (${valStr}) आपकी रिपोर्ट में दी गई संदर्भ सीमा (${rangeStr}) से अधिक है।`
          : `आपका मापा गया मान (${valStr}) रिपोर्ट से निकाला गया है। इस पंक्ति में कोई संदर्भ सीमा मुद्रित नहीं है।`;

  const genericStatusGu =
    status === 'normal'
      ? `તમારું માપેલું મૂલ્ય (${valStr}) તમારા રિપોર્ટમાં આપેલ સંદર્ભ રેન્જ (${rangeStr}) ની અંદર છે.`
      : status === 'low' || status === 'critical_low'
        ? `તમારું માપેલું મૂલ્ય (${valStr}) તમારા રિપોર્ટમાં આપેલ સંદર્ભ રેન્જ (${rangeStr}) કરતાં ઓછું છે.`
        : status === 'high' || status === 'critical_high'
          ? `તમારું માપેલું મૂલ્ય (${valStr}) તમારા રિપોર્ટમાં આપેલ સંદર્ભ રેન્જ (${rangeStr}) કરતાં વધુ છે.`
          : `તમારું માપેલું મૂલ્ય (${valStr}) રિપોર્ટમાંથી કાઢવામાં આવ્યું છે. આ લાઇનમાં સંદર્ભ રેન્જ આપેલ નથી.`;

  const genericStatusUr =
    status === 'normal'
      ? `آپ کی پیمائش شدہ قدر (${valStr}) رپورٹ پر درج ریفرنس رینج (${rangeStr}) کے اندر ہے۔`
      : status === 'low' || status === 'critical_low'
        ? `آپ کی پیمائش شدہ قدر (${valStr}) رپورٹ پر درج ریفرنس رینج (${rangeStr}) سے کم ہے۔`
        : status === 'high' || status === 'critical_high'
          ? `آپ کی پیمائش شدہ قدر (${valStr}) رپورٹ پر درج ریفرنس رینج (${rangeStr}) سے زیادہ ہے۔`
          : `آپ کی پیمائش شدہ قدر (${valStr}) رپورٹ سے حاصل کی گئی ہے۔ اس سطر میں ریفرنس رینج درج نہیں ہے۔`;

  return {
    en: {
      whatItMeasures: `Laboratory parameter (${testName}) measured on your diagnostic report.`,
      whatResultMeans: genericStatusEn,
      educationalNote: 'Share this laboratory parameter with your ordering clinician to interpret it in the context of your medical history.',
      sourceType: 'clinical_glossary',
    },
    hi: {
      whatItMeasures: `आपकी जांच रिपोर्ट में मापा गया प्रयोगशाला पैरामीटर (${testName})।`,
      whatResultMeans: genericStatusHi,
      educationalNote: 'अपने स्वास्थ्य इतिहास के संदर्भ में इसे समझने के लिए इस परिणाम को अपने डॉक्टर को दिखाएं।',
      sourceType: 'clinical_glossary',
    },
    gu: {
      whatItMeasures: `તમારા ડાયગ્નોસ્ટિક રિપોર્ટમાં માપવામાં આવેલ લેબોરેટરી પેરામીટર (${testName}).`,
      whatResultMeans: genericStatusGu,
      educationalNote: 'તમારા સ્વાસ્થ્ય ઇતિહાસના સંદર્ભમાં આ પરિણામ સમજવા માટે તમારા ડૉક્ટરની સલાહ લો.',
      sourceType: 'clinical_glossary',
    },
    ur: {
      whatItMeasures: `آپ کی تشخیصی رپورٹ میں ماپا گیا لیبارٹری پیرامیٹر (${testName})۔`,
      whatResultMeans: genericStatusUr,
      educationalNote: 'اپنی طبی ہسٹری کے تناظر میں اس نتیجے کو سمجھنے کے لیے اپنے ڈاکٹر سے مشورہ کریں۔',
      sourceType: 'clinical_glossary',
    },
  };
}
