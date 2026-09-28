import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Percent,
  Award,
  Zap,
  RotateCcw,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Check,
  Tag,
} from 'lucide-react';
import { MasterMarkingScheme, TextMatchResult, MarkingSchemeQuestion } from '../types/grading';

interface TextMatchingPlaygroundProps {
  selectedExam?: MasterMarkingScheme;
}

const DEFAULT_PRESETS = [
  {
    id: 'physics',
    subject: 'Thermodynamics & Carnot Engine',
    prompt: 'Derive the Carnot efficiency equation and explain why 100% efficiency is physically impossible.',
    maxMarks: 6,
    masterAnswer: 'Carnot efficiency is η = 1 - (Tc / Th). 100% efficiency (η = 1) requires Tc = 0 K (absolute zero), which violates the Third Law of Thermodynamics, or Th = ∞ which is physically unrealizable. Furthermore, the Kelvin-Planck statement of the Second Law dictates that no engine operating in a cycle can convert all absorbed heat into work without discharging heat to a colder sink.',
    keyConcepts: 'η = 1 - (Tc/Th), Absolute zero Tc=0 K unattainable, Second Law Kelvin-Planck statement, Third law, heat rejected to cold sink.',
    partialRules: 'Award 3 marks for correct mathematical formula derivation with Th and Tc; award 3 marks for thermodynamic reasoning (Second/Third Law and impossibility of absolute zero sink).',
    studentText: 'Carnot efficiency is η = 1 - (Tc / Th). 100% efficiency is impossible because the cold reservoir cannot reach absolute zero (Tc = 0 K) by the Third Law of Thermodynamics. Furthermore, the Second Law Kelvin-Planck statement forbids cyclic engines converting all heat into work without dumping heat to a cold sink.',
  },
  {
    id: 'chemistry',
    subject: 'Electrochemistry & Nernst Equation',
    prompt: 'State the Nernst equation for cell potential and explain why voltage drops as reaction quotient Q increases.',
    maxMarks: 6,
    masterAnswer: 'The Nernst equation is E_cell = E°cell - (RT/nF)ln(Q). As the cell discharges, reactants convert to products, increasing Q ([products]/[reactants]). The term (RT/nF)ln(Q) becomes more positive, thus decreasing E_cell until E_cell = 0 at equilibrium (Q = K).',
    keyConcepts: 'E_cell = E° - (RT/nF)ln(Q), reaction quotient Q increases, voltage decay, chemical equilibrium E_cell = 0.',
    partialRules: 'Award 3 marks for correct equation; award 3 marks for qualitative and mathematical explanation of Q increasing and voltage reaching 0.',
    studentText: 'Nernst equation is E = E0 - (0.0592/n)*log(Q). As reaction proceeds, product concentration builds up so Q increases. This makes the subtraction term larger, lowering the measured cell potential until the battery dies at equilibrium when E = 0.',
  },
  {
    id: 'biology',
    subject: 'Cellular Respiration & Glycolysis',
    prompt: 'Detail the net energetic yield of Glycolysis from one glucose molecule under aerobic conditions.',
    maxMarks: 5,
    masterAnswer: 'From 1 glucose molecule, glycolysis produces a net yield of 2 ATP (4 ATP produced via substrate-level phosphorylation minus 2 ATP invested in the preparatory phase), 2 NADH electron carriers, and 2 molecules of pyruvate.',
    keyConcepts: 'Net 2 ATP, 2 NADH, 2 pyruvate, substrate-level phosphorylation, investment vs payoff phase.',
    partialRules: 'Award 2 marks for net 2 ATP with investment explanation; award 2 marks for 2 NADH; award 1 mark for 2 pyruvate.',
    studentText: 'Glycolysis breaks 1 glucose into 2 pyruvate molecules, yielding 2 ATP net (4 made, 2 used up in the first steps) and 2 NADH molecules for the electron transport chain.',
  },
];

