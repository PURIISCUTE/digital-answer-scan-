import React from 'react';
import {
  Scan,
  Layers,
  FileCheck2,
  BarChart3,
  Code2,
  ShieldAlert,
  Zap,
  BookOpen,
  ArrowRightLeft,
  Upload,
} from 'lucide-react';
import { MasterMarkingScheme } from '../types/grading';

interface HeaderProps {
  activeTab: 'scanner' | 'batch' | 'analytics' | 'raw-json' | 'text-matching';
  setActiveTab: (tab: 'scanner' | 'batch' | 'analytics' | 'raw-json' | 'text-matching') => void;
  detectedSubject?: string;
  zeroErrorToleranceCount?: number;
  onOpenUploadModal?: () => void;
  onResetAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  detectedSubject,
  zeroErrorToleranceCount = 0,
  onOpenUploadModal,
  onResetAll,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  ScanGrade<span className="text-cyan-400 font-mono text-base font-semibold ml-0.5">AI</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold tracking-wider">
                  v4.2 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous Multi-Document Optical Grading Engine
              </p>
            </div>
          </div>

          {/* Auto-detected Subject Banner */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 max-w-md">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            {detectedSubject ? (
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs text-slate-400 font-medium">Subject:</span>
                <span className="text-xs font-bold text-white truncate">{detectedSubject}</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Auto-Detected
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Upload Question Paper & Marking Scheme to auto-detect Subject & Marks
              </span>
            )}
          </div>

          {/* Engine Status & Badges */}
          <div className="flex items-center gap-2.5">
            {onResetAll && (
              <button
                onClick={onResetAll}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
                title="Clear all uploaded documents and reset evaluation"
              >
                <span>Reset All</span>
              </button>
            )}

            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Documents</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Gemini 3.8 Flash (Temp 0.0)</span>
            </div>

            {zeroErrorToleranceCount > 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>{zeroErrorToleranceCount} Need Human Audit</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/80 text-slate-300 text-xs font-medium border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Zero-Tolerance Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-1 pb-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>3-Document Optical Scanner & Grader</span>
          </button>

          <button
            onClick={() => setActiveTab('text-matching')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              activeTab === 'text-matching'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
            <span>Text-to-Text Matching</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              activeTab === 'batch'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Batch Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Gradebook & Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('raw-json')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap ${
              activeTab === 'raw-json'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>JSON Schema</span>
          </button>
        </div>
      </div>
    </header>
  );
};
