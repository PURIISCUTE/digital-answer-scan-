export interface PaperMetadata {
  student_name: string;
  roll_number_id: string;
  subject_exam: string;
}

export interface QuestionResult {
  question_number: string;
  question_prompt?: string;
  extracted_student_answer: string;
  master_scheme_answer: string;
  max_marks: number;
  awarded_marks: number;
  similarity_score_pct: number;
  grading_reasoning: string;
  ocr_confidence_score: number;
  needs_human_review: boolean;
  flag_reason: string | null;
  // Audit enhancements
  teacher_override_marks?: number;
  teacher_notes?: string;
  audited_by_human?: boolean;
  audit_timestamp?: string;
}

export interface UploadedExamDocument {
  name: string;
  previewUrl?: string;
  base64?: string;
  mimeType?: string;
  text?: string;
  uploadedAt: string;
}

export interface TrioDocumentState {
  answerSheet: UploadedExamDocument | null;
  questionPaper: UploadedExamDocument | null;
  markingScheme: UploadedExamDocument | null;
}

export interface OverallScore {
  total_awarded_marks: number;
  total_possible_marks: number;
  percentage: number;
  overall_similarity_score_pct: number;
  requires_manual_audit: boolean;
}

export interface GradingEvaluationResult {
  paper_metadata: PaperMetadata;
  overall_score: OverallScore;
  question_results: QuestionResult[];
}

export interface MarkingSchemeQuestion {
  id: string;
  question_number: string;
  question_prompt: string;
  master_scheme_answer: string;
  key_concepts: string;
  partial_credit_rules: string;
  max_marks: number;
}

export interface MasterMarkingScheme {
  id: string;
  title: string;
  subject_exam: string;
  total_marks: number;
  questions: MarkingSchemeQuestion[];
}

export interface StudentPaperSample {
  id: string;
  student_name: string;
  roll_number_id: string;
  handwriting_style: 'neat' | 'cursive' | 'messy_smudged' | 'math_formulas';
  has_ambiguity: boolean;
  answers: {
    question_number: string;
    student_text: string;
    deliberate_flaw?: string;
    ambiguity_note?: string;
  }[];
  generated_image_url?: string;
}

export interface BatchGradingItem {
  id: string;
  student_name: string;
  roll_number_id: string;
  status: 'idle' | 'processing' | 'completed' | 'flagged' | 'error';
  latency_ms?: number;
  result?: GradingEvaluationResult;
  error?: string;
  worker_id?: number;
  audited?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  student_name: string;
  roll_number_id: string;
  question_number: string;
  original_marks: number;
  revised_marks: number;
  reason: string;
  auditor: string;
}

export interface ConceptBreakdownItem {
  concept: string;
  status: 'fully_addressed' | 'partially_addressed' | 'missing';
  evidence_in_student_text: string;
}

export interface TextMatchResult {
  similarity_score_pct: number;
  awarded_marks: number;
  max_marks: number;
  concept_breakdown: ConceptBreakdownItem[];
  matched_keywords: string[];
  missing_keywords: string[];
  grading_reasoning: string;
  feedback_for_student: string;
}

