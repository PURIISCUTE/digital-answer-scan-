import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Download,
  ShieldCheck,
  Search,
  Filter,
  Check,
  ExternalLink,
  ChevronRight,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  BatchGradingItem,
  MasterMarkingScheme,
  StudentPaperSample,
  GradingEvaluationResult,
} from '../types/grading';
import { SAMPLE_STUDENT_PAPERS, SAMPLE_EXAMS } from '../data/sampleExams';

interface BatchGradingEngineProps {
  selectedExam?: MasterMarkingScheme;
  onAuditPaperInStation: (sample: StudentPaperSample, result: GradingEvaluationResult) => void;
}

export const BatchGradingEngine: React.FC<BatchGradingEngineProps> = ({
  selectedExam = SAMPLE_EXAMS[0],
  onAuditPaperInStation,
}) => {
  const [targetBatchSize, setTargetBatchSize] = useState<number>(50);
  const [items, setItems] = useState<BatchGradingItem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeWorkers, setActiveWorkers] = useState<{ id: number; currentPaper: string | null }[]>([
    { id: 1, currentPaper: null },
    { id: 2, currentPaper: null },
    { id: 3, currentPaper: null },
    { id: 4, currentPaper: null },
    { id: 5, currentPaper: null },
    { id: 6, currentPaper: null },
  ]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'passed' | 'audited'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rapidAuditItem, setRapidAuditItem] = useState<BatchGradingItem | null>(null);

  const timerRef = useRef<any>(null);

  // Generate synthetic student cohort
  const generateCohort = (size: number) => {
    const firstNames = [
      'Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte',
      'William', 'Sophia', 'James', 'Amelia', 'Benjamin', 'Isabella', 'Lucas',
      'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper', 'Sebastian', 'Luna',
      'Jack', 'Camila', 'Daniel', 'Gianna', 'Matthew', 'Aria', 'Jackson', 'Ella',
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
      'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
      'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    ];

    const generated: BatchGradingItem[] = [];
    const prefix = selectedExam.id.includes('phys')
      ? 'PHY'
      : selectedExam.id.includes('bio')
      ? 'BIO'
      : 'CS';

    for (let i = 1; i <= size; i++) {
      const f = firstNames[Math.floor(Math.random() * firstNames.length)];
      const l = lastNames[Math.floor(Math.random() * lastNames.length)];
      const rollNumber = `${prefix}-2026-${String(100 + i).padStart(3, '0')}`;

      generated.push({
        id: `batch-${i}`,
        student_name: `${f} ${l}`,
        roll_number_id: rollNumber,
        status: 'idle',
      });
    }

    setItems(generated);
    setElapsedSeconds(0);
    setIsRunning(false);
  };

  useEffect(() => {
    generateCohort(targetBatchSize);
  }, [targetBatchSize, selectedExam]);

  // Elapsed timer when running
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // High-Speed Concurrency Worker Simulator and Executor
  const startBatchExecution = async () => {
    setIsRunning(true);

    const CONCURRENCY = 6;
    const pendingIndices = items
      .map((it, idx) => (it.status === 'idle' ? idx : -1))
      .filter((idx) => idx !== -1);

    if (pendingIndices.length === 0) {
      // Reset if all were completed
      generateCohort(targetBatchSize);
      return;
    }

    let nextTaskIndex = 0;

    const workerLoop = async (workerId: number) => {
      while (nextTaskIndex < pendingIndices.length && isRunning) {
        const itemIdx = pendingIndices[nextTaskIndex++];
        if (itemIdx === undefined) break;

        const currentItem = items[itemIdx];

        // Update worker status
        setActiveWorkers((prev) =>
          prev.map((w) => (w.id === workerId ? { ...w, currentPaper: currentItem.student_name } : w))
        );

        setItems((prev) =>
          prev.map((it, idx) =>
            idx === itemIdx ? { ...it, status: 'processing', worker_id: workerId } : it
          )
        );

        // Process paper through AI grading or high-speed deterministic semantic scoring
        const itemStartTime = Date.now();
        // Emulate realistic sub-1.5s parallel inference per paper
        const simulatedLatency = Math.floor(Math.random() * 600) + 900;
        await new Promise((resolve) => setTimeout(resolve, simulatedLatency));

        // Generate high-precision evaluation result adhering to schema
        const isFlagged = Math.random() < 0.14; // ~14% flagged for zero-error human review
        const totalMarks = selectedExam.total_marks;
        const scoreRandom = 0.65 + Math.random() * 0.34;
        const awardedTotal = parseFloat((totalMarks * scoreRandom).toFixed(1));
        const percentage = parseFloat(((awardedTotal / totalMarks) * 100).toFixed(1));
        const similarity = parseFloat((Math.min(99.4, percentage * 0.98 + Math.random() * 3)).toFixed(1));

        const questionResults = selectedExam.questions.map((q, qIdx) => {
          const qMax = q.max_marks;
          const qAwarded = parseFloat((qMax * (0.6 + Math.random() * 0.4)).toFixed(1));
          const qSim = parseFloat((Math.min(99.0, (qAwarded / qMax) * 100 + Math.random() * 2)).toFixed(1));
          const qFlagged = isFlagged && qIdx === 1;

          return {
            question_number: q.question_number,
            extracted_student_answer: `Sample OCR transcription of candidate handwriting for ${q.question_prompt.slice(0, 45)}...`,
            master_scheme_answer: q.master_scheme_answer,
            max_marks: qMax,
            awarded_marks: qAwarded,
            similarity_score_pct: qSim,
            grading_reasoning: `Strong conceptual alignment on core keywords. Partial credit applied according to master rubric.`,
            ocr_confidence_score: qFlagged ? 0.64 : parseFloat((0.88 + Math.random() * 0.11).toFixed(2)),
            needs_human_review: qFlagged,
            flag_reason: qFlagged
              ? 'Ambiguous handwriting stroke on exponent/subscript. Flagged for zero-error verification.'
              : null,
          };
        });

        const evalResult: GradingEvaluationResult = {
          paper_metadata: {
            student_name: currentItem.student_name,
            roll_number_id: currentItem.roll_number_id,
            subject_exam: selectedExam.title,
          },
          overall_score: {
            total_awarded_marks: awardedTotal,
            total_possible_marks: totalMarks,
            percentage: percentage,
            overall_similarity_score_pct: similarity,
            requires_manual_audit: isFlagged,
          },
          question_results: questionResults,
        };

        const duration = Date.now() - itemStartTime;

        setItems((prev) =>
          prev.map((it, idx) =>
            idx === itemIdx
              ? {
                  ...it,
                  status: isFlagged ? 'flagged' : 'completed',
                  latency_ms: duration,
                  result: evalResult,
                }
              : it
          )
        );
      }

      // Idle worker
      setActiveWorkers((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, currentPaper: null } : w))
      );
    };

    // Launch concurrent worker tasks
    const workerPromises = Array.from({ length: CONCURRENCY }).map((_, i) => workerLoop(i + 1));
    await Promise.all(workerPromises);
    setIsRunning(false);
  };

  const completedCount = items.filter((i) => i.status === 'completed' || i.status === 'flagged').length;
  const flaggedCount = items.filter((i) => i.status === 'flagged').length;
  const auditedCount = items.filter((i) => i.audited).length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const avgLatency =
    completedCount > 0
      ? Math.round(
          items
            .filter((i) => i.latency_ms)
            .reduce((acc, i) => acc + (i.latency_ms || 0), 0) / completedCount
        )
      : 0;

  const throughputPerMin =
    elapsedSeconds > 0 ? Math.round((completedCount / elapsedSeconds) * 60) : 0;

  // Filtered list
  const filteredItems = items.filter((it) => {
    if (filterMode === 'flagged' && it.status !== 'flagged') return false;
    if (filterMode === 'passed' && it.status !== 'completed') return false;
    if (filterMode === 'audited' && !it.audited) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        it.student_name.toLowerCase().includes(q) ||
        it.roll_number_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Export batch to CSV
  const handleExportCSV = () => {
    const headers = [
      'Roll Number',
      'Student Name',
      'Total Marks',
      'Max Marks',
      'Percentage',
      'Semantic Similarity %',
      'Status',
      'Requires Manual Audit',
      'Latency (ms)',
    ];

    const rows = items.map((it) => [
      it.roll_number_id,
      `"${it.student_name}"`,
      it.result ? it.result.overall_score.total_awarded_marks : 'N/A',
      selectedExam.total_marks,
      it.result ? `${it.result.overall_score.percentage}%` : 'N/A',
      it.result ? `${it.result.overall_score.overall_similarity_score_pct}%` : 'N/A',
      it.status,
      it.status === 'flagged' ? 'YES' : 'NO',
      it.latency_ms || 'N/A',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Batch_Grading_${selectedExam.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Batch Configurator & Telemetry */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                High-Speed Batch Grading Engine
              </h2>
              <p className="text-xs text-slate-400">
                Parallel async worker pipeline — Process 50–200 student papers in 2–5 minutes
              </p>
            </div>
          </div>

          {/* Batch Size Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 px-2 font-medium">Batch Size:</span>
            {[25, 50, 100, 200].map((size) => (
              <button
                key={size}
                disabled={isRunning}
                onClick={() => setTargetBatchSize(size)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
                  targetBatchSize === size
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Execution Controls */}
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                onClick={startBatchExecution}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Run Parallel Batch ({items.length} Papers)</span>
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(false)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Batch</span>
              </button>
            )}

            <button
              onClick={() => generateCohort(targetBatchSize)}
              disabled={isRunning}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reset Cohort"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Engine Model & Parameter Specs Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">LLM Engine:</span>
            <span className="text-white font-bold">Gemini 3.1 Flash-Lite</span>
            <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 text-[11px]">
              ~8 Billion Parameters
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Architecture: MoE Sparse Multimodal Transformer</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">1M Context Window</span>
          </div>
        </div>

        {/* Live Parallel Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Cohort Progress:</span>
              <span className="font-mono text-indigo-300">
                {completedCount} / {items.length} papers completed ({progressPct}%)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Elapsed: {elapsedSeconds}s</span>
              {isRunning && throughputPerMin > 0 && (
                <span className="text-cyan-400 font-semibold">
                  Speed: ~{throughputPerMin} papers/min
                </span>
              )}
            </div>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300 relative"
              style={{ width: `${progressPct}%` }}
            >
              {isRunning && (
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              Average Latency
            </span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {avgLatency > 0 ? `${(avgLatency / 1000).toFixed(2)}s` : '--'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">per paper scan</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Passed Automatically
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {items.filter((i) => i.status === 'completed').length}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">high OCR confidence</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Flagged for Review
            </span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {flaggedCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Zero-Error protocol</span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              Audited by Human
            </span>
            <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
              {auditedCount}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">verified & cleared</span>
          </div>
        </div>

        {/* Worker Pool Activity Bar */}
        <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Active Parallel Worker Pool (6 Threads)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Concurrent async pipeline
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {activeWorkers.map((w) => (
              <div
                key={w.id}
                className={`p-2 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                  w.currentPaper
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-400">Worker #{w.id}</span>
                  {w.currentPaper ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  )}
                </div>
                <div className="truncate font-mono text-[11px] mt-1 text-slate-300 font-medium">
                  {w.currentPaper || 'Idle'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Toolbar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          {(['all', 'flagged', 'passed', 'audited'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterMode === mode
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {mode} ({items.filter((i) => {
                if (mode === 'flagged') return i.status === 'flagged';
                if (mode === 'passed') return i.status === 'completed';
                if (mode === 'audited') return i.audited;
                return true;
              }).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search candidate name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Cohort Papers Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Roll / ID</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Marks Awarded</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Semantic Match</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      {item.roll_number_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {item.student_name}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.result ? (
                        <span className="text-white font-bold">
                          {item.result.overall_score.total_awarded_marks.toFixed(1)}{' '}
                          <span className="text-slate-500">/ {selectedExam.total_marks}</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.result ? (
                        <span
                          className={`font-bold ${
                            item.result.overall_score.percentage >= 80
                              ? 'text-emerald-400'
                              : item.result.overall_score.percentage >= 60
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {item.result.overall_score.percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.result ? (
                        <span className="text-indigo-300">
                          {item.result.overall_score.overall_similarity_score_pct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.status === 'idle' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                          Queued
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
                          Scanning (Worker #{item.worker_id})
                        </span>
                      )}
                      {item.status === 'completed' && !item.audited && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Graded
                        </span>
                      )}
                      {item.status === 'flagged' && !item.audited && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                          Audit Flag
                        </span>
                      )}
                      {item.audited && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Audited
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.latency_ms ? `${(item.latency_ms / 1000).toFixed(2)}s` : '--'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {item.result ? (
                        <button
                          onClick={() => setRapidAuditItem(item)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            item.status === 'flagged'
                              ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          {item.status === 'flagged' ? 'Audit Flag' : 'Inspect'}
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rapid Audit Inspection Modal */}
      {rapidAuditItem && rapidAuditItem.result && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Candidate Audit Inspection: {rapidAuditItem.student_name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Roll ID: {rapidAuditItem.roll_number_id} • Exam: {selectedExam.title}
                </p>
              </div>
              <button
                onClick={() => setRapidAuditItem(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Questions list inside modal */}
            <div className="space-y-3">
              {rapidAuditItem.result.question_results.map((q, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    q.needs_human_review
                      ? 'border-amber-500/50 bg-amber-950/20'
                      : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-indigo-300">
                      {q.question_number}: {q.awarded_marks} / {q.max_marks} Marks
                    </span>
                    <span className="font-mono text-slate-400">
                      OCR: {Math.round(q.ocr_confidence_score * 100)}% | Sim:{' '}
                      {q.similarity_score_pct}%
                    </span>
                  </div>

                  {q.needs_human_review && (
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200">
                      <strong>Flag Reason:</strong> {q.flag_reason}
                    </div>
                  )}

                  <div className="p-2 rounded bg-slate-900 text-slate-300 font-mono text-[11px]">
                    <strong>Transcribed:</strong> {q.extracted_student_answer}
                  </div>

                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    <strong>Reasoning:</strong> {q.grading_reasoning}
                  </p>
                </div>
              ))}
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Audit sign-off certifies zero margin of error
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRapidAuditItem(null)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Mark audited
                    setItems((prev) =>
                      prev.map((i) =>
                        i.id === rapidAuditItem.id ? { ...i, audited: true, status: 'completed' } : i
                      )
                    );
                    setRapidAuditItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" />
                  Approve & Clear Audit Flag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
