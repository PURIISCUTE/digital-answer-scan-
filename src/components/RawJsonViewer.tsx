import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { GradingEvaluationResult } from '../types/grading';

interface RawJsonViewerProps {
  evaluationResult: GradingEvaluationResult | null;
}

export const RawJsonViewer: React.FC<RawJsonViewerProps> = ({ evaluationResult }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'payload' | 'curl' | 'python'>('payload');

  const formattedJson = evaluationResult
    ? JSON.stringify(
        {
          paper_metadata: evaluationResult.paper_metadata,
          overall_score: evaluationResult.overall_score,
          question_results: evaluationResult.question_results.map((q) => ({
            question_number: q.question_number,
            extracted_student_answer: q.extracted_student_answer,
            master_scheme_answer: q.master_scheme_answer,
            max_marks: q.max_marks,
            awarded_marks: q.teacher_override_marks !== undefined ? q.teacher_override_marks : q.awarded_marks,
            similarity_score_pct: q.similarity_score_pct,
            grading_reasoning: q.grading_reasoning,
            ocr_confidence_score: q.ocr_confidence_score,
            needs_human_review: q.needs_human_review,
            flag_reason: q.flag_reason,
          })),
        },
        null,
        2
      )
    : `{\n  "paper_metadata": {\n    "student_name": "Unidentified",\n    "roll_number_id": "Unidentified",\n    "subject_exam": "Examination"\n  },\n  "overall_score": {\n    "total_awarded_marks": 0.0,\n    "total_possible_marks": 0.0,\n    "percentage": 0.0,\n    "overall_similarity_score_pct": 0.0,\n    "requires_manual_audit": false\n  },\n  "question_results": []\n}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ScanGrade_Evaluation_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const curlSnippet = `curl -X POST http://localhost:3000/api/grade-paper \\
  -H "Content-Type: application/json" \\
  -d '{
    "paperImage": "data:image/png;base64,iVBORw0KGgo...",
    "masterScheme": [
      {
        "question_number": "Q1",
        "max_marks": 6,
        "master_scheme_answer": "Carnot efficiency eta = 1 - (Tc/Th)...",
        "key_concepts": "eta = 1 - (Tc/Th), Second Law, Absolute Zero Tc=0 K unattainable",
        "partial_credit_rules": "Award 3 marks for formula, 3 marks for thermodynamic reasoning"
      }
    ]
  }'`;

  const pythonSnippet = `import asyncio
import aiohttp

async def grade_paper(session, image_b64, scheme):
    payload = {
        "paperImage": image_b64,
        "masterScheme": scheme
    }
    async with session.post("http://localhost:3000/api/grade-paper", json=payload) as resp:
        return await resp.json()

# Process 200 papers in parallel in ~2-3 minutes
async def batch_process(papers, scheme):
    async with aiohttp.ClientSession() as session:
        tasks = [grade_paper(session, p["img"], scheme) for p in papers]
        results = await asyncio.gather(*tasks)
        print(f"Successfully evaluated {len(results)} answer sheets.")`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Strict JSON Output Schema & API Exporter
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic, zero-markdown JSON response specification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveCodeTab('payload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
            activeCodeTab === 'payload'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Active Grading Result JSON</span>
        </button>

        <button
          onClick={() => setActiveCodeTab('curl')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
            activeCodeTab === 'curl'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>cURL API Call</span>
        </button>

        <button
          onClick={() => setActiveCodeTab('python')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
            activeCodeTab === 'python'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Asyncio Python Pipeline (200 Papers)</span>
        </button>
      </div>

      {/* Code Block Container */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="ml-2 text-slate-300">
              {activeCodeTab === 'payload'
                ? 'schema_output.json'
                : activeCodeTab === 'curl'
                ? 'request.sh'
                : 'parallel_grader.py'}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400">application/json • utf-8</span>
        </div>

        <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed select-text max-h-[600px] overflow-y-auto">
          {activeCodeTab === 'payload'
            ? formattedJson
            : activeCodeTab === 'curl'
            ? curlSnippet
            : pythonSnippet}
        </pre>
      </div>

      {/* Strict Schema Compliance Checklist */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Engine Schema Validation Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>paper_metadata (student_name, roll_number_id, subject_exam)</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>overall_score (total_awarded_marks, percentage, requires_manual_audit)</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>question_results array with semantic similarity score pct</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero-Error "needs_human_review": true on smudged or ambiguous scripts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
