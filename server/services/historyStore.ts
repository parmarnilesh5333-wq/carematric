import fs from 'fs';
import os from 'os';
import path from 'path';
import { ReportAnalysis } from '../../src/types/report';

const IS_SERVERLESS = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY
);

const DATA_DIR = IS_SERVERLESS
  ? path.join(os.tmpdir(), 'carematric-data')
  : path.resolve(process.cwd(), '.carematric-data');
const CONSENTED_STORE_FILE = path.join(DATA_DIR, 'consented_reports.json');

// Ephemeral in-memory store for unconsented reports (never written to disk)
const ephemeralReports = new Map<string, ReportAnalysis>();
// Fallback in-memory store for consented reports if disk is unavailable/read-only
const memoryConsentedFallback = new Map<string, ReportAnalysis>();

function ensureDataDir(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function readConsentedDiskStore(): ReportAnalysis[] {
  try {
    if (!ensureDataDir()) {
      return Array.from(memoryConsentedFallback.values());
    }
    if (!fs.existsSync(CONSENTED_STORE_FILE)) {
      return Array.from(memoryConsentedFallback.values());
    }
    const raw = fs.readFileSync(CONSENTED_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return Array.from(memoryConsentedFallback.values());
  }
}

function writeConsentedDiskStore(reports: ReportAnalysis[]) {
  memoryConsentedFallback.clear();
  for (const r of reports) {
    memoryConsentedFallback.set(r.id, r);
  }
  try {
    if (ensureDataDir()) {
      fs.writeFileSync(
        CONSENTED_STORE_FILE,
        JSON.stringify(reports, null, 2),
        'utf-8'
      );
    }
  } catch {
    // Kept safely in memoryConsentedFallback in read-only environments
  }
}

export function storeAnalyzedReport(
  report: ReportAnalysis,
  consentGranted: boolean
): ReportAnalysis {
  const updated: ReportAnalysis = {
    ...report,
    consentSaved: consentGranted,
    consentTimestamp: consentGranted ? new Date().toISOString() : null,
  };

  if (consentGranted) {
    ephemeralReports.delete(updated.id);
    const allConsented = readConsentedDiskStore().filter(
      (r) => r.id !== updated.id
    );
    allConsented.unshift(updated);
    writeConsentedDiskStore(allConsented);
  } else {
    ephemeralReports.set(updated.id, updated);
  }

  return updated;
}

export function getReportForSession(
  reportId: string,
  sessionId: string
): ReportAnalysis | null {
  const eph = ephemeralReports.get(reportId);
  if (eph && eph.sessionId === sessionId) {
    return eph;
  }

  const allConsented = readConsentedDiskStore();
  const found = allConsented.find(
    (r) => r.id === reportId && r.sessionId === sessionId
  );
  return found || null;
}

export function updateReportInStore(
  report: ReportAnalysis,
  sessionId: string
): ReportAnalysis | null {
  if (report.sessionId !== sessionId) return null;

  if (report.consentSaved) {
    const allConsented = readConsentedDiskStore();
    const idx = allConsented.findIndex(
      (r) => r.id === report.id && r.sessionId === sessionId
    );
    if (idx >= 0) {
      allConsented[idx] = report;
    } else {
      allConsented.unshift(report);
    }
    ephemeralReports.delete(report.id);
    writeConsentedDiskStore(allConsented);
    return report;
  } else {
    ephemeralReports.set(report.id, report);
    return report;
  }
}

export function grantConsentForReport(
  reportId: string,
  sessionId: string
): ReportAnalysis | null {
  const report = getReportForSession(reportId, sessionId);
  if (!report) return null;
  return storeAnalyzedReport(report, true);
}

export function listConsentedReportsForSession(
  sessionId: string
): ReportAnalysis[] {
  const allConsented = readConsentedDiskStore();
  return allConsented.filter(
    (r) => r.sessionId === sessionId && r.consentSaved
  );
}

export function deleteReportForSession(
  reportId: string,
  sessionId: string
): boolean {
  let deleted = false;
  const eph = ephemeralReports.get(reportId);
  if (eph && eph.sessionId === sessionId) {
    ephemeralReports.delete(reportId);
    deleted = true;
  }

  const allConsented = readConsentedDiskStore();
  const filtered = allConsented.filter(
    (r) => !(r.id === reportId && r.sessionId === sessionId)
  );
  if (filtered.length !== allConsented.length) {
    writeConsentedDiskStore(filtered);
    deleted = true;
  }

  return deleted;
}

export function purgeAllReportsForSession(sessionId: string): number {
  let removedCount = 0;
  for (const [key, val] of ephemeralReports.entries()) {
    if (val.sessionId === sessionId) {
      ephemeralReports.delete(key);
      removedCount++;
    }
  }

  const allConsented = readConsentedDiskStore();
  const remaining = allConsented.filter((r) => r.sessionId !== sessionId);
  removedCount += allConsented.length - remaining.length;
  writeConsentedDiskStore(remaining);
  return removedCount;
}
