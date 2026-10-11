import { ArrowLeft, FileText, Lock, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-3 border-b border-white/[0.08] pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CareMatric AI Workspace</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Privacy Policy &amp; Data Minimization Architecture
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Last Updated: October 2026 &bull; CareMatric AI Clinical &amp; Platform Governance
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              1. Core Principle: Data Minimization &amp; Ephemeral Default
            </h2>
            <p>
              CareMatric AI is built around strict healthcare and document data minimization. When you upload a PDF, PNG, or JPG laboratory report or document, the file buffer is processed in volatile server memory to extract text, measured values, units, and printed reference ranges. Raw uploaded file binaries are discarded immediately after text extraction.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              2. Informed Consent Before Medical History Storage
            </h2>
            <p>
              By default, analyzed medical reports are held only in ephemeral session memory and are not persisted to disk. A medical report is saved to your Report History only when you explicitly grant informed consent (either by checking the Informed Consent box prior to upload or clicking &ldquo;Save to History (Grant Consent)&rdquo; on an analyzed report).
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              3. Session Isolation &amp; Access Controls
            </h2>
            <p>
              Every browser client generates a high-entropy cryptographic session token (<code className="text-xs bg-obsidian-950 border border-white/10 text-cyan-300 px-1.5 py-0.5 rounded">X-CareMatric-Session</code>). All report retrieval, translation, chat conversations, and deletion operations verify that the requesting session token matches the session owner. One user can never view or access another user&apos;s medical reports or chat threads.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              4. De-Identification Before Medical AI Processing
            </h2>
            <p>
              When live server AI enrichment is enabled for medical reports, CareMatric AI strips header text and sends only the structured array of extracted laboratory biomarker names, numeric values, units, and reference intervals to the configured AI provider—never sending patient names, phone numbers, or street addresses.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              5. Right to Erasure &amp; Immediate Deletion
            </h2>
            <p>
              You have complete control over your saved medical reports and chat history. At any time, you may visit the{' '}
              <Link to="/dashboard/history" className="text-cyan-400 font-semibold underline">
                Medical Report History
              </Link>{' '}
              page to delete individual reports, purge your entire session history, or rotate your isolated session identifier.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-3 border-b border-white/[0.08] pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CareMatric AI Workspace</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Terms of Use
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Last Updated: October 2026 &bull; CareMatric AI Multifunctional Platform
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              1. Educational Health-Literacy &amp; AI Assistant Scope
            </h2>
            <p>
              CareMatric AI is provided strictly for general health literacy, educational comprehension of laboratory terminology, study assistance, coding help, and document analysis across English, Hindi, Hinglish, Gujarati, and Urdu. Use of this application does not create a physician-patient relationship.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              2. No Prescriptions or Medication Dosage Changes
            </h2>
            <p>
              CareMatric AI will never prescribe medications, recommend specific pharmaceutical drugs, or advise starting, stopping, or altering the dosage of any prescription or over-the-counter medicine. Users must never change their treatment plan based on automated report explanations.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              3. Document Upload &amp; OCR Accuracy Limitations
            </h2>
            <p>
              Optical Character Recognition (OCR) and PDF text parsing depend on the clarity, formatting, and legibility of the uploaded document. Always verify the extracted numbers displayed in the &ldquo;Extracted From Report&rdquo; column against your original printed or digital laboratory report.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              4. Clinical Review Requirement Before Clinical Deployment
            </h2>
            <p>
              Before deploying CareMatric AI in any real-world hospital, clinic, or diagnostic laboratory workflow, qualified medical professionals and clinical governance boards must review and validate all parsers, reference thresholds, and multilingual translations.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-3 border-b border-white/[0.08] pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CareMatric AI Workspace</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Medical Disclaimer &amp; Urgent-Care Guidance
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Important Safety Information for Patients and Caregivers
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-200 leading-relaxed space-y-2">
          <strong className="font-bold block text-sm text-amber-300">
            Emergency &amp; Urgent-Care Notice:
          </strong>
          <p>
            If you are experiencing a medical emergency—including chest pain, shortness of breath, severe dizziness, fainting, confusion, uncontrolled bleeding, or critically high/low blood sugar symptoms—do not rely on this web application. Contact emergency medical services or visit the nearest hospital emergency department immediately.
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              Not a Substitute for Professional Medical Advice
            </h2>
            <p>
              All content, biomarker summaries, reference-range comparisons, and multilingual explanations generated by CareMatric AI are for educational and informational purposes only. Laboratory values must always be interpreted by a licensed physician in the context of your complete medical history, physical examination, symptoms, and prior diagnostic trends.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              Strict Separation of Extracted Facts and Educational Explanations
            </h2>
            <p>
              CareMatric AI separates the numbers extracted directly from your report (&ldquo;Verbatim Lab Facts&rdquo;) from educational definitions (&ldquo;Plain-Language Explanations&rdquo;). If a laboratory report does not print a reference range or unit for a test, CareMatric AI explicitly marks it as &ldquo;Not specified on report&rdquo; and never invents missing clinical criteria.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl bg-obsidian-900/80 border border-white/[0.08]">
            <h2 className="text-base font-bold text-white">
              Synthetic Sample Reports
            </h2>
            <p>
              All sample reports included in CareMatric AI are 100% synthetic demonstration datasets created to showcase how the software parses laboratory formats and explains biomarkers in English, Hindi, Gujarati, and Urdu. They do not represent real patient data.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};
