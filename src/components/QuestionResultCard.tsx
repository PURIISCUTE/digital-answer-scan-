import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QuestionResult } from '../types/grading';

interface QuestionResultCardProps {
  result: QuestionResult;
  index: number;
  isSelectedForHighlight: boolean;
  onSelectHighlight: () => void;
  onUpdateQuestionResult: (updated: QuestionResult) => void;
  onAuditLog: (entry: {
    question_number: string;
    original_marks: number;
    revised_marks: number;
    reason: string;
  }) => void;
}

export const QuestionResultCard: React.FC<QuestionResultCardProps> = ({
  result,
  index,
  isSelectedForHighlight,
  onSelectHighlight,
  onUpdateQuestionResult,
  onAuditLog,
}) => {
  const [isEditingMarks, setIsEditingMarks] = useState<boolean>(false);
  const [overrideMarks, setOverrideMarks] = useState<number>(
    result.teacher_override_marks !== undefined ? result.teacher_override_marks : result.awarded_marks
  );
  const [teacherNotes, setTeacherNotes] = useState<string>(
    result.teacher_notes || ''
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const effectiveMarks =
    result.teacher_override_marks !== undefined ? result.teacher_override_marks : result.awarded_marks;

  const scorePct = Math.round((effectiveMarks / result.max_marks) * 100);

  const handleSaveAudit = () => {
    const original = result.awarded_marks;
    const revised = Number(overrideMarks);

    const updated: QuestionResult = {
      ...result,
      teacher_override_marks: revised,
      teacher_notes: teacherNotes || 'Verified by Human Teacher Auditor',
      audited_by_human: true,
      needs_human_review: false, // Flag cleared after human audit
      audit_timestamp: new Date().toLocaleTimeString(),
    };

    onUpdateQuestionResult(updated);
    setIsEditingMarks(false);

    onAuditLog({
      question_number: result.question_number,
      original_marks: original,
      revised_marks: revised,
      reason: teacherNotes || 'Manual visual audit confirmed handwriting',
    });
  };

  const handleResetAudit = () => {
    const updated: QuestionResult = {
      ...result,
      teacher_override_marks: undefined,
      teacher_notes: undefined,
      audited_by_human: false,
      needs_human_review: Boolean(result.flag_reason),
    };
    onUpdateQuestionResult(updated);
    setOverrideMarks(result.awarded_marks);
    setTeacherNotes('');
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isSelectedForHighlight
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-900/95 shadow-lg'
          : result.needs_human_review && !result.audited_by_human
          ? 'border-amber-500/60 bg-amber-950/20 shadow-md shadow-amber-950/30'
          : result.audited_by_human
          ? 'border-emerald-500/40 bg-slate-900/80'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
      }`}
    >
      {/* Header bar */}
      <div className="p-3.5 flex items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onSelectHighlight}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600/40 text-slate-200 font-mono text-xs font-bold border border-slate-700 transition-colors"
            title="Highlight question area on answer sheet scan"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>{result.question_number}</span>
          </button>

          {/* OCR Confidence Tag */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
              result.ocr_confidence_score >= 0.85
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : result.ocr_confidence_score >= 0.7
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
            }`}
          >
            <span>OCR: {Math.round(result.ocr_confidence_score * 100)}%</span>
          </div>

          {/* Semantic Similarity Pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Similarity:</span>
            <span
              className={`font-mono font-semibold ${
                result.similarity_score_pct >= 80
                  ? 'text-emerald-400'
                  : result.similarity_score_pct >= 55
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {result.similarity_score_pct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Right side: Score & Audit Status */}
        <div className="flex items-center gap-2">
          {result.audited_by_human ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Audited</span>
            </span>
          ) : result.needs_human_review ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Review Required</span>
            </span>
          ) : null}

          {/* Marks badge */}
          <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
            <span className="font-mono text-sm font-bold text-white">
              {effectiveMarks.toFixed(1)}
            </span>
            <span className="text-slate-400 text-xs font-mono">/ {result.max_marks}</span>
            {result.teacher_override_marks !== undefined && (
              <span className="text-[10px] text-indigo-400 font-mono ml-1">(Adjusted)</span>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-slate-400 hover:text-slate-200"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* CRITICAL ZERO-ERROR HUMAN REVIEW FLAG BANNER */}
          {result.needs_human_review && (
            <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-amber-400 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                  ZERO-ERROR AUDIT FLAG — AMBIGUOUS HANDWRITING
                </span>
                <span className="text-[10px] font-mono text-amber-300/80 bg-amber-950/50 px-2 py-0.5 rounded">
                  Confidence &lt; 80%
                </span>
              </div>
              <p className="text-amber-100 font-medium leading-relaxed">
                {result.flag_reason ||
                  'The candidate handwriting or formula has ambiguous strokes or potential smudges. Please visually verify against the scanned answer sheet.'}
              </p>
            </div>
          )}

          {/* Semantic Similarity Visual Meter */}
          <div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
              <span>Concept Match & Semantic Alignment</span>
              <span className="font-mono font-semibold text-slate-300">
                {result.similarity_score_pct.toFixed(1)}% Match
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.similarity_score_pct >= 80
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                    : result.similarity_score_pct >= 55
                    ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                    : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, result.similarity_score_pct))}%` }}
              ></div>
            </div>
          </div>

          {/* Question Prompt Detected from Question Paper */}
          {result.question_prompt && (
            <div className="bg-slate-950/90 rounded-lg p-2.5 border border-slate-800/80 text-[11.5px] text-slate-300 leading-relaxed font-medium">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5 font-mono">
                Detected Question (Question Paper Max: {result.max_marks} Marks):
              </span>
              {result.question_prompt}
            </div>
          )}

          {/* Transcribed Student Answer vs Master Scheme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Extracted Student Response */}
            <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  Candidate OCR Transcription:
                </span>
              </div>
              <p className="font-mono text-slate-200 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800/80 text-[11.5px] select-text">
                {result.extracted_student_answer || 'No response transcribed'}
              </p>
            </div>

            {/* Master Rubric Answer */}
            <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Master Scheme Model Answer:
                </span>
              </div>
              <p className="font-mono text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800/80 text-[11.5px] select-text">
                {result.master_scheme_answer}
              </p>
            </div>
          </div>

          {/* Crisp Grading Reasoning from Gemini */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3">
            <span className="text-[11px] font-semibold text-indigo-300 block mb-1">
              Automated Semantic Reasoning & Partial Credit Rationale:
            </span>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              {result.grading_reasoning}
            </p>
          </div>

          {/* Teacher Review / Override Drawer */}
          {isEditingMarks ? (
            <div className="p-3 bg-slate-800/80 rounded-lg border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  Teacher Human Review & Mark Adjustment
                </span>
                <span className="text-[11px] text-slate-400">
                  Zero Error Protocol Enforcement
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[11px] text-slate-300 font-medium mb-1">
                    Awarded Marks (Max: {result.max_marks})
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={result.max_marks}
                      step={0.5}
                      value={overrideMarks}
                      onChange={(e) => setOverrideMarks(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white font-mono text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      type="range"
                      min={0}
                      max={result.max_marks}
                      step={0.5}
                      value={overrideMarks}
                      onChange={(e) => setOverrideMarks(parseFloat(e.target.value) || 0)}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-300 font-medium mb-1">
                    Auditor Verification Note
                  </label>
                  <input
                    type="text"
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    placeholder="e.g. Scanned zoom verified exponent is 10^-10; handwriting confirmed."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsEditingMarks(false)}
                  className="px-3 py-1 rounded text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAudit}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <Check className="w-3.5 h-3.5" />
                  Sign-off & Verify Marks
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {result.audited_by_human && (
                  <span className="text-[11px] text-slate-400 italic">
                    Auditor note: "{result.teacher_notes}" ({result.audit_timestamp})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {result.audited_by_human && (
                  <button
                    onClick={handleResetAudit}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800"
                    title="Reset to automated engine score"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}

                <button
                  onClick={() => setIsEditingMarks(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                    result.needs_human_review && !result.audited_by_human
                      ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {result.needs_human_review && !result.audited_by_human
                      ? 'Review & Resolve Flag'
                      : 'Adjust Marks / Add Note'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
