import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Check,
  Copy,
  Award,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { GradingEvaluationResult } from '../types/grading';
import {
  generateStudentReportHtml,
  printStudentReport,
} from '../utils/studentReportGenerator';

interface StudentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationResult: GradingEvaluationResult | null;
  examTitle: string;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  isOpen,
  onClose,
  evaluationResult,
  examTitle,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !evaluationResult) return null;

  const handlePrint = () => {
    printStudentReport(evaluationResult, examTitle);
  };

  const handleDownloadHtml = () => {
    const html = generateStudentReportHtml(evaluationResult, examTitle);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${evaluationResult.paper_metadata.student_name.replace(
      /\s+/g,
      '_'
    )}_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportHtml = generateStudentReportHtml(evaluationResult, examTitle);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Actions Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Printable Student PDF Summary Report</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  Ready to Print
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Candidate: {evaluationResult.paper_metadata.student_name} (ID:{' '}
                {evaluationResult.paper_metadata.roll_number_id})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              title="Download standalone HTML file"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Download HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Export as PDF / Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Document Preview Viewport */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 flex justify-center">
          <div className="w-full max-w-[800px] bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-10 border border-slate-300 overflow-hidden font-sans">
            <iframe
              srcDoc={reportHtml}
              title="Printable Student Report Preview"
              className="w-full border-0 rounded"
              style={{ minHeight: '680px', height: '100%' }}
            />
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Includes optical OCR transcription, semantic scores, and teacher audit log</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Press "Export as PDF" to save or print
          </span>
        </div>
      </div>
    </div>
  );
};