export const TextMatchingPlayground: React.FC<TextMatchingPlaygroundProps> = ({
  selectedExam,
}) => {
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const currentPreset = DEFAULT_PRESETS[activePresetIndex];

  const [questionPrompt, setQuestionPrompt] = useState<string>(currentPreset.prompt);
  const [studentText, setStudentText] = useState<string>(currentPreset.studentText);
  const [customMasterAnswer, setCustomMasterAnswer] = useState<string>(currentPreset.masterAnswer);
  const [customKeyConcepts, setCustomKeyConcepts] = useState<string>(currentPreset.keyConcepts);
  const [customPartialRules, setCustomPartialRules] = useState<string>(currentPreset.partialRules);
  const [maxMarks, setMaxMarks] = useState<number>(currentPreset.maxMarks);

  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchResult, setMatchResult] = useState<TextMatchResult | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPreset = (idx: number) => {
    setActivePresetIndex(idx);
    setErrorMessage(null);
    setMatchResult(null);
    const p = DEFAULT_PRESETS[idx];
    if (p) {
      setQuestionPrompt(p.prompt);
      setStudentText(p.studentText);
      setCustomMasterAnswer(p.masterAnswer);
      setCustomKeyConcepts(p.keyConcepts);
      setCustomPartialRules(p.partialRules);
      setMaxMarks(p.maxMarks);
    }
  };

  const handleClearAll = () => {
    setStudentText('');
    setCustomMasterAnswer('');
    setCustomKeyConcepts('');
    setCustomPartialRules('');
    setMatchResult(null);
    setErrorMessage(null);
  };

  // Preset student text templates demonstrating semantic evaluation
  const presets = [
    {
      label: 'Strong Concept (Synonyms & Rephrased)',
      text:
        'The maximum theoretical thermal efficiency of a Carnot cycle is given by η = 1 - Tc/Th. Attaining unity (100% conversion) would necessitate an absolute zero cold reservoir (0 Kelvin), which contradicts the Third Law of Thermodynamics. Furthermore, Kelvin-Planck principles of the Second Law require waste heat expulsion.',
    },
    {
      label: 'Partially Correct (Missing 2nd/3rd Law names)',
      text:
        'Efficiency is e = 1 - (Tc/Th). To get 100% efficiency, Tc would have to be 0 K. But you cannot ever reach absolute zero in real physics so efficiency is always less than 1.',
    },
    {
      label: 'Common Misconception (Wrong Equation / Friction)',
      text:
        'Carnot efficiency is Tc / Th. It cannot be 100% because mechanical friction and heat loss to the surrounding air always takes away energy from the pistons.',
    },
    {
      label: 'Minimal / Superficial Answer',
      text:
        'The formula uses Th and Tc. You can never get 100% efficiency because perpetual motion machines do not exist.',
    },
  ];

  const handleRunMatch = async () => {
    if (!studentText.trim() || !customMasterAnswer.trim()) {
      setErrorMessage('Please provide both the student answer and the master model answer to perform semantic matching.');
      return;
    }

    setIsMatching(true);
    setErrorMessage(null);
    const start = Date.now();

    try {
      const response = await fetch('/api/match-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentText,
          masterSchemeAnswer: customMasterAnswer,
          questionPrompt: questionPrompt || 'General Question',
          keyConcepts: customKeyConcepts,
          partialCreditRules: customPartialRules,
          maxMarks,
        }),
      });

      let data: any;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const errorText = await response.text();
        throw new Error(
          errorText.includes('A server error') || response.status === 500
            ? 'Vercel Server Notice: Backend encountered an error. Ensure GEMINI_API_KEY is configured in your Vercel Project Settings > Environment Variables.'
            : (errorText || `Server returned HTTP ${response.status}: ${response.statusText}`)
        );
      }

      if (data.success && data.data) {
        setMatchResult(data.data);
        setLatencyMs(data.meta?.latency_ms || Date.now() - start);
      } else {
        setErrorMessage(data.error || 'Live semantic matching API returned an error.');
      }
    } catch (err: any) {
      console.error('Backend match failed:', err);
      setErrorMessage(err?.message || 'Failed to connect to the live AI grading server.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/20">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Text-to-Text Semantic Matching Playground
            </h2>
            <p className="text-xs text-slate-400">
              Test pure semantic similarity, conceptual overlap, and partial credit scoring without image uploads
            </p>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-medium">Presets:</span>
          {DEFAULT_PRESETS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                activePresetIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.id.toUpperCase()}
            </button>
          ))}
          <button
            onClick={handleClearAll}
            className="px-2.5 py-1 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Clear all fields to type your own custom question & answer"
          >
            Clear / Blank
          </button>
        </div>
      </div>

      {/* LLM Engine & Parameters Info Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400">LLM Engine:</span>
          <span className="text-white font-bold">Gemini 3.1 Flash-Lite</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 text-[11px] font-bold">
            ~8 Billion Parameters
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span>Context: 1,048,576 Tokens</span>
          <span>•</span>
          <span className="text-emerald-400">Temperature: 0.0 (Zero Variance)</span>
          {latencyMs && (
            <>
              <span>•</span>
              <span className="text-cyan-400 font-bold">Latency: {latencyMs}ms</span>
            </>
          )}
        </div>
      </div>

      {/* Main Dual Editor: Master Reference vs Student Text */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side: Master Scheme Reference Answer */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Master Rubric Reference Answer
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Max Marks:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={maxMarks}
                onChange={(e) => setMaxMarks(parseFloat(e.target.value) || 1)}
                className="w-14 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-center text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Active Question Prompt (Editable)
            </label>
            <textarea
              rows={2}
              value={questionPrompt}
              onChange={(e) => setQuestionPrompt(e.target.value)}
              className="w-full text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed font-medium focus:border-cyan-500 focus:outline-none"
              placeholder="Enter question prompt..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
              Master Model Answer (Gold Standard)
            </label>
            <textarea
              rows={4}
              value={customMasterAnswer}
              onChange={(e) => setCustomMasterAnswer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-cyan-400 mb-1">
              Required Key Concepts & Keywords
            </label>
            <input
              type="text"
              value={customKeyConcepts}
              onChange={(e) => setCustomKeyConcepts(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-amber-400 mb-1">
              Partial Credit Rules
            </label>
            <input
              type="text"
              value={customPartialRules}
              onChange={(e) => setCustomPartialRules(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right Side: Student Text to Evaluate */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Student Written Text To Grade
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Freeform text / Copied Transcript
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Quick Test Presets (Compare Phrasing Styles):
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setStudentText(p.text)}
                  className="text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  <span className="font-semibold block text-indigo-300 truncate">
                    {p.label}
                  </span>
                  <span className="text-slate-500 truncate block text-[10px]">
                    "{p.text.slice(0, 38)}..."
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Student Text Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Candidate Response Text
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {studentText.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={6}
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="Paste or type candidate text here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:outline-none leading-relaxed font-mono"
            />
          </div>

          {/* Run Match Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStudentText('')}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 border border-slate-800"
              >
                Clear Answer
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-950 border border-slate-800"
                title="Clear all fields to write a custom question and answer from scratch"
              >
                Reset to Blank Canvas
              </button>
            </div>

            <button
              onClick={handleRunMatch}
              disabled={isMatching || !studentText.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isMatching || !studentText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-500 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/25 active:scale-95'
              }`}
            >
              {isMatching ? (
                <>
                  <Zap className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Computing Live Semantic Match...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Semantic Match (Live AI)</span>
                </>
              )}
            </button>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Live API Evaluation Note:</span>
                <p className="mt-0.5 text-rose-200">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Semantic Match Results Section */}
      {matchResult && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Semantic Match & Conceptual Overlap Report
              </h3>
              <p className="text-xs text-slate-400">
                Evaluation generated via deterministic semantic reasoning
              </p>
            </div>

            {latencyMs && (
              <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                Processed in {(latencyMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>

          {/* Scores Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Semantic Similarity Gauge */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Semantic Similarity Score
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-black font-mono ${
                    matchResult.similarity_score_pct >= 80
                      ? 'text-emerald-400'
                      : matchResult.similarity_score_pct >= 55
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {matchResult.similarity_score_pct.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 font-medium">Concept Alignment</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    matchResult.similarity_score_pct >= 80
                      ? 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                      : matchResult.similarity_score_pct >= 55
                      ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                      : 'bg-gradient-to-r from-rose-500 to-amber-500'
                  }`}
                  style={{ width: `${matchResult.similarity_score_pct}%` }}
                ></div>
              </div>
            </div>

            {/* Awarded Marks */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Awarded Marks
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {matchResult.awarded_marks.toFixed(1)}
                </span>
                <span className="text-xs font-mono text-slate-400">/ {matchResult.max_marks} Max</span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {Math.round((matchResult.awarded_marks / matchResult.max_marks) * 100)}% of total question credit
              </p>
            </div>

            {/* Assessment Verdict */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Evaluation Verdict
              </span>
              <div className="flex items-center gap-2 mt-1">
                {matchResult.similarity_score_pct >= 80 ? (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Full Concept Mastery
                  </span>
                ) : matchResult.similarity_score_pct >= 55 ? (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Partial Credit Awarded
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Insufficient Concept Coverage
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Non-verbatim conceptual evaluation
              </p>
            </div>
          </div>

          {/* Concept Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Detailed Concept Rubric Breakdown
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Rubric Criterion / Target Concept</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4">Evidence in Student Text</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {matchResult.concept_breakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-semibold text-white">
                        {item.concept}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {item.status === 'fully_addressed' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Fully Addressed
                          </span>
                        )}
                        {item.status === 'partially_addressed' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Partially Addressed
                          </span>
                        )}
                        {item.status === 'missing' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px] leading-relaxed">
                        {item.evidence_in_student_text}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matched Keywords vs Missing Keywords Pills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Core Concepts & Key Terms:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.matched_keywords.length > 0 ? (
                  matchResult.matched_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    >
                      ✓ {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No key terms matched</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Missing or Incomplete Concepts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {matchResult.missing_keywords.length > 0 ? (
                  matchResult.missing_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30"
                    >
                      ✗ {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-400 italic">
                    All major concepts were addressed!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Justification & Student Feedback */}
          <div className="space-y-3">
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-indigo-300">
                Automated Semantic Reasoning:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {matchResult.grading_reasoning}
              </p>
            </div>

            <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Pedagogical Feedback for Candidate:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {matchResult.feedback_for_student}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
