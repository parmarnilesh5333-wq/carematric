import PDFDocument from 'pdfkit';

export interface SampleReportPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  fileName: string;
  rawText: string;
}

export const SAMPLE_REPORT_PRESETS: SampleReportPreset[] = [
  {
    id: 'comprehensive-metabolic',
    title: 'Comprehensive Metabolic, Lipid & Vitamin Panel',
    subtitle: 'Includes HbA1c, Fasting Glucose, Lipid Profile, Creatinine, Vitamin D, and an un-ranged marker',
    badge: 'Synthetic Demo #1',
    fileName: 'CareMatric_Synthetic_Metabolic_Panel.pdf',
    rawText: `APEX CLINICAL DIAGNOSTICS & PATHOLOGY LABORATORY
SYNTHETIC DEMONSTRATION REPORT (NOT REAL PATIENT DATA)
Collected On: 10 Oct 2026
Specimen Type: Fasting Venous Blood (Serum / EDTA Whole Blood)

PARAMETER | MEASURED VALUE | UNIT | REFERENCE RANGE
Hemoglobin (Hb) | 13.8 | g/dL | 13.0 - 17.0
Total Leukocyte Count (WBC) | 6.8 | 10^3/uL | 4.0 - 11.0
Platelet Count | 245 | 10^3/uL | 150 - 450
Fasting Blood Glucose | 118 | mg/dL | 70 - 99
HbA1c | 6.3 | % | 4.0 - 5.6
Total Cholesterol | 218 | mg/dL | < 200
LDL Cholesterol | 142 | mg/dL | < 100
HDL Cholesterol | 46 | mg/dL | > 40
Triglycerides | 168 | mg/dL | < 150
Serum Creatinine | 0.92 | mg/dL | 0.70 - 1.30
TSH | 2.45 | mIU/L | 0.45 - 4.50
Vitamin D (25-Hydroxy) | 18.4 | ng/mL | 30.0 - 100.0
High-Sensitivity CRP | 1.9 | mg/L | Not Provided`,
  },
  {
    id: 'anemia-thyroid-screening',
    title: 'Hematology, Thyroid & Nutritional Screening',
    subtitle: 'Demonstrates Low Hemoglobin, Low Vitamin B12, Elevated TSH, and Mild ALT elevation',
    badge: 'Synthetic Demo #2',
    fileName: 'CareMatric_Synthetic_Thyroid_Hematology.pdf',
    rawText: `METRO HEALTH REFERENCE LABORATORY
SYNTHETIC DEMONSTRATION REPORT (NOT REAL PATIENT DATA)
Collected On: 08 Oct 2026
Specimen Type: Whole Blood EDTA & Serum

PARAMETER | MEASURED VALUE | UNIT | REFERENCE RANGE
Hemoglobin (Hb) | 10.6 | g/dL | 12.0 - 15.5
Total Leukocyte Count (WBC) | 5.9 | 10^3/uL | 4.0 - 11.0
Platelet Count | 290 | 10^3/uL | 150 - 450
TSH | 6.80 | mIU/L | 0.45 - 4.50
Vitamin B12 | 164 | pg/mL | 200 - 900
Vitamin D (25-Hydroxy) | 22.0 | ng/mL | 30.0 - 100.0
ALT (SGPT) | 54 | U/L | 10 - 40
Serum Creatinine | 0.78 | mg/dL | 0.60 - 1.10`,
  },
  {
    id: 'critical-urgent-alert',
    title: 'Critical Value & Urgent-Care Guidance Demo',
    subtitle: 'Demonstrates how CareMatric AI flags severely out-of-range biomarkers for prompt clinical care',
    badge: 'Urgent Alert Demo',
    fileName: 'CareMatric_Synthetic_Urgent_Alert_Demo.pdf',
    rawText: `CITY CLINICAL PATHOLOGY CENTER
SYNTHETIC DEMONSTRATION REPORT (NOT REAL PATIENT DATA)
Collected On: 10 Oct 2026
Specimen Type: Fasting Blood Sample

PARAMETER | MEASURED VALUE | UNIT | REFERENCE RANGE
Hemoglobin (Hb) | 7.1 | g/dL | 13.0 - 17.0
Fasting Blood Glucose | 318 | mg/dL | 70 - 99
HbA1c | 10.8 | % | 4.0 - 5.6
Platelet Count | 210 | 10^3/uL | 150 - 450
Serum Creatinine | 1.15 | mg/dL | 0.70 - 1.30`,
  },
];

export function generateSamplePdfBuffer(preset: SampleReportPreset): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: Error) => reject(err));

    doc
      .fontSize(14)
      .text('CAREMATRIC AI — SYNTHETIC LABORATORY REPORT', { align: 'left' });
    doc
      .fontSize(9)
      .fillColor('#555555')
      .text('FOR EDUCATIONAL & PRODUCT TESTING ONLY — NOT REAL PATIENT DATA');
    doc.moveDown(1);

    doc.fillColor('#000000').fontSize(10);
    const lines = preset.rawText.split(/\r?\n/);
    for (const line of lines) {
      doc.text(line);
      doc.moveDown(0.35);
    }

    doc.end();
  });
}
