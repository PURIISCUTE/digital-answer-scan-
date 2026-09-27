import React, { useState } from 'react';
import {
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  User,
  Hash,
  BookOpen,
  Download,
  Printer,
  Sliders,
  Check,
  Upload,
  FileText,
  FileCheck2,
  FileQuestion,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  GradingEvaluationResult,
  QuestionResult,
  AuditLogEntry,
  TrioDocumentState,
} from '../types/grading';
import { TrioDocumentUploader } from './TrioDocumentUploader';
import { QuestionResultCard } from './QuestionResultCard';

interface ScannerAuditorStationProps {
  trioState: TrioDocumentState;
  onUpdateTrioState: (updated: TrioDocumentState) => void;
  evaluationResult: GradingEvaluationResult | null;
  isGrading: boolean;
  gradingError: string | null;
  gradingLatencyMs: number | null;
  onScanTrio: (sensitivity: 'strict' | 'normal' | 'relaxed') => void;
  onUpdateQuestionResult: (updated: QuestionResult) => void;
  onAuditLog: (entry: AuditLogEntry) => void;
  onResetAll: () => void;
  onLoadBenchmarkBundle: () => void;
  onOpenStudentReportModal: () => void;
}

export const ScannerAuditorStation: React.FC<ScannerAuditorStationProps> = ({
  trioState,
  onUpdateTrioState,
  evaluationResult,
  isGrading,
  gradingError,
  gradingLatencyMs,
  onScanTrio,
  onUpdateQuestionResult,
  onAuditLog,
  onResetAll,
  onLoadBenchmarkBundle,
  onOpenStudentReportModal,
}) => {
  const [activeQuestionHighlight, setActiveQuestionHighlight] = useState<string | null>(null);
  const [activeViewerTab, setActiveViewerTab] = useState<'answerSheet' | 'questionPaper' | 'markingScheme'>('answerSheet');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'normal' | 'contrast' | 'invert' | 'grayscale'>('normal');
  const [isUploaderCollapsed, setIsUploaderCollapsed] = useState<boolean>(false);

  // Compute live adjusted score if teacher overrides marks
  const effectiveTotalMarks = evaluationResult
    ? evaluationResult.question_results.reduce((acc, q) => {
        const m = q.teacher_override_marks !== undefined ? q.teacher_override_marks : q.awarded_marks;
        return acc + m;
      }, 0)
    : 0;

  const totalPossible = evaluationResult?.overall_score?.total_possible_marks || 20;
  const effectivePercentage = totalPossible > 0 ? (effectiveTotalMarks / totalPossible) * 100 : 0;

  // Determine if manual audit is needed
  const pendingFlaggedCount = evaluationResult
    ? evaluationResult.question_results.filter((q) => q.needs_human_review && !q.audited_by_human).length
    : 0;
  const requiresManualAudit = pendingFlaggedCount > 0;

  // Download raw evaluation JSON
  const handleDownloadJson = () => {
    if (!evaluationResult) return;
    const blob = new Blob([JSON.stringify(evaluationResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Grading_${evaluationResult.paper_metadata.student_name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get current active document in viewer
  const currentDoc =
    activeViewerTab === 'answerSheet'
      ? trioState.answerSheet
      : activeViewerTab === 'questionPaper'
      ? trioState.questionPaper
      : trioState.markingScheme;

  return (
    <div className="space-y-6">
      {/* 3-Document Upload Section */}
      <div className="space-y-2">
        {evaluationResult && (
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-mono text-slate-400">
              Exam Ingestion Documents (Answer Sheet • Question Paper • Marking Scheme)
            </span>
            <button
              onClick={() => setIsUploaderCollapsed(!isUploaderCollapsed)}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>{isUploaderCollapsed ? 'Show Uploaded Documents' : 'Collapse Uploaded Documents'}</span>
              {isUploaderCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {(!evaluationResult || !isUploaderCollapsed) && (
          <TrioDocumentUploader
            trioState={trioState}
            onUpdateTrioState={onUpdateTrioState}
            onScanAndGrade={onScanTrio}
            isScanning={isGrading}
            onLoadBenchmarkBundle={onLoadBenchmarkBundle}
          />
        )}
      </div>

      {/* Live AI Grading Error Banner */}
      {gradingError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-lg animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-200">Autonomous Scanning & Grading Notice:</span>
            <p className="mt-0.5 text-rose-100 leading-relaxed">{gradingError}</p>
          </div>
        </div>
      )}

      {/* When Graded: Examination Results & Auditor Station */}
      {evaluationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Auto-Detected Subject & Candidate Metadata Banner */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              {/* Candidate Info */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 font-bold border border-indigo-400/30">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-white tracking-tight">
                      {evaluationResult.paper_metadata.student_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      Roll/ID: {evaluationResult.paper_metadata.roll_number_id}
                    </span>
                  </div>
                  {/* AUTO-DETECTED SUBJECT HIGHLIGHT */}
                  <div className="flex items-center gap-2 mt-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">
                      {evaluationResult.paper_metadata.subject_exam}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      Auto-Detected from Marking Scheme
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: PDF Report & JSON */}
              <div className="flex flex-wrap items-center gap-2.5">
                {gradingLatencyMs && (
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1.5 rounded-xl border border-cyan-500/20">
                    Graded in {(gradingLatencyMs / 1000).toFixed(2)}s
                  </span>
                )}

                <button
                  onClick={onOpenStudentReportModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Student Report (PDF)</span>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
                  title="Download JSON evaluation object"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download JSON</span>
                </button>
              </div>
            </div>

            {/* Score Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Total Awarded Marks */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Awarded Marks
                </span>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-2xl font-black font-mono text-white">
                    {effectiveTotalMarks.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / {totalPossible} (From Question Paper)
                  </span>
                </div>
              </div>

              {/* Percentage */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Grade Percentage
                </span>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span
                    className={`text-2xl font-black font-mono ${
                      effectivePercentage >= 85
                        ? 'text-emerald-400'
                        : effectivePercentage >= 65
                        ? 'text-cyan-400'
                        : effectivePercentage >= 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {effectivePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Semantic Similarity */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Semantic Similarity
                </span>
                <div className="flex items-baseline gap-1.5 mt-1.5">
                  <span className="text-2xl font-black font-mono text-indigo-300">
                    {evaluationResult.overall_score.overall_similarity_score_pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Audit Status */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Zero-Error Protocol
                </span>
                <div className="mt-1.5">
                  {requiresManualAudit ? (
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 animate-pulse">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>{pendingFlaggedCount} Flagged for Review</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Zero-Error Confirmed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Zero-Error Warning Box */}
            {requiresManualAudit && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300">Zero Margin of Error Protocol Active:</h4>
                  <p className="mt-0.5 leading-relaxed text-slate-300">
                    One or more answers have been flagged for smudged or ambiguous handwriting. Use the cards below to visually verify the candidate's exact script against the optical viewer, adjust marks if appropriate, and confirm audit sign-off.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Two-Column Side-by-Side Workstation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Multi-Document Optical Viewer (5 cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                {/* Document Tabs */}
                <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveViewerTab('answerSheet')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        activeViewerTab === 'answerSheet'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Answer Sheet Scan</span>
                    </button>

                    <button
                      onClick={() => setActiveViewerTab('questionPaper')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        activeViewerTab === 'questionPaper'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <FileQuestion className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Question Paper</span>
                    </button>

                    <button
                      onClick={() => setActiveViewerTab('markingScheme')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        activeViewerTab === 'markingScheme'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Marking Scheme</span>
                    </button>
                  </div>
                </div>

                {/* Optical Controls for Image Viewer */}
                {currentDoc?.previewUrl && (
                  <div className="p-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                        className="p-1 rounded hover:bg-slate-800 hover:text-white"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[11px] px-1">{Math.round(zoomLevel * 100)}%</span>
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                        className="p-1 rounded hover:bg-slate-800 hover:text-white"
                        title="Zoom in"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        className="p-1 rounded hover:bg-slate-800 hover:text-white"
                        title="Reset zoom"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <span>Filter:</span>
                      <select
                        value={filterMode}
                        onChange={(e: any) => setFilterMode(e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-200 text-[11px]"
                      >
                        <option value="normal">Normal Scan</option>
                        <option value="contrast">High Contrast</option>
                        <option value="invert">Inverted (B&W)</option>
                        <option value="grayscale">Grayscale</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Viewer Body */}
                <div className="p-3 bg-slate-950 min-h-[480px] max-h-[620px] overflow-auto flex items-center justify-center">
                  {currentDoc?.previewUrl ? (
                    <div
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.15s ease-out',
                      }}
                      className="w-full flex justify-center"
                    >
                      <img
                        src={currentDoc.previewUrl}
                        alt={activeViewerTab}
                        className={`max-w-full rounded-lg shadow-2xl ${
                          filterMode === 'invert'
                            ? 'invert contrast-125'
                            : filterMode === 'contrast'
                            ? 'contrast-150'
                            : filterMode === 'grayscale'
                            ? 'grayscale'
                            : ''
                        }`}
                      />
                    </div>
                  ) : currentDoc?.text ? (
                    <div className="w-full h-full p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[580px] bg-slate-900/60 rounded-xl border border-slate-800">
                      {currentDoc.text}
                    </div>
                  ) : (
                    <div className="text-center p-8 text-slate-500 text-xs font-mono">
                      No document preview available for this slot.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Detailed Question Result Cards (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detailed Question Evaluations ({evaluationResult.question_results.length})
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  All Marks strictly tied to Question Paper specifications
                </span>
              </div>

              {evaluationResult.question_results.map((qResult, idx) => (
                <QuestionResultCard
                  key={qResult.question_number || idx}
                  result={qResult}
                  index={idx}
                  isSelectedForHighlight={activeQuestionHighlight === qResult.question_number}
                  onSelectHighlight={() =>
                    setActiveQuestionHighlight(
                      activeQuestionHighlight === qResult.question_number ? null : qResult.question_number
                    )
                  }
                  onUpdateQuestionResult={onUpdateQuestionResult}
                  onAuditLog={(entry) =>
                    onAuditLog({
                      id: `audit-${Date.now()}-${idx}`,
                      timestamp: new Date().toLocaleTimeString(),
                      student_name: evaluationResult.paper_metadata.student_name,
                      roll_number_id: evaluationResult.paper_metadata.roll_number_id,
                      question_number: entry.question_number,
                      original_marks: entry.original_marks,
                      revised_marks: entry.revised_marks,
                      reason: entry.reason,
                      auditor: 'Instructor (Teacher Review Station)',
                    })
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* When No Evaluation Loaded Yet: Clean Guide Banner */}
      {!evaluationResult && !isGrading && (
        <div className="bg-slate-900/40 rounded-3xl p-8 border border-slate-800/80 text-center space-y-5 max-w-4xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Ready for Live Multi-Document Optical Grading
            </h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
              Upload your <strong>Student Answer Sheet</strong>, <strong>Question Paper</strong>, and <strong>Marking Scheme</strong> above. The engine scans the marking scheme to auto-detect the subject and exam code, extracts questions and marks from the question paper, and evaluates student responses with zero margin of error.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-left">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-indigo-400">Step 1 • Student Script</span>
              <p className="text-xs text-slate-300 font-semibold">Optical OCR Transcription</p>
              <p className="text-[11px] text-slate-400">
                High-precision transcription of handwritten or typed student answers, with optical confidence tracking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">Step 2 • Question Paper</span>
              <p className="text-xs text-slate-300 font-semibold">Autonomous Marks Allocation</p>
              <p className="text-[11px] text-slate-400">
                Extracts exact question prompts and maximum marks directly from the official question paper.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">Step 3 • Marking Scheme</span>
              <p className="text-xs text-slate-300 font-semibold">Subject & Rubric Detection</p>
              <p className="text-[11px] text-slate-400">
                Scans the scheme to auto-detect course subject, model answers, keywords, and partial credit scoring rules.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
