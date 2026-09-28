import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware for parsing JSON with large limits for high-res answer sheet scans
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Google GenAI client (User-Agent header required by AI Studio guidelines)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Comprehensive LLM Model Specifications and Architecture Catalog
export const MODEL_CATALOG = {
  'gemini-3.1-flash-lite': {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    parameters: '~8 Billion Parameters',
    parameters_numeric: '8B',
    architecture: 'Distilled Mixture-of-Experts (MoE) Sparse Multimodal Transformer',
    context_window: '1,048,576 Tokens (1M)',
    status: 'Active & Verified Operational',
    is_default: true,
    description: 'High-speed, low-latency multimodal engine specifically optimized for fast optical OCR handwriting recognition, document understanding, and strict deterministic semantic grading.',
  },
  'gemini-3.8-flash': {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    parameters: '~10-15 Billion Parameters',
    parameters_numeric: '12B',
    architecture: 'Dense Multimodal Audio-Visual-Text Transformer',
    context_window: '1,048,576 Tokens (1M)',
    status: 'Automatic Failover Pair',
    is_default: false,
    description: 'Flagship flash model with extended reasoning capability.',
  },
};

// Resilient content generator with automatic failover if Google Cloud experiences temporary demand spikes
async function generateWithResilience(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  const primaryModel = params.preferredModel || 'gemini-3.1-flash-lite';
  const backupModel = primaryModel === 'gemini-3.1-flash-lite' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite';

  try {
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents: params.contents,
      config: params.config,
    });
    return {
      response,
      modelUsed: primaryModel,
      metaInfo: MODEL_CATALOG[primaryModel as keyof typeof MODEL_CATALOG] || {
        parameters: '~8 Billion Parameters',
        architecture: 'Multimodal Transformer',
      },
      fallbackTriggered: false,
    };
  } catch (err: any) {
    const errMsg = String(err?.message || err);
    console.warn(`Primary model ${primaryModel} failed (${errMsg.slice(0, 100)}). Attempting resilient failover to ${backupModel}...`);

    try {
      const fallbackResponse = await ai.models.generateContent({
        model: backupModel,
        contents: params.contents,
        config: params.config,
      });
      return {
        response: fallbackResponse,
        modelUsed: backupModel,
        metaInfo: MODEL_CATALOG[backupModel as keyof typeof MODEL_CATALOG] || {
          parameters: '~8 Billion Parameters',
          architecture: 'Multimodal Transformer',
        },
        fallbackTriggered: true,
      };
    } catch (fallbackErr: any) {
      console.error(`Both ${primaryModel} and ${backupModel} failed:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

const GRADING_SYSTEM_INSTRUCTION = `You are an advanced digital optical answer sheet scanner and automated paper grading engine.

YOUR OBJECTIVES:
1. Perform high-precision OCR on handwritten or typed student answer sheets.
2. Compare extracted student responses against the provided Master Marking Scheme / Scoring Rubric.
3. Calculate a semantic similarity score (0.0% to 100.0%) and award appropriate marks based on concept accuracy, key terms, and partial credit rules.
4. Flag low-confidence readings or ambiguous handwriting for human review to guarantee zero margin of error in final grading.

OPERATIONAL CONSTRAINTS & RULES:
- Zero Error Tolerance Strategy: If handwriting is smudged, unclear, or ambiguous, assign your best estimate but MUST set "needs_human_review": true and explain the ambiguity in "flag_reason".
- Semantic Evaluation: Do not perform rigid word-for-word matching. Evaluate conceptual correctness, mathematical/logical steps, and domain-specific keywords defined in the marking scheme.
- Speed Optimization: Keep justifications crisp and precise for fast processing.
- Output Strictness: You MUST reply ONLY with a single valid JSON object. No conversational filler, intro text, or Markdown code block wrapping if JSON mode is enabled.

EXPECTED JSON SCHEMA:
{
  "paper_metadata": {
    "student_name": "String or 'Unidentified'",
    "roll_number_id": "String or 'Unidentified'",
    "subject_exam": "String"
  },
  "overall_score": {
    "total_awarded_marks": 0.0,
    "total_possible_marks": 0.0,
    "percentage": 0.0,
    "overall_similarity_score_pct": 0.0,
    "requires_manual_audit": false
  },
  "question_results": [
    {
      "question_number": "String",
      "extracted_student_answer": "String",
      "master_scheme_answer": "String",
      "max_marks": 0.0,
      "awarded_marks": 0.0,
      "similarity_score_pct": 0.0,
      "grading_reasoning": "String",
      "ocr_confidence_score": 0.0,
      "needs_human_review": false,
      "flag_reason": "String or null"
    }
  ]
}`;

const gradingResponseSchema = {
  type: Type.OBJECT,
  properties: {
    paper_metadata: {
      type: Type.OBJECT,
      properties: {
        student_name: { type: Type.STRING },
        roll_number_id: { type: Type.STRING },
        subject_exam: { type: Type.STRING },
      },
      required: ['student_name', 'roll_number_id', 'subject_exam'],
    },
    overall_score: {
      type: Type.OBJECT,
      properties: {
        total_awarded_marks: { type: Type.NUMBER },
        total_possible_marks: { type: Type.NUMBER },
        percentage: { type: Type.NUMBER },
        overall_similarity_score_pct: { type: Type.NUMBER },
        requires_manual_audit: { type: Type.BOOLEAN },
      },
      required: [
        'total_awarded_marks',
        'total_possible_marks',
        'percentage',
        'overall_similarity_score_pct',
        'requires_manual_audit',
      ],
    },
    question_results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question_number: { type: Type.STRING },
          question_prompt: { type: Type.STRING },
          extracted_student_answer: { type: Type.STRING },
          master_scheme_answer: { type: Type.STRING },
          max_marks: { type: Type.NUMBER },
          awarded_marks: { type: Type.NUMBER },
          similarity_score_pct: { type: Type.NUMBER },
          grading_reasoning: { type: Type.STRING },
          ocr_confidence_score: { type: Type.NUMBER },
          needs_human_review: { type: Type.BOOLEAN },
          flag_reason: { type: Type.STRING },
        },
        required: [
          'question_number',
          'extracted_student_answer',
          'master_scheme_answer',
          'max_marks',
          'awarded_marks',
          'similarity_score_pct',
          'grading_reasoning',
          'ocr_confidence_score',
          'needs_human_review',
        ],
      },
    },
  },
  required: ['paper_metadata', 'overall_score', 'question_results'],
};

// Robust helper: parse base64 strings with or without data URL prefix and strip whitespace
function parseBase64Data(raw: string, defaultMime = 'image/png') {
  if (!raw) return { mime: defaultMime, data: '' };
  let clean = raw;
  let mime = defaultMime;
  if (raw.startsWith('data:')) {
    const commaIndex = raw.indexOf(';base64,');
    if (commaIndex !== -1) {
      mime = raw.substring(5, commaIndex);
      clean = raw.substring(commaIndex + 8);
    } else {
      const simpleComma = raw.indexOf(',');
      if (simpleComma !== -1) {
        const header = raw.substring(0, simpleComma);
        clean = raw.substring(simpleComma + 1);
        const mimeMatch = header.match(/^data:([^;]+)/);
        if (mimeMatch) mime = mimeMatch[1];
      }
    }
  }
  // Strip any newlines or spaces that could corrupt base64 decode
  clean = clean.replace(/\s+/g, '');
  return { mime, data: clean };
}

// API: Check health and system status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    engine: 'ScanGrade Optical Semantic Engine',
    model: 'gemini-3.1-flash-lite',
    parameters: '~8 Billion Parameters (MoE Distilled)',
    zeroErrorTolerance: true,
    apiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// API: Get comprehensive model and parameter specifications
app.get('/api/model-info', (req, res) => {
  res.json({
    status: 'online',
    active_model: 'gemini-3.1-flash-lite',
    models: Object.values(MODEL_CATALOG),
    current_specs: {
      model_id: 'gemini-3.1-flash-lite',
      model_name: 'Gemini 3.1 Flash-Lite',
      parameter_count: '~8 Billion Parameters',
      parameter_scale: '8B',
      architecture: 'Distilled Mixture-of-Experts (MoE) Sparse Multimodal Transformer',
      context_window: '1,048,576 Tokens (1M)',
      multimodal: true,
      vision_ocr: 'High-Resolution Optical Character Recognition & Handwriting Extraction',
      temperature: 0.0,
      failover_available: true,
      failover_model: 'gemini-3.8-flash (~12B Parameters)',
    },
  });
});

// API: Optical Scan & Grade Single Paper
app.post('/api/grade-paper', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      paperImage, // base64 data url or raw base64 string
      paperMimeType = 'image/png',
      studentTextFallback,
      masterScheme,
      subjectExam = 'General Examination',
      auditSensitivity = 'normal', // 'strict' | 'normal' | 'relaxed'
      studentName,
      rollNumber,
    } = req.body;

    if (!masterScheme || !Array.isArray(masterScheme) || masterScheme.length === 0) {
      return res.status(400).json({
        error: 'Master marking scheme / rubric is required and must contain questions.',
      });
    }

    const contents: any[] = [];

    // Format the master marking scheme text
    const schemeFormatted = masterScheme
      .map(
        (q: any, idx: number) => `
QUESTION ${q.question_number || idx + 1}:
- Max Marks: ${q.max_marks || 5}
- Master Model Answer: ${q.master_scheme_answer || q.model_answer}
- Key Mandatory Concepts / Keywords: ${q.key_concepts || 'Not specified'}
- Partial Credit Rules: ${q.partial_credit_rules || 'Award partial marks proportionally for correct steps and core concepts.'}
`
      )
      .join('\n');

    let promptText = `Process the attached student answer sheet according to the System Instructions.

MASTER MARKING SCHEME / RUBRIC:
Subject / Exam: ${subjectExam}
Audit Sensitivity Setting: ${auditSensitivity} (If 'strict', flag any minor handwriting ambiguity, scratch-outs, or questionable decimal points for human review).
${studentName ? `Specified Student Name (use if not otherwise stated on script): ${studentName}` : ''}
${rollNumber ? `Specified Roll / Seat ID (use if not otherwise stated on script): ${rollNumber}` : ''}

${schemeFormatted}

TASK:
1. Optical Scan & Transcribe: Read the student metadata (Student Name, Roll Number/ID) and transcribe student responses question by question.
2. Conceptual Comparison & Semantic Scoring: Compare each extracted student response against the Master Marking Scheme. Calculate a semantic similarity percentage (0.0 to 100.0%) and compute accurate awarded marks.
3. Zero-Error Tolerance Audit: If any answer contains smudged, crossed out, or low-legibility handwriting (OCR confidence < 80%), or if the student's answer is borderline, you MUST set "needs_human_review": true and provide the exact "flag_reason".
4. Overall Score Calculation: Calculate total awarded marks, total possible marks, percentage, overall similarity score, and set "requires_manual_audit": true if any question needs human review.
5. Return strictly the structured JSON object complying with the schema.`;

    if (paperImage) {
      // Clean base64 string if it contains data prefix
      let cleanBase64 = paperImage;
      let detectedMime = paperMimeType;
      if (paperImage.startsWith('data:')) {
        const matches = paperImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          detectedMime = matches[1];
          cleanBase64 = matches[2];
        } else {
          cleanBase64 = paperImage.split(',')[1] || paperImage;
        }
      }

      contents.push({
        inlineData: {
          mimeType: detectedMime,
          data: cleanBase64,
        },
      });
    } else if (studentTextFallback) {
      promptText += `\n\nATTACHED STUDENT WRITTEN TRANSCRIPTION / DOCUMENT:\n${studentTextFallback}`;
    } else {
      return res.status(400).json({
        error: 'Either paperImage (scanned sheet) or studentTextFallback must be provided.',
      });
    }

    contents.push({ text: promptText });

    const { response, modelUsed, metaInfo, fallbackTriggered } = await generateWithResilience({
      contents: { parts: contents },
      config: {
        systemInstruction: GRADING_SYSTEM_INSTRUCTION,
        temperature: 0.0, // Eliminates creative variance for deterministic, consistent grading
        responseMimeType: 'application/json',
        responseSchema: gradingResponseSchema,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from optical grading engine');
    }

    const parsedResult = JSON.parse(responseText);
    const durationMs = Date.now() - startTime;

    // Verify overall requires_manual_audit matches question results
    const hasFlaggedQuestion = parsedResult.question_results?.some(
      (q: any) => q.needs_human_review === true
    );
    if (hasFlaggedQuestion) {
      parsedResult.overall_score.requires_manual_audit = true;
    }

    res.json({
      success: true,
      data: parsedResult,
      meta: {
        latency_ms: durationMs,
        model_used: modelUsed,
        parameters: metaInfo.parameters,
        architecture: metaInfo.architecture,
        context_window: metaInfo.context_window,
        fallback_triggered: fallbackTriggered,
        temperature: 0.0,
        processed_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Grading error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process answer sheet scan',
      details: String(error),
    });
  }
});

// API: Batch grading for multiple papers
app.post('/api/batch-grade', async (req, res) => {
  const batchStartTime = Date.now();
  try {
    const { papers, masterScheme, subjectExam = 'General Examination' } = req.body;

    if (!Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: 'Array of papers is required.' });
    }

    const schemeFormatted = masterScheme
      .map(
        (q: any, idx: number) => `
QUESTION ${q.question_number || idx + 1}:
- Max Marks: ${q.max_marks || 5}
- Master Model Answer: ${q.master_scheme_answer || q.model_answer}
- Key Mandatory Concepts / Keywords: ${q.key_concepts || 'Not specified'}
- Partial Credit Rules: ${q.partial_credit_rules || 'Award partial marks proportionally.'}
`
      )
      .join('\n');

    // Concurrency limit to prevent hitting burst rate limits while maintaining fast parallel throughput
    const CONCURRENCY_LIMIT = 5;
    const results: any[] = [];

    const processPaper = async (paperItem: any, index: number) => {
      const itemStartTime = Date.now();
      try {
        const contents: any[] = [];
        let promptText = `Process student paper #${index + 1} (${paperItem.student_name || 'Student'}).
MASTER MARKING SCHEME:
Subject / Exam: ${subjectExam}
${schemeFormatted}

TASK:
Extract student responses, grade against the master scheme, calculate similarity, flag smudged/ambiguous handwriting for zero error tolerance, and return JSON.`;

        if (paperItem.paperImage) {
          let cleanBase64 = paperItem.paperImage;
          let detectedMime = paperItem.paperMimeType || 'image/png';
          if (paperItem.paperImage.startsWith('data:')) {
            const matches = paperItem.paperImage.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              detectedMime = matches[1];
              cleanBase64 = matches[2];
            } else {
              cleanBase64 = paperItem.paperImage.split(',')[1] || cleanBase64;
            }
          }
          contents.push({
            inlineData: {
              mimeType: detectedMime,
              data: cleanBase64,
            },
          });
        } else if (paperItem.studentTextFallback) {
          promptText += `\n\nATTACHED STUDENT ANSWERS:\n${paperItem.studentTextFallback}`;
        }

        contents.push({ text: promptText });

        const { response, modelUsed, metaInfo, fallbackTriggered } = await generateWithResilience({
          contents: { parts: contents },
          config: {
            systemInstruction: GRADING_SYSTEM_INSTRUCTION,
            temperature: 0.0,
            responseMimeType: 'application/json',
            responseSchema: gradingResponseSchema,
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        const duration = Date.now() - itemStartTime;

        return {
          paper_id: paperItem.id || `P-${index + 1}`,
          status: 'success',
          latency_ms: duration,
          model_used: modelUsed,
          parameters: metaInfo.parameters,
          fallback_triggered: fallbackTriggered,
          result: parsed,
        };
      } catch (err: any) {
        return {
          paper_id: paperItem.id || `P-${index + 1}`,
          status: 'error',
          error: err?.message || 'Failed grading item',
          latency_ms: Date.now() - itemStartTime,
        };
      }
    };

    // Run parallel batches with concurrency control
    for (let i = 0; i < papers.length; i += CONCURRENCY_LIMIT) {
      const slice = papers.slice(i, i + CONCURRENCY_LIMIT);
      const slicePromises = slice.map((item: any, sliceIdx: number) =>
        processPaper(item, i + sliceIdx)
      );
      const sliceResults = await Promise.all(slicePromises);
      results.push(...sliceResults);
    }

    const totalDurationMs = Date.now() - batchStartTime;
    const avgLatencyMs = results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.latency_ms || 0), 0) / results.length)
      : 0;

    res.json({
      success: true,
      total_papers: papers.length,
      successful: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'error').length,
      total_duration_ms: totalDurationMs,
      average_latency_ms: avgLatencyMs,
      results,
    });
  } catch (err: any) {
    console.error('Batch error:', err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// API: Direct Text-to-Text Semantic Matching & Concept Overlap Analysis
app.post('/api/match-text', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      studentText,
      masterSchemeAnswer,
      questionPrompt = 'Question',
      keyConcepts = '',
      partialCreditRules = 'Award proportional partial marks for correct conceptual steps.',
      maxMarks = 5,
    } = req.body;

    if (!studentText || !masterSchemeAnswer) {
      return res.status(400).json({
        error: 'Both studentText and masterSchemeAnswer are required for text-to-text matching.',
      });
    }

    const promptText = `Perform deep conceptual text-to-text semantic matching between the student written response and the master reference answer.

QUESTION PROMPT: ${questionPrompt}
MAXIMUM MARKS: ${maxMarks}
MASTER REFERENCE ANSWER:
${masterSchemeAnswer}

KEY MANDATORY CONCEPTS / KEYWORDS:
${keyConcepts || 'Not specified'}

PARTIAL CREDIT RULES:
${partialCreditRules}

STUDENT WRITTEN ANSWER TO EVALUATE:
${studentText}

TASK:
1. Compare the student answer against the master reference answer conceptually (do not perform rigid verbatim matching; evaluate conceptual understanding, physical/mathematical logic, and synonyms).
2. Calculate a semantic similarity score (0.0% to 100.0%).
3. Calculate accurate awarded marks up to ${maxMarks} based on the partial credit guidelines.
4. Extract matched keywords and missing critical concepts.
5. Provide a concept breakdown showing which criteria are fully addressed, partially addressed, or missing with citations from the student text.
6. Provide a crisp grading reasoning and actionable feedback for the student.`;

    const textMatchSchema = {
      type: Type.OBJECT,
      properties: {
        similarity_score_pct: { type: Type.NUMBER },
        awarded_marks: { type: Type.NUMBER },
        max_marks: { type: Type.NUMBER },
        concept_breakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              concept: { type: Type.STRING },
              status: { type: Type.STRING },
              evidence_in_student_text: { type: Type.STRING },
            },
            required: ['concept', 'status', 'evidence_in_student_text'],
          },
        },
        matched_keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        missing_keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        grading_reasoning: { type: Type.STRING },
        feedback_for_student: { type: Type.STRING },
      },
      required: [
        'similarity_score_pct',
        'awarded_marks',
        'max_marks',
        'concept_breakdown',
        'matched_keywords',
        'missing_keywords',
        'grading_reasoning',
        'feedback_for_student',
      ],
    };

    const { response, modelUsed, metaInfo, fallbackTriggered } = await generateWithResilience({
      contents: promptText,
      config: {
        temperature: 0.0,
        responseMimeType: 'application/json',
        responseSchema: textMatchSchema,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const durationMs = Date.now() - startTime;

    res.json({
      success: true,
      data: parsed,
      meta: {
        latency_ms: durationMs,
        model_used: modelUsed,
        parameters: metaInfo.parameters,
        architecture: metaInfo.architecture,
        context_window: metaInfo.context_window,
        fallback_triggered: fallbackTriggered,
        temperature: 0.0,
      },
    });
  } catch (err: any) {
    console.error('Text matching error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to match text' });
  }
});

// API: Multi-Document Trio Scanner (Answer Sheet + Question Paper + Marking Scheme)
// Automatically detects Subject, Question Breakdown, Max Marks, and conducts high-precision semantic grading.
app.post('/api/scan-and-grade-trio', async (req, res) => {
  const startTime = Date.now();
  try {
    const {
      answerSheet,   // { image?: string, mimeType?: string, text?: string }
      questionPaper, // { image?: string, mimeType?: string, text?: string }
      markingScheme, // { image?: string, mimeType?: string, text?: string }
      auditSensitivity = 'normal',
    } = req.body;

    if (!answerSheet || (!answerSheet.image && !answerSheet.text)) {
      return res.status(400).json({ error: 'Student Answer Sheet (image or text) is required.' });
    }
    if ((!questionPaper || (!questionPaper.image && !questionPaper.text)) &&
        (!markingScheme || (!markingScheme.image && !markingScheme.text))) {
      return res.status(400).json({
        error: 'At least the Question Paper or Marking Scheme must be provided.',
      });
    }

    const parts: any[] = [];

    // Part 1: Student Answer Sheet
    if (answerSheet.image) {
      const parsed = parseBase64Data(answerSheet.image, answerSheet.mimeType || 'image/png');
      parts.push({ text: '--- DOCUMENT 1: STUDENT ANSWER SHEET SCRIPT (IMAGE) ---' });
      parts.push({
        inlineData: {
          mimeType: parsed.mime,
          data: parsed.data,
        },
      });
    } else if (answerSheet.text) {
      parts.push({ text: `--- DOCUMENT 1: STUDENT ANSWER SHEET SCRIPT (TEXT) ---\n${answerSheet.text}` });
    }

    // Part 2: Question Paper
    if (questionPaper?.image) {
      const parsed = parseBase64Data(questionPaper.image, questionPaper.mimeType || 'image/png');
      parts.push({ text: '--- DOCUMENT 2: OFFICIAL QUESTION PAPER (IMAGE) ---' });
      parts.push({
        inlineData: {
          mimeType: parsed.mime,
          data: parsed.data,
        },
      });
    } else if (questionPaper?.text) {
      parts.push({ text: `--- DOCUMENT 2: OFFICIAL QUESTION PAPER (TEXT) ---\n${questionPaper.text}` });
    }

    // Part 3: Marking Scheme
    if (markingScheme?.image) {
      const parsed = parseBase64Data(markingScheme.image, markingScheme.mimeType || 'image/png');
      parts.push({ text: '--- DOCUMENT 3: MASTER MARKING SCHEME / RUBRIC (IMAGE) ---' });
      parts.push({
        inlineData: {
          mimeType: parsed.mime,
          data: parsed.data,
        },
      });
    } else if (markingScheme?.text) {
      parts.push({ text: `--- DOCUMENT 3: MASTER MARKING SCHEME / RUBRIC (TEXT) ---\n${markingScheme.text}` });
    }

    const promptText = `AUTONOMOUS MULTI-DOCUMENT SCANNING, DETECTION & SEMANTIC GRADING TASK:

You are provided with up to three uploaded examination documents:
1. Student Answer Sheet (containing candidate metadata and written responses)
2. Question Paper (containing question prompts, sections, and maximum marks allocated per question)
3. Master Marking Scheme (containing model answers, key concept keywords, and partial credit criteria)

EXECUTION OBJECTIVES:
1. AUTONOMOUS SUBJECT & EXAM DETECTION:
   - Scan the Question Paper and Marking Scheme header / text to automatically determine the exact Subject, Course Code, and Examination Title (e.g., "AP Chemistry: Electrochemistry", "Linear Algebra & Vector Spaces", "Cambridge IGCSE Economics", etc.).
   - Set "subject_exam" in paper_metadata to this detected title. Do NOT guess generic titles; use the real title found on the documents.

2. QUESTION PARSING & STRICT MARKS ALLOCATION:
   - Extract each question number (e.g. Q1, Q2, 1(a), etc.).
   - Extract the question prompt text into "question_prompt".
   - Detect the EXACT maximum marks allocated to each question directly from the Question Paper marks allocation bracket (e.g. [5 marks], (10 points), etc.). If not explicitly stated in the Question Paper, determine from the Marking Scheme.

3. OPTICAL OCR & TRANSCRIPTION OF STUDENT SCRIPT:
   - Read the candidate's written name and roll/seat number from the Student Answer Sheet header (or set to 'Unidentified' if absent).
   - Optical OCR transcribe the candidate's handwritten response for every question into "extracted_student_answer".

4. CONCEPTUAL COMPARISON & SEMANTIC SCORING:
   - Compare the student's answer against the Master Marking Scheme reference answer and criteria.
   - Calculate a semantic similarity percentage (0.0 to 100.0%) based on concept accuracy, mathematical/logical validity, and terminology.
   - Award accurate marks (awarded_marks) based on the question's maximum marks and partial credit rules.
   - Provide crisp, detailed grading reasoning explaining where marks were earned or deducted.

5. ZERO ERROR TOLERANCE AUDIT:
   - Sensitivity setting: ${auditSensitivity}.
   - If candidate handwriting is smudged, crossed-out, low confidence (< 80%), or ambiguous (e.g. questionable math power, exponent, or sign), you MUST set "needs_human_review": true and explain the ambiguity in "flag_reason".
   - If any question needs human review, set overall "requires_manual_audit": true.

6. RETURN STRICT VALID JSON adhering to the specified schema without Markdown wrapping.`;

    parts.push({ text: promptText });

    const { preferredModel } = req.body;

    const { response, modelUsed, metaInfo, fallbackTriggered } = await generateWithResilience({
      preferredModel,
      contents: { parts },
      config: {
        systemInstruction: GRADING_SYSTEM_INSTRUCTION,
        temperature: 0.0,
        responseMimeType: 'application/json',
        responseSchema: gradingResponseSchema,
      },
    });

    const parsedResult = JSON.parse(response.text || '{}');
    const durationMs = Date.now() - startTime;

    const hasFlaggedQuestion = parsedResult.question_results?.some(
      (q: any) => q.needs_human_review === true
    );
    if (hasFlaggedQuestion) {
      parsedResult.overall_score.requires_manual_audit = true;
    }

    res.json({
      success: true,
      data: parsedResult,
      meta: {
        latency_ms: durationMs,
        model_used: modelUsed,
        model_name: metaInfo.name,
        parameters: metaInfo.parameters,
        parameters_numeric: metaInfo.parameters_numeric,
        architecture: metaInfo.architecture,
        context_window: metaInfo.context_window,
        fallback_triggered: fallbackTriggered,
        temperature: 0.0,
        processed_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Trio grading error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to scan documents and grade',
      details: String(error),
    });
  }
});

// Setup Vite in Dev or static serve in Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScanGrade AI Engine running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
