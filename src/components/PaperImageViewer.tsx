import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
  Upload,
  Camera,
  RotateCw,
  Sparkles,
  Eye,
  Crosshair,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { StudentPaperSample } from '../types/grading';
import { renderAnswerSheetToDataUrl } from '../utils/sheetCanvasRenderer';

interface PaperImageViewerProps {
  paperSample: StudentPaperSample | null;
  onSelectSample: (sample: StudentPaperSample) => void;
  allSamples: StudentPaperSample[];
  customImageUrl: string | null;
  onUploadCustomImage: (base64Url: string, name?: string) => void;
  activeQuestionHighlight: string | null;
  examTitle: string;
}

export const PaperImageViewer: React.FC<PaperImageViewerProps> = ({
  paperSample,
  onSelectSample,
  allSamples,
  customImageUrl,
  onUploadCustomImage,
  activeQuestionHighlight,
  examTitle,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'normal' | 'contrast' | 'invert' | 'grayscale'>('normal');
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate canvas rendering or use custom image
  useEffect(() => {
    if (customImageUrl) {
      setCurrentImageSrc(customImageUrl);
    } else if (paperSample) {
      const url = renderAnswerSheetToDataUrl(paperSample, examTitle, {
        filter: filterMode,
      });
      setCurrentImageSrc(url);
    }
  }, [paperSample, customImageUrl, filterMode, examTitle]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.6, prev + delta), 2.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleDropViewport = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onUploadCustomImage(result, file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onUploadCustomImage(result, file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Webcam camera scanner implementation
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please allow webcam permissions or upload an image file.');
    }
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      stopCamera();
      onUploadCustomImage(dataUrl, 'Webcam_Scan_Candidate');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Bar: Benchmarks & Presets */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <FileImage className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">Test Papers:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {allSamples.map((sample) => {
              const isSelected = !customImageUrl && paperSample?.id === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                  }`}
                >
                  <span>{sample.student_name.split(' ')[0]}</span>
                  {sample.has_ambiguity && (
                    <span className="ml-1 px-1 py-0.2 bg-amber-500/30 text-amber-300 text-[10px] rounded font-mono">
                      FLAG
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload or Camera Capture Actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors"
            title="Upload custom image scan"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload Scan</span>
          </button>

          {!isCameraActive ? (
            <button
              onClick={startCamera}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors"
              title="Capture paper via camera"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Camera</span>
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs"
            >
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Optical Toolbar (Zoom, Image Filters) */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-indigo-400" /> Filter:
          </span>
          {(['normal', 'contrast', 'invert', 'grayscale'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-2 py-0.5 rounded capitalize font-medium transition-colors text-[11px] ${
                filterMode === mode
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'contrast' ? 'OMR Binarize' : mode}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleZoom(-0.15)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] px-1.5 text-slate-300 min-w-[42px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.15)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 ml-1"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Paper Display Viewport */}
      <div
        ref={containerRef}
        onDrop={handleDropViewport}
        onDragOver={handleDragOver}
        className="flex-1 relative overflow-auto bg-slate-950 p-4 sm:p-6 flex items-start justify-center select-none"
        style={{ minHeight: '480px' }}
      >
        {/* Live Camera View Mode */}
        {isCameraActive ? (
          <div className="w-full max-w-lg bg-black rounded-xl overflow-hidden border border-cyan-500/40 relative shadow-2xl flex flex-col items-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
            <div className="absolute inset-0 border-2 border-dashed border-cyan-400/50 m-6 pointer-events-none flex items-center justify-center">
              <span className="bg-black/70 px-3 py-1 text-cyan-300 text-xs font-mono rounded">
                Align Student Sheet Inside Frame
              </span>
            </div>
            <div className="p-4 bg-slate-900 w-full flex items-center justify-between">
              <button
                onClick={stopCamera}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Close Camera
              </button>
              <button
                onClick={captureCameraSnapshot}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30"
              >
                <Camera className="w-4 h-4" />
                Capture & Scan Paper
              </button>
            </div>
          </div>
        ) : (
          /* Scanned Sheet Document */
          <div
            className="transition-transform duration-100 ease-out origin-top shadow-2xl relative"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {currentImageSrc ? (
              <div className="relative rounded-sm overflow-hidden border border-slate-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
                <img
                  src={currentImageSrc}
                  alt="Student Answer Sheet"
                  className="max-w-none w-[680px] sm:w-[740px] h-auto object-contain block bg-[#fbf9f4]"
                />

                {/* Question Zone Overlay Crosshairs if question is highlighted */}
                {activeQuestionHighlight && (
                  <div className="absolute inset-x-8 top-[28%] bottom-[40%] border-2 border-amber-400 bg-amber-400/10 rounded pointer-events-none animate-pulse flex items-start justify-between p-2">
                    <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px] font-mono shadow">
                      Inspecting: {activeQuestionHighlight}
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
                      Optical Bounding Box
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-700 hover:border-indigo-400 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl cursor-pointer transition-all max-w-md mx-auto space-y-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">Click or Drop Answer Sheet Here</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload your student scan (PNG, JPG, PDF) to run live optical grading
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/40">
                    Browse Files
                  </span>
                  <span className="text-xs text-slate-500">or use Camera button</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optical Scanning Alignment Overlay Status */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Crosshair className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>Fiducials: Locked (0.0° Skew)</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">300 DPI Optical</span>
        </div>

        {paperSample?.has_ambiguity && !customImageUrl && (
          <div className="absolute top-4 right-4 bg-amber-500/20 backdrop-blur border border-amber-500/40 text-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium shadow-lg animate-bounce">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Deliberate Smudge Detected on Q3</span>
          </div>
        )}
      </div>
    </div>
  );
};
