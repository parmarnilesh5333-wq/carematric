import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderClock,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAppContext } from '../context/AppContext';
import { deleteSingleReport, purgeAllSessionReports } from '../services/api';

export const HistoryPage: React.FC = () => {
  const {
    consentedHistory,
    refreshHistory,
    sessionId,
    resetIsolatedSession,
    isLoadingHistory,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [confirmPurgeAll, setConfirmPurgeAll] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredReports = consentedHistory.filter((rep) =>
    rep.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteOne = async (id: string, fileName: string) => {
    try {
      await deleteSingleReport(id);
      await refreshHistory();
      setStatusMessage(`Deleted "${fileName}" from your consented report history.`);
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to delete report.');
    }
  };

  const handlePurgeAll = async () => {
    try {
      const res = await purgeAllSessionReports();
      await refreshHistory();
      setConfirmPurgeAll(false);
      setStatusMessage(
        `Purged all ${res.purgedCount} saved report(s) for your isolated session.`
      );
    } catch (err: any) {
      setStatusMessage(err?.message || 'Failed to purge history.');
    }
  };

  const handleRotateSession = async () => {
    await resetIsolatedSession();
    setStatusMessage(
      'Generated a fresh, isolated session token. Previous session history is no longer linked to this browser.'
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Consent-Gated Data Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
              Secure Medical Report History &amp; Retention Controls
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              CareMatric AI only stores medical laboratory reports when you explicitly grant informed consent. All saved reports are strictly isolated to your cryptographic session identifier.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/medical"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-glow-violet transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Analyze New Report</span>
            </Link>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-xs font-bold text-emerald-300 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Session Isolation & Retention Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-obsidian-900/90 border border-white/[0.08] shadow-clinical space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Consent-Only Persistence
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unconsented medical uploads are held in volatile RAM only for active viewing and are never written to disk.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-obsidian-900/90 border border-white/[0.08] shadow-clinical space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-violet-400" />
                Session Isolation Token
              </span>
              <button
                type="button"
                onClick={handleRotateSession}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                title="Rotate isolated session token"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Rotate ID</span>
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-300 bg-obsidian-950 px-2.5 py-1.5 rounded border border-white/[0.08] truncate">
              {sessionId}
            </p>
            <p className="text-[11px] text-slate-500">
              Reports are keyed strictly to this session token and never exposed across users.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-obsidian-900/90 border border-white/[0.08] shadow-clinical space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-red-400" />
                Right to Erasure
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permanently delete individual reports or wipe all saved reports for this session at any time.
              </p>
            </div>

            {consentedHistory.length > 0 && (
              <div className="pt-1">
                {!confirmPurgeAll ? (
                  <button
                    type="button"
                    onClick={() => setConfirmPurgeAll(true)}
                    className="w-full py-2 px-3 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors"
                  >
                    Purge All Saved History ({consentedHistory.length})
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePurgeAll}
                      className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                    >
                      Confirm Purge
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmPurgeAll(false)}
                      className="py-2 px-3 rounded-lg bg-white/[0.08] text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Saved Reports Table / List */}
        <div className="rounded-2xl bg-obsidian-900/90 border border-white/[0.08] shadow-clinical overflow-hidden">
          <div className="p-5 bg-obsidian-950/60 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderClock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-white">
                Consented Saved Reports ({consentedHistory.length})
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved reports..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-obsidian-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 rounded-xl bg-white/[0.04] animate-pulse"
                />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 text-slate-400 mx-auto flex items-center justify-center">
                <FolderClock className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-bold text-white">
                  {consentedHistory.length === 0
                    ? 'No Consented Reports Stored'
                    : 'No Reports Match Your Search'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {consentedHistory.length === 0
                    ? 'When you upload or analyze a report and check "Save analyzed report to my secure Report History (Informed Consent)", it will appear here.'
                    : 'Try clearing your search filter to view all saved reports.'}
                </p>
              </div>
              {consentedHistory.length === 0 && (
                <div className="pt-2">
                  <Link
                    to="/medical"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold shadow-glow-violet"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Go to Medical Report Upload</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filteredReports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/dashboard/analysis/${rep.id}`}
                          className="text-sm font-bold text-white hover:text-cyan-300 truncate"
                        >
                          {rep.fileName}
                        </Link>
                        {rep.isSyntheticSample && (
                          <span className="px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 text-[10px] font-mono">
                            SYNTHETIC DEMO
                          </span>
                        )}
                        {rep.urgentCare.triggered && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            Critical Marker
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>
                          <strong className="text-slate-200">{rep.stats.totalTests}</strong> extracted parameters
                        </span>
                        <span>&bull;</span>
                        <span className="text-emerald-400 font-medium">
                          {rep.stats.normalCount} within range
                        </span>
                        <span>&bull;</span>
                        <span className="text-amber-400 font-medium">
                          {rep.stats.outOfRangeCount} outside range
                        </span>
                        <span>&bull;</span>
                        <span>
                          Consented:{' '}
                          {new Date(
                            rep.consentTimestamp || rep.uploadedAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      to={`/dashboard/analysis/${rep.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-semibold transition-all"
                    >
                      <span>Open Analysis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteOne(rep.id, rep.fileName)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
