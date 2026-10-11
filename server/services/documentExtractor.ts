import { createRequire } from 'module';
import { createWorker } from 'tesseract.js';
import zlib from 'zlib';

let cachedPdfParse: ((buf: Buffer) => Promise<{ text?: string }>) | null = null;

function getPdfParse(): ((buf: Buffer) => Promise<{ text?: string }>) | null {
  if (cachedPdfParse) return cachedPdfParse;
  try {
    const req = createRequire(import.meta.url);
    cachedPdfParse = req('pdf-parse/lib/pdf-parse.js');
    return cachedPdfParse;
  } catch {
    return null;
  }
}

export interface ExtractionOutput {
  rawText: string;
  method: 'pdf_text' | 'tesseract_ocr' | 'hybrid_pdf_ocr';
  confidence: number;
  detectedFormat: 'pdf' | 'png' | 'jpeg';
}

export function validateFileMagicBytes(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): { valid: boolean; format?: 'pdf' | 'png' | 'jpeg'; error?: string } {
  if (!buffer || buffer.length < 8) {
    return { valid: false, error: 'Uploaded file is empty or corrupted.' };
  }

  // Check PDF magic header: %PDF-
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: true, format: 'pdf' };
  }

  // Check PNG magic header: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: true, format: 'png' };
  }

  // Check JPEG magic header: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: 'jpeg' };
  }

  return {
    valid: false,
    error: `Unsupported or mismatched file signature for "${originalName}" (${mimeType}). Please upload a valid PDF (.pdf), PNG (.png), or JPEG (.jpg/.jpeg) laboratory report.`,
  };
}

function decodePdfLiteralString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

function decodePdfHexString(hex: string): string {
  const clean = hex.replace(/[^0-9A-Fa-f]/g, '');
  if (!clean) return '';
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.slice(i, i + 2).padEnd(2, '0'), 16);
    if (!isNaN(byte)) bytes.push(byte);
  }
  return Buffer.from(bytes).toString('latin1');
}

function extractPdfTextNative(buffer: Buffer): string {
  const rawLatin1 = buffer.toString('latin1');
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const extractedLines: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = streamRegex.exec(rawLatin1)) !== null) {
    const streamBodyLatin1 = match[1];
    const streamBuf = Buffer.from(streamBodyLatin1, 'latin1');

    let decodedContent = '';
    try {
      decodedContent = zlib.unzipSync(streamBuf).toString('latin1');
    } catch {
      try {
        decodedContent = zlib.inflateSync(streamBuf).toString('latin1');
      } catch {
        decodedContent = streamBodyLatin1;
      }
    }

    if (!decodedContent.includes('BT') || !decodedContent.includes('ET')) {
      continue;
    }

    const btEtRegex = /BT([\s\S]*?)ET/g;
    let btMatch: RegExpExecArray | null;
    while ((btMatch = btEtRegex.exec(decodedContent)) !== null) {
      const block = btMatch[1];
      const subLines = block.split(/\r?\n/);
      let currentLine = '';

      for (const opLine of subLines) {
        if (/\b(Td|TD|T\*)\b/.test(opLine) && currentLine.trim()) {
          extractedLines.push(currentLine.trim());
          currentLine = '';
        }

        const tokenRegex = /\((?:\\.|[^\\()])*\)|<[0-9A-Fa-f\s]+>/g;
        let tok: RegExpExecArray | null;
        while ((tok = tokenRegex.exec(opLine)) !== null) {
          const t = tok[0];
          if (t.startsWith('(') && t.endsWith(')')) {
            currentLine += decodePdfLiteralString(t.slice(1, -1));
          } else if (t.startsWith('<') && t.endsWith('>')) {
            currentLine += decodePdfHexString(t.slice(1, -1));
          }
        }
      }

      if (currentLine.trim()) {
        extractedLines.push(currentLine.trim());
      }
    }
  }

  return extractedLines.join('\n').trim();
}

export async function extractTextFromDocument(
  buffer: Buffer,
  format: 'pdf' | 'png' | 'jpeg'
): Promise<ExtractionOutput> {
  if (format === 'pdf') {
    let cleanedText = '';

    try {
      const pdfParse = getPdfParse();
      if (pdfParse) {
        const data = await pdfParse(buffer);
        cleanedText = (data?.text || '').trim();
      }
    } catch {
      // Fallback to native PDF stream parser below
    }

    if (cleanedText.length < 20) {
      const nativeText = extractPdfTextNative(buffer);
      if (nativeText.length >= 20) {
        cleanedText = nativeText;
      }
    }

    if (cleanedText.length >= 20) {
      return {
        rawText: cleanedText,
        method: 'pdf_text',
        confidence: 98,
        detectedFormat: 'pdf',
      };
    }

    throw new Error(
      'This PDF appears to contain scanned images without an embedded text layer. Please upload the scanned page as a PNG or JPG image for optical character recognition (OCR), or upload a digital PDF.'
    );
  }

  // Image OCR via Tesseract.js
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
  try {
    worker = await createWorker('eng');
    const ret = await worker.recognize(buffer);
    const text = (ret?.data?.text || '').trim();
    const confidence = Math.round(ret?.data?.confidence ?? 85);

    if (!text || text.length < 10) {
      throw new Error(
        'OCR completed, but no readable text was detected in the image. Please ensure the image is well-lit, in focus, and oriented upright.'
      );
    }

    return {
      rawText: text,
      method: 'tesseract_ocr',
      confidence,
      detectedFormat: format,
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

export async function extractTextFromAnyAttachment(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{
  rawText: string;
  method: string;
  confidence: number;
  detectedFormat: string;
}> {
  const magic = validateFileMagicBytes(buffer, originalName, mimeType);
  if (magic.valid && magic.format) {
    const out = await extractTextFromDocument(buffer, magic.format);
    return {
      rawText: out.rawText,
      method: out.method === 'pdf_text' ? 'PDF Text Layer' : 'Tesseract OCR',
      confidence: out.confidence,
      detectedFormat: out.detectedFormat.toUpperCase(),
    };
  }

  // Check if plain text / markdown / code / CSV / JSON file
  const lower = originalName.toLowerCase();
  const isTextExt = /\.(txt|md|csv|json|js|jsx|ts|tsx|py|java|c|cpp|html|css|sql|xml|yaml|yml)$/i.test(
    lower
  );
  const isTextMime =
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/javascript';

  if (isTextExt || isTextMime) {
    const utf8 = buffer.toString('utf-8').trim();
    if (!utf8) {
      throw new Error(`The attached file "${originalName}" is empty.`);
    }
    return {
      rawText: utf8,
      method: 'UTF-8 Direct Text Reader',
      confidence: 100,
      detectedFormat: lower.split('.').pop()?.toUpperCase() || 'TEXT',
    };
  }

  throw new Error(
    `Unsupported file format for "${originalName}". Supported formats: PDF (.pdf), Images (.png, .jpg, .jpeg), and Text/Code files (.txt, .md, .csv, .json, .py, .ts, .js).`
  );
}
