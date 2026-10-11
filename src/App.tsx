import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AssistantHomePage } from './pages/AssistantHomePage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { LandingPage } from './pages/LandingPage';
import {
  DisclaimerPage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/LegalPages';
import { ReportAnalysisPage } from './pages/ReportAnalysisPage';
import {
  CodingAiPage,
  DocumentAnalysisPage,
  StudyAiPage,
  TranslationStudioPage,
} from './pages/SmartToolsPages';

const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash]);

  return null;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollManager />
        <Routes>
          <Route path="/" element={<AssistantHomePage />} />
          <Route path="/overview" element={<LandingPage />} />
          <Route path="/medical" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route
            path="/dashboard/analysis/:id"
            element={<ReportAnalysisPage />}
          />
          <Route path="/dashboard/history" element={<HistoryPage />} />
          <Route path="/tools/study" element={<StudyAiPage />} />
          <Route path="/tools/coding" element={<CodingAiPage />} />
          <Route path="/tools/documents" element={<DocumentAnalysisPage />} />
          <Route path="/tools/translate" element={<TranslationStudioPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
