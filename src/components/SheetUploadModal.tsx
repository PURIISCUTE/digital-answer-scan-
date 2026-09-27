import React, { useState, useRef } from 'react';
import {
  Upload,
  FileImage,
  X,
  CheckCircle2,
  Sparkles,
  User,
  Hash,
  BookOpen,
  Camera,
  Play,
  RotateCw,
  Sliders,
} from 'lucide-react';
import { MasterMarkingScheme, StudentPaperSample } from '../types/grading';
import { renderAnswerSheetToDataUrl } from '../utils/sheetCanvasRenderer';

interface SheetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExam: MasterMarkingScheme;
  onConfirmUploadAndCheck: (data: {
    imageUrl: string;
    studentName: string;
    rollNumber: string;
    sensitivity: 'strict' | 'normal' | 'relaxed';
  }) => void;
  benchmarkSamples: StudentPaperSample[];
}

export const SheetUploadModal: React.FC<SheetUploadModalProps> = ({
  isOpen,
  onClose,
  selectedExam,
  onConfirmUploadAndCheck,
  benchmarkSamples,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('Uploaded Candidate');
  const [rollNumber, setRollNumber] = useState<string>(
    `SCAN-${Date.now().toString().slice(-4)}`
  );
  const [sensitivity, setSensitivity] = useState<'strict' | 'normal' | 'relaxed'>('normal');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    // Auto-derive clean name from filename
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    setStudentName(cleanName || 'Uploaded Candidate');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviewUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick preset loader
  const handleLoadPresetSample = (sample: StudentPaperSample) => {
    const url = renderAnswerSheetToDataUrl(sample, selectedExam.title);
    setPreviewUrl(url);
    setFileName(`${sample.student_name}_Scan.png`);
    setStudentName(sample.student_name);
    setRollNumber(sample.roll_number_id);
  };

  const handleConfirmAndRun = () => {
    if (!previewUrl) return;
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmUploadAndCheck({
        imageUrl: previewUrl,
        studentName,
        rollNumber,
        sensitivity,
      });
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Upload Student Answer Sheet
              </h3>
              <p className="text-xs text-slate-400">
                Upload image scan (PNG, JPG, PDF) for high-precision OCR and semantic grading
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone Area */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-950'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                <FileImage className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Click to browse or drag & drop student answer sheet
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports high-res PNG, JPG, JPEG, WebP, PDF (scanned or photo)
                </p>
              </div>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 text-xs font-medium border border-slate-700">
                Browse Files
              </span>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-20 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-md shrink-0">
                  <img
                    src={previewUrl}
                    alt="Answer Sheet Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>File Ready for Optical Scanning</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-xs">
                    {fileName || 'Answer_Sheet_Candidate.png'}
                  </p>
                  <span className="text-[11px] text-indigo-400 font-mono">
                    300 DPI Optical Pre-processing Applied
                  </span>
                </div>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Change Image
              </button>
            </div>
          )}
        </div>

        {/* Quick Benchmark Preset Chooser */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Or Select a Benchmark Test Paper:
          </span>
          <div className="flex flex-wrap gap-2">
            {benchmarkSamples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleLoadPresetSample(sample)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <span>{sample.student_name}</span>
                {sample.has_ambiguity && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 font-bold">
                    Zero-Error Test
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate Details Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Candidate / Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-400" />
              Candidate Roll / Seat ID
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono font-medium focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Strictness selector */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Zero-Error Tolerance Strictness:</span>
          </div>
          <select
            value={sensitivity}
            onChange={(e: any) => setSensitivity(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-medium focus:outline-none"
          >
            <option value="strict">Strict (Flag Any Handwriting Ambiguity)</option>
            <option value="normal">Normal (Standard Threshold)</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmAndRun}
            disabled={!previewUrl || isProcessing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
              !previewUrl || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-indigo-600/30 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Launching Scanner...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Upload & Run Optical Grade</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
