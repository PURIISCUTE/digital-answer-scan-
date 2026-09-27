import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { MasterMarkingScheme, MarkingSchemeQuestion } from '../types/grading';

interface RubricStudioProps {
  exams: MasterMarkingScheme[];
  selectedExam: MasterMarkingScheme;
  onUpdateExam: (updated: MasterMarkingScheme) => void;
  onSelectExam: (exam: MasterMarkingScheme) => void;
  onAddNewExam: (newExam: MasterMarkingScheme) => void;
}

export const RubricStudio: React.FC<RubricStudioProps> = ({
  exams,
  selectedExam,
  onUpdateExam,
  onSelectExam,
  onAddNewExam,
}) => {
  const [examState, setExamState] = useState<MasterMarkingScheme>(selectedExam);
  const [saveNotification, setSaveNotification] = useState<boolean>(false);

  // Sync state if selectedExam prop changes
  React.useEffect(() => {
    setExamState(selectedExam);
  }, [selectedExam]);

  const handleUpdateQuestion = (qIndex: number, field: keyof MarkingSchemeQuestion, value: any) => {
    const updatedQuestions = [...examState.questions];
    updatedQuestions[qIndex] = {
      ...updatedQuestions[qIndex],
      [field]: field === 'max_marks' ? parseFloat(value) || 0 : value,
    };

    const newTotal = updatedQuestions.reduce((acc, q) => acc + (q.max_marks || 0), 0);

    const updatedExam: MasterMarkingScheme = {
      ...examState,
      questions: updatedQuestions,
      total_marks: newTotal,
    };

    setExamState(updatedExam);
  };

  const handleAddQuestion = () => {
    const nextNum = examState.questions.length + 1;
    const newQ: MarkingSchemeQuestion = {
      id: `q-${Date.now()}`,
      question_number: `Q${nextNum}`,
      question_prompt: 'Describe the core theoretical mechanism and calculate the required parameters...',
      master_scheme_answer: 'Ideal model answer establishing primary principles, mathematical derivation, and domain terminology...',
      key_concepts: 'Core principle, mathematical steps, precision units, boundary condition.',
      partial_credit_rules: 'Award 50% for correct setup; 50% for numerical resolution and conceptual conclusion.',
      max_marks: 5,
    };

    const updatedQuestions = [...examState.questions, newQ];
    const newTotal = updatedQuestions.reduce((acc, q) => acc + q.max_marks, 0);

    const updatedExam: MasterMarkingScheme = {
      ...examState,
      questions: updatedQuestions,
      total_marks: newTotal,
    };

    setExamState(updatedExam);
  };

  const handleRemoveQuestion = (qIndex: number) => {
    if (examState.questions.length <= 1) return;
    const updatedQuestions = examState.questions.filter((_, idx) => idx !== qIndex);
    const newTotal = updatedQuestions.reduce((acc, q) => acc + q.max_marks, 0);

    const updatedExam: MasterMarkingScheme = {
      ...examState,
      questions: updatedQuestions,
      total_marks: newTotal,
    };

    setExamState(updatedExam);
  };

  const handleSaveRubric = () => {
    onUpdateExam(examState);
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 2500);
  };

  const handleExportRubricJSON = () => {
    const jsonStr = JSON.stringify(examState, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Marking_Rubric_${examState.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Master Marking Scheme & Rubric Studio
            </h2>
            <p className="text-xs text-slate-400">
              Configure conceptual model answers, required keywords, and partial credit boundaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {saveNotification && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 animate-pulse">
              Rubric Saved Successfully
            </span>
          )}

          <button
            onClick={handleExportRubricJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleSaveRubric}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Scheme</span>
          </button>
        </div>
      </div>

      {/* Exam Details Card */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Marking Scheme Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Examination / Assignment Title
            </label>
            <input
              type="text"
              value={examState.title}
              onChange={(e) => setExamState({ ...examState, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Course / Subject Code
            </label>
            <input
              type="text"
              value={examState.subject_exam}
              onChange={(e) => setExamState({ ...examState, subject_exam: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
          <span>Total Questions: {examState.questions.length}</span>
          <span className="font-bold text-indigo-300">
            Total Possible Marks: {examState.total_marks} Marks
          </span>
        </div>
      </div>

      {/* Questions Rubric List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Question Criteria & Partial Credit Rules
          </h3>
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>

        {examState.questions.map((q, idx) => (
          <div
            key={q.id || idx}
            className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={q.question_number}
                  onChange={(e) => handleUpdateQuestion(idx, 'question_number', e.target.value)}
                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs text-indigo-300 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs font-bold text-white">Question Details</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Max Marks:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={q.max_marks}
                    onChange={(e) => handleUpdateQuestion(idx, 'max_marks', e.target.value)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {examState.questions.length > 1 && (
                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Problem Statement */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Question Prompt / Problem Text
              </label>
              <textarea
                rows={2}
                value={q.question_prompt}
                onChange={(e) => handleUpdateQuestion(idx, 'question_prompt', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Model Answer */}
            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Master Scheme Model Answer (Semantic Gold Standard)
              </label>
              <textarea
                rows={3}
                value={q.master_scheme_answer}
                onChange={(e) => handleUpdateQuestion(idx, 'master_scheme_answer', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Key Concepts and Partial Credit Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-cyan-400 mb-1">
                  Mandatory Key Concepts / Specific Keywords
                </label>
                <textarea
                  rows={2}
                  value={q.key_concepts}
                  onChange={(e) => handleUpdateQuestion(idx, 'key_concepts', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
                  placeholder="e.g. Formula, specific constants, conservation principles..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                  Partial Credit Criteria & Deduction Guidelines
                </label>
                <textarea
                  rows={2}
                  value={q.partial_credit_rules}
                  onChange={(e) => handleUpdateQuestion(idx, 'partial_credit_rules', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none leading-relaxed"
                  placeholder="e.g. Deduct 1 mark if units missing; award 50% for intermediate derivation..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
