import React, { useState } from 'react';
import {
  GradingEvaluationResult,
  QuestionResult,
  AuditLogEntry,
  TrioDocumentState,
  UploadedExamDocument,
} from './types/grading';
import { renderAnswerSheetToDataUrl } from './utils/sheetCanvasRenderer';
import { Header } from './components/Header';
import { ScannerAuditorStation } from './components/ScannerAuditorStation';
import { TextMatchingPlayground } from './components/TextMatchingPlayground';
import { BatchGradingEngine } from './components/BatchGradingEngine';
import { GradebookAnalytics } from './components/GradebookAnalytics';
import { RawJsonViewer } from './components/RawJsonViewer';
import { StudentReportModal } from './components/StudentReportModal';
import { ModelInfoModal } from './components/ModelInfoModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'batch' | 'analytics' | 'raw-json' | 'text-matching'>('scanner');
  
  // 3-Document Upload State — Starts clean and EMPTY (Zero demo data!)
  const [trioState, setTrioState] = useState<TrioDocumentState>({
    answerSheet: null,
    questionPaper: null,
    markingScheme: null,
  });

  // Evaluation Result — Starts null (Zero demo data!)
  const [evaluationResult, setEvaluationResult] = useState<GradingEvaluationResult | null>(null);
  const [isGrading, setIsGrading] = useState<boolean>(false);
  const [gradingLatencyMs, setGradingLatencyMs] = useState<number | null>(null);
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isStudentReportModalOpen, setIsStudentReportModalOpen] = useState<boolean>(false);
  const [isModelInfoModalOpen, setIsModelInfoModalOpen] = useState<boolean>(false);

  // Scan & Grade the uploaded 3 documents via Gemini API
  const handleScanTrio = async (sensitivity: 'strict' | 'normal' | 'relaxed' = 'normal') => {
    if (!trioState.answerSheet) {
      setGradingError('Please upload the Student Answer Sheet (Slot 1).');
      return;
    }
    if (!trioState.questionPaper && !trioState.markingScheme) {
      setGradingError('Please upload at least the Official Question Paper (Slot 2) or Master Marking Scheme (Slot 3).');
      return;
    }

    setIsGrading(true);
    setGradingError(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/scan-and-grade-trio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answerSheet: {
            image: trioState.answerSheet.base64,
            mimeType: trioState.answerSheet.mimeType,
            text: trioState.answerSheet.text,
          },
          questionPaper: trioState.questionPaper
            ? {
                image: trioState.questionPaper.base64,
                mimeType: trioState.questionPaper.mimeType,
                text: trioState.questionPaper.text,
              }
            : undefined,
          markingScheme: trioState.markingScheme
            ? {
                image: trioState.markingScheme.base64,
                mimeType: trioState.markingScheme.mimeType,
                text: trioState.markingScheme.text,
              }
            : undefined,
          auditSensitivity: sensitivity,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setEvaluationResult({
          ...data.data,
          meta: data.meta,
        });
        setGradingLatencyMs(data.meta?.latency_ms || Date.now() - startTime);
      } else {
        setGradingError(data.error || 'Autonomous multi-document grading engine encountered an error.');
      }
    } catch (err: any) {
      console.error('Trio grading request failed:', err);
      setGradingError(err?.message || 'Failed to connect to the live AI grading server.');
    } finally {
      setIsGrading(false);
    }
  };

  // Optional: Load sample 3-doc bundle if user wants to test quickly without local files
  const handleLoadBenchmarkBundle = () => {
    const chemistryPaper = {
      id: 'sample-chem-student',
      student_name: 'Devin Thorne',
      roll_number_id: 'CHEM-2026-088',
      handwriting_style: 'neat' as const,
      has_ambiguity: false,
      answers: [
        {
          question_number: 'Q1',
          student_text: 'Nernst equation: E = E0 - (RT/nF)ln(Q). At 298 K, E = E0 - (0.0592/n)log(Q). As reaction proceeds, product concentration increases, making Q = [products]/[reactants] larger. The subtraction term increases, which causes cell potential E to drop until it hits 0 at equilibrium (Q = K).',
        },
        {
          question_number: 'Q2',
          student_text: 'Relationship: delta G0 = -nFE0 and delta G0 = -RT ln K. For n=2: E0 = -(-130,000 J) / (2 * 96485) = +0.674 V. Positive E0 indicates spontaneous reaction.',
        },
        {
          question_number: 'Q3',
          student_text: 'MgCl2 gives Mg2+ + 2e- -> Mg at cathode. Total charge Q = I * t = 12 A * (3 * 3600 s) = 129,600 C. Moles electrons = 129600 / 96485 = 1.343 mol e-. Since 2 electrons needed per Mg, moles Mg = 1.343 / 2 = 0.6716 mol. Mass Mg = 0.6716 * 24.31 g/mol = 16.33 grams.',
        },
      ],
    };

    const renderedAnswerSheetUrl = renderAnswerSheetToDataUrl(
      chemistryPaper,
      'AP CHEMISTRY ADVANCED ELECTROCHEMISTRY'
    );

    const questionPaperText = `COURSE: AP CHEMISTRY (HONORS)
EXAM CODE: CHEM-402-FINAL
SECTION II: ADVANCED ELECTROCHEMISTRY & THERMODYNAMICS
TOTAL TIME: 45 MINUTES | TOTAL MARKS: 20 MARKS

QUESTION 1 [6 MARKS]
Derive and state the theoretical Nernst equation for a galvanic cell operating under non-standard conditions at 298 K. Explain physically why measured cell electromotive force (E_cell) decays as reaction quotient (Q) increases toward dynamic chemical equilibrium.

QUESTION 2 [7 MARKS]
State the thermodynamic relationship connecting standard cell potential (E°cell), standard Gibbs free energy (ΔG°), and the equilibrium constant (K). Calculate the standard potential E°cell for a 2-electron reduction-oxidation reaction where ΔG° = -130 kJ/mol (Faraday constant F = 96,485 C/mol).

QUESTION 3 [7 MARKS]
An industrial electrolytic cell decomposes molten magnesium chloride (MgCl2). Calculate the mass of pure solid magnesium metal deposited at the cathode when a constant current of 12.0 Amperes is applied for 3.0 hours. (Mg molar mass = 24.305 g/mol, Faraday constant F = 96,485 C/mol).`;

    const markingSchemeText = `MASTER MARKING SCHEME & SCORING RUBRIC
SUBJECT: AP Chemistry: Electrochemistry & Reaction Kinetics
EXAMINATION CODE: CHEM-402-FINAL
TOTAL POSSIBLE MARKS: 20 MARKS

QUESTION 1 [6 MARKS]
- Model Answer: E_cell = E°cell - (RT/nF)ln(Q) or at 298 K: E_cell = E°cell - (0.0592/n)log(Q).
- Conceptual Breakdown: As reactants convert to products, [products]/[reactants] increases, raising Q. The subtraction term (RT/nF)ln(Q) increases in magnitude, diminishing net cell voltage until E_cell = 0 at equilibrium when Q = K.
- Mandatory Keywords: Nernst equation, reaction quotient Q, E_cell = 0 at equilibrium, Q = K.
- Partial Credit: 3 marks for correct equation; 3 marks for thermodynamic voltage decay explanation.

QUESTION 2 [7 MARKS]
- Model Answer: ΔG° = -nFE°cell and ΔG° = -RT ln(K).
- Calculation: E°cell = -ΔG° / (nF) = -(-130,000 J/mol) / (2 * 96,485 C/mol) = +0.6737 V ≈ +0.674 V.
- Mandatory Keywords: ΔG° = -nFE°cell, negative ΔG° corresponds to positive E°cell (spontaneous), n = 2, +0.674 Volts.
- Partial Credit: 3 marks for thermodynamic formulas; 4 marks for mathematical substitution, correct sign (+), and unit (V).

QUESTION 3 [7 MARKS]
- Model Answer: Cathode reduction: Mg2+ + 2e- -> Mg(s) (2 moles electrons per mole Mg).
- Total Charge: Q = I * t = 12.0 A * (3.0 * 3600 s) = 129,600 C.
- Moles electrons: n_e = 129,600 / 96,485 = 1.343 mol e-.
- Moles Mg: 1.343 / 2 = 0.6716 mol Mg.
- Final Mass: 0.6716 mol * 24.305 g/mol = 16.32 grams (acceptable range: 16.2 to 16.4 g).
- Partial Credit: 2 marks for Q = I*t; 2 marks for Faraday conversion; 3 marks for stoichiometry (n=2) and final mass in grams.`;

    const sampleAnswerSheetDoc: UploadedExamDocument = {
      name: 'Student_DevinThorne_Script.png',
      previewUrl: renderedAnswerSheetUrl,
      base64: renderedAnswerSheetUrl,
      mimeType: 'image/png',
      uploadedAt: new Date().toLocaleTimeString(),
    };

    const sampleQuestionPaperDoc: UploadedExamDocument = {
      name: 'Official_AP_Chemistry_Question_Paper.txt',
      text: questionPaperText,
      uploadedAt: new Date().toLocaleTimeString(),
    };

    const sampleMarkingSchemeDoc: UploadedExamDocument = {
      name: 'Master_Marking_Scheme_CHEM402.txt',
      text: markingSchemeText,
      uploadedAt: new Date().toLocaleTimeString(),
    };

    setTrioState({
      answerSheet: sampleAnswerSheetDoc,
      questionPaper: sampleQuestionPaperDoc,
      markingScheme: sampleMarkingSchemeDoc,
    });
    setEvaluationResult(null);
    setGradingError(null);
  };

  // Reset all uploaded documents and grading results
  const handleResetAll = () => {
    setTrioState({
      answerSheet: null,
      questionPaper: null,
      markingScheme: null,
    });
    setEvaluationResult(null);
    setGradingError(null);
    setGradingLatencyMs(null);
  };

  // Handle question result updates (Teacher Override / Human Audit)
  const handleUpdateQuestionResult = (updated: QuestionResult) => {
    if (!evaluationResult) return;

    const newQuestionResults = evaluationResult.question_results.map((q) =>
      q.question_number === updated.question_number ? updated : q
    );

    const newTotalAwarded = newQuestionResults.reduce((acc, q) => {
      const marks = q.teacher_override_marks !== undefined ? q.teacher_override_marks : q.awarded_marks;
      return acc + marks;
    }, 0);

    const hasPendingFlags = newQuestionResults.some((q) => q.needs_human_review && !q.audited_by_human);

    setEvaluationResult({
      ...evaluationResult,
      overall_score: {
        ...evaluationResult.overall_score,
        total_awarded_marks: parseFloat(newTotalAwarded.toFixed(1)),
        percentage: parseFloat(((newTotalAwarded / evaluationResult.overall_score.total_possible_marks) * 100).toFixed(1)),
        requires_manual_audit: hasPendingFlags,
      },
      question_results: newQuestionResults,
    });
  };

  const handleAuditLog = (entry: AuditLogEntry) => {
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Count pending zero-error tolerance review flags
  const zeroErrorToleranceCount = evaluationResult
    ? evaluationResult.question_results.filter((q) => q.needs_human_review && !q.audited_by_human).length
    : 0;

  const detectedSubject = evaluationResult?.paper_metadata?.subject_exam;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        detectedSubject={detectedSubject}
        zeroErrorToleranceCount={zeroErrorToleranceCount}
        onResetAll={handleResetAll}
        onOpenModelModal={() => setIsModelInfoModalOpen(true)}
      />

      {/* Main Workstation Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'scanner' && (
          <ScannerAuditorStation
            trioState={trioState}
            onUpdateTrioState={setTrioState}
            evaluationResult={evaluationResult}
            isGrading={isGrading}
            gradingError={gradingError}
            gradingLatencyMs={gradingLatencyMs}
            onScanTrio={handleScanTrio}
            onUpdateQuestionResult={handleUpdateQuestionResult}
            onAuditLog={handleAuditLog}
            onResetAll={handleResetAll}
            onLoadBenchmarkBundle={handleLoadBenchmarkBundle}
            onOpenStudentReportModal={() => setIsStudentReportModalOpen(true)}
            onOpenModelModal={() => setIsModelInfoModalOpen(true)}
          />
        )}

        {activeTab === 'text-matching' && (
          <TextMatchingPlayground />
        )}

        {activeTab === 'batch' && (
          <BatchGradingEngine
            onAuditPaperInStation={(sample, result) => {
              setEvaluationResult(result);
              setActiveTab('scanner');
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <GradebookAnalytics
            auditLogs={auditLogs}
            currentResult={evaluationResult}
          />
        )}

        {activeTab === 'raw-json' && (
          <RawJsonViewer evaluationResult={evaluationResult} />
        )}
      </main>

      {/* Printable Student PDF Summary Report Modal */}
      {evaluationResult && (
        <StudentReportModal
          isOpen={isStudentReportModalOpen}
          onClose={() => setIsStudentReportModalOpen(false)}
          evaluationResult={evaluationResult}
          examTitle={evaluationResult.paper_metadata.subject_exam || 'Official Examination Assessment'}
        />
      )}

      {/* LLM Model Architecture & Parameters Modal */}
      <ModelInfoModal
        isOpen={isModelInfoModalOpen}
        onClose={() => setIsModelInfoModalOpen(false)}
      />
    </div>
  );
}
