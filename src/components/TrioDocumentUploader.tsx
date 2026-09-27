import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileCheck2,
  FileQuestion,
  Sparkles,
  Camera,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
  Eye,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { UploadedExamDocument, TrioDocumentState } from '../types/grading';
import { SAMPLE_STUDENT_PAPERS, SAMPLE_EXAMS } from '../data/sampleExams';
import { renderAnswerSheetToDataUrl } from '../utils/sheetCanvasRenderer';

interface TrioDocumentUploaderProps {
  trioState: TrioDocumentState;
  onUpdateTrioState: (updated: TrioDocumentState) => void;
  onScanAndGrade: (sensitivity: 'strict' | 'normal' | 'relaxed') => void;
  isScanning: boolean;
  onLoadBenchmarkBundle?: () => void;
}

export const TrioDocumentUploader: React.FC<TrioDocumentUploaderProps> = ({
  trioState,
  onUpdateTrioState,
  onScanAndGrade,
  isScanning,
  onLoadBenchmarkBundle,
}) => {
  const [sensitivity, setSensitivity] = useState<'strict' | 'normal' | 'relaxed'>('normal');
  const [activeTextModal, setActiveTextModal] = useState<'questionPaper' | 'markingScheme' | 'answerSheet' | null>(null);
  const [modalTextValue, setModalTextValue] = useState<string>('');

  const answerSheetInputRef = useRef<HTMLInputElement>(null);
  const questionPaperInputRef = useRef<HTMLInputElement>(null);
  const markingSchemeInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    type: 'answerSheet' | 'questionPaper' | 'markingScheme',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const doc: UploadedExamDocument = {
          name: file.name,
          previewUrl: result,
          base64: result,
          mimeType: file.type || 'image/png',
          uploadedAt: new Date().toLocaleTimeString(),
        };

        onUpdateTrioState({
          ...trioState,
          [type]: doc,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (
    type: 'answerSheet' | 'questionPaper' | 'markingScheme',
    e: React.DragEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const doc: UploadedExamDocument = {
            name: file.name,
            previewUrl: result,
            base64: result,
            mimeType: file.type || 'image/png',
            uploadedAt: new Date().toLocaleTimeString(),
          };

          onUpdateTrioState({
            ...trioState,
            [type]: doc,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveDoc = (type: 'answerSheet' | 'questionPaper' | 'markingScheme') => {
    onUpdateTrioState({
      ...trioState,
      [type]: null,
    });
  };

  const handleSaveTextDoc = () => {
    if (!activeTextModal || !modalTextValue.trim()) return;

    const doc: UploadedExamDocument = {
      name: `${activeTextModal.replace(/([A-Z])/g, ' $1').trim()}_Text.txt`,
      text: modalTextValue,
      uploadedAt: new Date().toLocaleTimeString(),
    };

    onUpdateTrioState({
      ...trioState,
      [activeTextModal]: doc,
    });

    setActiveTextModal(null);
    setModalTextValue('');
  };

  const isReadyToScan = Boolean(
    trioState.answerSheet && (trioState.questionPaper || trioState.markingScheme)
  );

  return (
    <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Multi-Document Ingestion Hub</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                Autonomous Detection
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload all 3 examination documents. The engine automatically scans and detects the Subject, Question Structure, Max Marks from the Question Paper, and evaluates student answers.
            </p>
          </div>
        </div>

        {onLoadBenchmarkBundle && (
          <button
            onClick={onLoadBenchmarkBundle}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
            title="Load ready-to-test Answer Sheet + Question Paper + Marking Scheme"
          >
            <FolderOpen className="w-4 h-4 text-indigo-400" />
            <span>Load Sample 3-Doc Test Bundle</span>
          </button>
        )}
      </div>

      {/* 3 Upload Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* SLOT 1: Student Answer Sheet */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 relative group">
          <input
            type="file"
            ref={answerSheetInputRef}
            onChange={(e) => handleFileUpload('answerSheet', e)}
            accept="image/*,.pdf"
            className="hidden"
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                1. Student Answer Sheet
              </span>
              {trioState.answerSheet ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Required
                </span>
              )}
            </div>

            {trioState.answerSheet ? (
              <div className="space-y-2">
                <div className="w-full h-40 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative shadow-inner flex items-center justify-center">
                  {trioState.answerSheet.previewUrl ? (
                    <img
                      src={trioState.answerSheet.previewUrl}
                      alt="Student Answer Sheet"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="p-3 text-xs text-slate-300 font-mono overflow-hidden max-h-full">
                      {trioState.answerSheet.text?.slice(0, 150)}...
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveDoc('answerSheet')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="truncate text-xs font-mono text-slate-300 font-semibold">
                  {trioState.answerSheet.name}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop('answerSheet', e)}
                onClick={() => answerSheetInputRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-slate-800 hover:border-indigo-500/80 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/80 transition-all space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white">Upload Student Script</p>
                <p className="text-[10px] text-slate-400">
                  Drop scanned handwritten page or photo
                </p>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                  Browse File
                </span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono border-t border-slate-900 pt-2 flex items-center justify-between">
            <span>OCR Handwritten Script</span>
            <span>PNG, JPG, PDF</span>
          </div>
        </div>

        {/* SLOT 2: Official Question Paper */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 relative group">
          <input
            type="file"
            ref={questionPaperInputRef}
            onChange={(e) => handleFileUpload('questionPaper', e)}
            accept="image/*,.pdf,.txt"
            className="hidden"
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                2. Official Question Paper
              </span>
              {trioState.questionPaper ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  Sets Max Marks
                </span>
              )}
            </div>

            {trioState.questionPaper ? (
              <div className="space-y-2">
                <div className="w-full h-40 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative shadow-inner flex items-center justify-center">
                  {trioState.questionPaper.previewUrl ? (
                    <img
                      src={trioState.questionPaper.previewUrl}
                      alt="Question Paper"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="p-3 text-xs text-slate-300 font-mono overflow-hidden max-h-full">
                      {trioState.questionPaper.text?.slice(0, 150)}...
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveDoc('questionPaper')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="truncate text-xs font-mono text-slate-300 font-semibold">
                  {trioState.questionPaper.name}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop('questionPaper', e)}
                className="w-full h-40 border-2 border-dashed border-slate-800 hover:border-cyan-500/80 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-900/40 hover:bg-slate-900/80 transition-all space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white">Upload Question Paper</p>
                <p className="text-[10px] text-slate-400">
                  Detects questions, prompts & max marks
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => questionPaperInputRef.current?.click()}
                    className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-700"
                  >
                    Browse File
                  </button>
                  <button
                    onClick={() => {
                      setActiveTextModal('questionPaper');
                      setModalTextValue('');
                    }}
                    className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 hover:bg-cyan-900 text-[10px] font-mono border border-cyan-800"
                  >
                    Paste Text
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono border-t border-slate-900 pt-2 flex items-center justify-between">
            <span>Auto-detects Max Marks</span>
            <span>Image / PDF / Text</span>
          </div>
        </div>

        {/* SLOT 3: Master Marking Scheme */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 relative group">
          <input
            type="file"
            ref={markingSchemeInputRef}
            onChange={(e) => handleFileUpload('markingScheme', e)}
            accept="image/*,.pdf,.txt"
            className="hidden"
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                3. Master Marking Scheme
              </span>
              {trioState.markingScheme ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  Sets Model Answers
                </span>
              )}
            </div>

            {trioState.markingScheme ? (
              <div className="space-y-2">
                <div className="w-full h-40 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative shadow-inner flex items-center justify-center">
                  {trioState.markingScheme.previewUrl ? (
                    <img
                      src={trioState.markingScheme.previewUrl}
                      alt="Marking Scheme"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="p-3 text-xs text-slate-300 font-mono overflow-hidden max-h-full">
                      {trioState.markingScheme.text?.slice(0, 150)}...
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveDoc('markingScheme')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="truncate text-xs font-mono text-slate-300 font-semibold">
                  {trioState.markingScheme.name}
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop('markingScheme', e)}
                className="w-full h-40 border-2 border-dashed border-slate-800 hover:border-emerald-500/80 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-900/40 hover:bg-slate-900/80 transition-all space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-white">Upload Marking Scheme</p>
                <p className="text-[10px] text-slate-400">
                  Detects subject, keywords & rubric
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => markingSchemeInputRef.current?.click()}
                    className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 border border-slate-700"
                  >
                    Browse File
                  </button>
                  <button
                    onClick={() => {
                      setActiveTextModal('markingScheme');
                      setModalTextValue('');
                    }}
                    className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-[10px] font-mono border border-emerald-800"
                  >
                    Paste Text
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 font-mono border-t border-slate-900 pt-2 flex items-center justify-between">
            <span>Model Answers & Criteria</span>
            <span>Image / PDF / Text</span>
          </div>
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Strictness setting */}
        <div className="flex items-center gap-2 text-xs">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-300 font-medium">Audit Strictness:</span>
          <select
            value={sensitivity}
            onChange={(e: any) => setSensitivity(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-medium focus:outline-none"
          >
            <option value="strict">Strict (Flag Any Ambiguity)</option>
            <option value="normal">Normal (Standard Zero-Tolerance)</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>

        {/* Scan Button */}
        <button
          onClick={() => onScanAndGrade(sensitivity)}
          disabled={!isReadyToScan || isScanning}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-extrabold text-sm shadow-xl transition-all ${
            !isReadyToScan || isScanning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black shadow-cyan-500/25 active:scale-95'
          }`}
        >
          {isScanning ? (
            <>
              <RotateCw className="w-5 h-5 animate-spin text-slate-950" />
              <span>Scanning All Documents & Auto-Detecting Subject...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>Scan Documents, Auto-Detect Subject & Grade</span>
            </>
          )}
        </button>
      </div>

      {/* Paste Text Modal */}
      {activeTextModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white capitalize">
                Paste Content for {activeTextModal === 'questionPaper' ? 'Question Paper' : 'Marking Scheme'}
              </h3>
              <button
                onClick={() => setActiveTextModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={8}
              value={modalTextValue}
              onChange={(e) => setModalTextValue(e.target.value)}
              placeholder={`Paste the questions or marking rubric text here...\n\nExample for Question Paper:\nCourse: Advanced Physics C (Theoretical)\nQ1. Derive Carnot efficiency [6 marks]\nQ2. Photoelectric equation and work function [7 marks]...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none leading-relaxed"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveTextModal(null)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTextDoc}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
              >
                Save Document Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
