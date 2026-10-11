import {
  BookOpen,
  Code2,
  Cpu,
  FileSearch,
  FileSpreadsheet,
  FolderClock,
  Globe2,
  Languages,
  Menu,
  MessageSquare,
  MessageSquarePlus,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { deleteConversationThread } from '../services/api';
import { ConversationThread } from '../types/report';
import { BrandLogo } from './BrandLogo';
import { LanguageSelector } from './LanguageSelector';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    preferredLanguage,
    setPreferredLanguage,
    aiStatus,
    activeReport,
    consentedHistory,
    conversations,
    activeConversation,
    setActiveConversation,
    refreshConversations,
    startNewChat,
  } = useAppContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNewChatClick = async () => {
    setSidebarOpen(false);
    await startNewChat('general', 'New AI Chat');
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSelectConversation = (conv: ConversationThread) => {
    setSidebarOpen(false);
    setActiveConversation(conv);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleDeleteConversation = async (
    id: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteConversationThread(id);
      if (activeConversation?.id === id) {
        setActiveConversation(null);
      }
      await refreshConversations();
    } catch {
      // ignore
    }
  };

  const smartToolsNav = [
    {
      label: 'AI Assistant Home',
      path: '/',
      icon: Sparkles,
      exact: true,
    },
    {
      label: 'Medical Reports',
      path: '/medical',
      icon: Stethoscope,
      badge: 'Clinical',
    },
    ...(activeReport
      ? [
          {
            label: 'Active Report View',
            path: `/dashboard/analysis/${activeReport.id}`,
            icon: FileSpreadsheet,
            badge: `${activeReport.stats.totalTests} tests`,
          },
        ]
      : []),
    {
      label: 'Study AI',
      path: '/tools/study',
      icon: BookOpen,
    },
    {
      label: 'Coding AI',
      path: '/tools/coding',
      icon: Code2,
    },
    {
      label: 'Document Analysis',
      path: '/tools/documents',
      icon: FileSearch,
    },
    {
      label: 'Translation Studio',
      path: '/tools/translate',
      icon: Languages,
    },
    {
      label: 'Saved Medical History',
      path: '/dashboard/history',
      icon: FolderClock,
      badge:
        consentedHistory.length > 0 ? String(consentedHistory.length) : undefined,
    },
  ];

  const isPathActive = (path: string, exact?: boolean) => {
    if (path === '/medical' && location.pathname === '/dashboard') return true;
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const renderSidebarContent = () => (
    <>
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 shrink-0">
        <Link to="/" onClick={() => setSidebarOpen(false)} className="focus:outline-none">
          <BrandLogo size="md" showTagline />
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3.5 flex-1 overflow-y-auto space-y-5">
        {/* New Chat Button */}
        <div>
          <button
            type="button"
            onClick={handleNewChatClick}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-violet transition-all cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Smart Tools Navigation */}
        <nav className="space-y-1" aria-label="Smart Tools Navigation">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            Smart AI Tools
          </p>
          {smartToolsNav.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-violet-600/25 to-cyan-500/10 text-white border border-violet-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Recent Conversations List */}
        <div className="pt-3 border-t border-white/10">
          <div className="px-3 flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Recent Conversations
            </p>
            <span className="text-[10px] font-mono text-slate-500">
              {conversations.length}
            </span>
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-3 rounded-xl bg-obsidian-900/60 border border-white/5 text-[11px] text-slate-500">
              No recent conversations yet. Ask anything or select a Smart Tool to begin.
            </div>
          ) : (
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              {conversations.slice(0, 12).map((conv) => {
                const isSelected =
                  activeConversation?.id === conv.id && location.pathname === '/';
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/10 text-white font-semibold border border-white/15'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="opacity-70 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all shrink-0"
                      title="Delete conversation"
                      aria-label={`Delete conversation ${conv.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* System Status & Legal Links Footer */}
      <div className="p-3.5 border-t border-white/10 bg-obsidian-950/80 space-y-2.5 shrink-0">
        <div className="p-3 rounded-xl bg-obsidian-900/90 border border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              AI Engine
            </span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                aiStatus?.aiConfigured
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  aiStatus?.aiConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {aiStatus?.aiConfigured ? 'Live AI Active' : 'Setup Needed'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            {aiStatus?.aiConfigured
              ? `${aiStatus.activeProvider} (${aiStatus.activeModel})`
              : 'Lab Analyzer active; set GEMINI_API_KEY in .env for live LLM chat.'}
          </p>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <Link to="/overview" className="hover:text-cyan-300 transition-colors flex items-center gap-1">
            <Globe2 className="w-3 h-3" />
            <span>Overview</span>
          </Link>
          <Link to="/privacy" className="hover:text-cyan-300 transition-colors">
            Privacy
          </Link>
          <Link to="/disclaimer" className="hover:text-cyan-300 transition-colors flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Safety</span>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-obsidian-900/95 border-r border-white/10 z-30 no-print">
        {renderSidebarContent()}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-obsidian-950/85 backdrop-blur-xl border-b border-white/10 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden">
              <Link to="/">
                <BrandLogo size="sm" />
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan" />
              <span>CareMatric AI Workspace &bull; Multilingual Intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleNewChatClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-violet-400" />
              <span>New Chat</span>
            </button>

            <LanguageSelector
              value={preferredLanguage}
              onChange={setPreferredLanguage}
              variant="pills"
            />
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-obsidian-900 h-full shadow-2xl border-r border-white/10 flex flex-col z-10">
              {renderSidebarContent()}
            </div>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
