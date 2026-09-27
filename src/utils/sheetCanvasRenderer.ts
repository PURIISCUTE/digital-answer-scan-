import { StudentPaperSample } from '../types/grading';

/**
 * Generates a realistic high-resolution digital optical answer sheet image
 * with lined paper background, fiducial markers, barcode/OMR headers,
 * authentic handwriting, margin lines, and optional smudges/strikethroughs.
 */
export function renderAnswerSheetToDataUrl(
  paper: StudentPaperSample,
  examTitle: string = 'PHYSICAL SCIENCES TRIPOS — PART II',
  options: {
    width?: number;
    height?: number;
    filter?: 'normal' | 'contrast' | 'invert' | 'grayscale';
  } = {}
): string {
  const width = options.width || 1000;
  const height = options.height || 1400;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Paper Background: subtle cream/parchment with slight paper noise
  ctx.fillStyle = '#fbf9f4';
  ctx.fillRect(0, 0, width, height);

  // Optical Scanning Fiducial Corner Targets (for optical sheet orientation alignment)
  ctx.fillStyle = '#0f172a';
  const markerSize = 28;
  const marginOffset = 30;
  // Top-left, Top-right, Bottom-left, Bottom-right
  ctx.fillRect(marginOffset, marginOffset, markerSize, markerSize);
  ctx.fillRect(width - marginOffset - markerSize, marginOffset, markerSize, markerSize);
  ctx.fillRect(marginOffset, height - marginOffset - markerSize, markerSize, markerSize);
  ctx.fillRect(width - marginOffset - markerSize, height - marginOffset - markerSize, markerSize, markerSize);

  // Timing track marks along the right border (typical of optical test sheets)
  for (let y = 140; y < height - 120; y += 26) {
    ctx.fillRect(width - 45, y, 12, 5);
  }

  // Header Box Outline
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(70, 70, width - 140, 160);

  // Institution / Header text
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(examTitle.toUpperCase(), 90, 105);

  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('OFFICIAL CANDIDATE ANSWER BOOKLET • OPTICAL SCANNER VERSION 4.2', 90, 126);

  // Student Info Field Lines
  ctx.fillStyle = '#334155';
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CANDIDATE NAME:', 90, 162);
  ctx.fillText('ROLL / SEAT NO:', 90, 198);
  ctx.fillText('DATE / DESK:', 520, 198);

  // Simulated Barcode / QR Grid for Candidate ID
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 48; i++) {
    const barW = (i % 3 === 0 || i % 7 === 0) ? 4 : 2;
    ctx.fillRect(720 + i * 4.2, 142, barW, 44);
  }
  ctx.font = '10px monospace';
  ctx.fillText(`*${paper.roll_number_id}*`, 720, 202);

  // Rubber stamp: "OPTICAL EVALUATION CERTIFIED"
  ctx.save();
  ctx.translate(width - 240, 95);
  ctx.rotate(-0.08);
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 150, 42);
  ctx.fillStyle = 'rgba(220, 38, 38, 0.55)';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('CONFIDENTIAL', 28, 18);
  ctx.fillText('VERIFIED DESK', 28, 32);
  ctx.restore();

  // Ruled Paper Lined Texture
  const lineSpacing = 38;
  const startY = 270;
  const leftRedMargin = 150;

  // Horizontal blue ruling lines
  ctx.strokeStyle = 'rgba(186, 215, 245, 0.65)';
  ctx.lineWidth = 1;
  for (let y = startY; y < height - 60; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(width - 70, y);
    ctx.stroke();
  }

  // Vertical red margin rule
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftRedMargin, 250);
  ctx.lineTo(leftRedMargin, height - 50);
  ctx.stroke();

  // Hand-written Candidate Info
  ctx.fillStyle = '#1e3a8a'; // Blue ink
  ctx.font = 'italic 700 22px "Caveat", cursive, sans-serif';
  ctx.fillText(paper.student_name, 230, 160);
  ctx.fillText(paper.roll_number_id, 230, 196);
  ctx.fillText('27-SEPT-2026 / DESK 4B', 620, 196);

  // Handwritten Answers Content
  let currentY = startY + 28;
  const maxLineWidth = width - leftRedMargin - 120;

  paper.answers.forEach((ans, qIndex) => {
    // Question Label in Margin
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`[${ans.question_number}]`, 92, currentY);

    // Handwritten response text
    ctx.fillStyle = paper.handwriting_style === 'neat' ? '#172554' : '#1e293b';
    ctx.font = '21px "Caveat", cursive, sans-serif';

    // Break answer into realistic handwriting lines
    const words = ans.student_text.split(' ');
    let currentLine = '';

    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxLineWidth && w > 0) {
        // Draw line with slight organic organic slope & jitter
        const jitter = (Math.random() - 0.5) * 1.5;
        ctx.fillText(currentLine.trim(), leftRedMargin + 18, currentY + jitter);
        currentLine = word + ' ';
        currentY += lineSpacing;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.trim().length > 0) {
      ctx.fillText(currentLine.trim(), leftRedMargin + 18, currentY);
      currentY += lineSpacing;
    }

    // Deliberate smudge or crossed-out scribble for testing ambiguity flags!
    if (ans.deliberate_flaw) {
      ctx.save();
      // Draw ink smudge blob
      const smudgeX = leftRedMargin + 160;
      const smudgeY = currentY - lineSpacing + 4;
      const grad = ctx.createRadialGradient(smudgeX, smudgeY, 2, smudgeX, smudgeY, 24);
      grad.addColorStop(0, 'rgba(15, 23, 42, 0.7)');
      grad.addColorStop(0.5, 'rgba(30, 58, 138, 0.4)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(smudgeX, smudgeY, 24, 0, Math.PI * 2);
      ctx.fill();

      // Pen scratch-out strikethrough lines
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(smudgeX - 35, smudgeY - 6);
      ctx.lineTo(smudgeX + 35, smudgeY + 4);
      ctx.moveTo(smudgeX - 30, smudgeY + 5);
      ctx.lineTo(smudgeX + 32, smudgeY - 7);
      ctx.stroke();
      ctx.restore();
    }

    // Question separator space
    currentY += 12;
  });

  // Footer: Candidate Declaration
  ctx.font = 'italic 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('I hereby certify that this answer script contains solely my independent work under examination conditions.', leftRedMargin + 18, height - 75);

  // Apply visual post-processing filters if requested (for optical inspector)
  if (options.filter && options.filter !== 'normal') {
    applyCanvasFilter(ctx, width, height, options.filter);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Applies optical processing filters (High-Contrast Binarization, Invert Negative, Grayscale)
 */
function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: 'contrast' | 'invert' | 'grayscale'
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    if (filter === 'grayscale') {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (filter === 'contrast') {
      // High-contrast optical thresholding (OMR mode)
      const threshold = 165;
      const val = gray < threshold ? 20 : 250;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    } else if (filter === 'invert') {
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
