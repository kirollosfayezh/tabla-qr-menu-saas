import QRCode from 'qrcode';

export type ModuleStyle = 'square' | 'rounded' | 'dots';

interface RenderInput {
  url: string;
  color: string;
  style: ModuleStyle;
  size: number;
  margin?: number;
}

interface Matrix {
  data: ReadonlyArray<number>;
  size: number;
}

function getMatrix(url: string): Matrix {
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = Array.from(qr.modules.data, (bit: number) => bit & 1);
  return { data, size };
}

function isOn(matrix: Matrix, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= matrix.size || y >= matrix.size) return false;
  return matrix.data[y * matrix.size + x] === 1;
}

/** Render a styled QR to a PNG data URL. */
export async function renderQrPng(input: RenderInput): Promise<string> {
  const margin = input.margin ?? 2;
  const matrix = getMatrix(input.url);
  const totalCells = matrix.size + margin * 2;
  const cell = Math.floor(input.size / totalCells);
  const canvasSize = cell * totalCells;

  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  ctx.fillStyle = input.color;

  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (!isOn(matrix, x, y)) continue;
      const px = (x + margin) * cell;
      const py = (y + margin) * cell;
      paintCell(ctx, px, py, cell, input.style);
    }
  }
  return canvas.toDataURL('image/png');
}

function paintCell(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cell: number,
  style: ModuleStyle,
): void {
  if (style === 'dots') {
    const r = cell / 2;
    ctx.beginPath();
    ctx.arc(px + r, py + r, r * 0.92, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (style === 'rounded') {
    const r = cell * 0.32;
    roundedRect(ctx, px, py, cell, cell, r);
    ctx.fill();
    return;
  }
  ctx.fillRect(px, py, cell, cell);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Render a styled QR to an SVG string. */
export function renderQrSvg(input: Omit<RenderInput, 'size'>): string {
  const margin = input.margin ?? 2;
  const matrix = getMatrix(input.url);
  const total = matrix.size + margin * 2;
  const shapes: string[] = [];
  for (let y = 0; y < matrix.size; y++) {
    for (let x = 0; x < matrix.size; x++) {
      if (!isOn(matrix, x, y)) continue;
      const cx = x + margin;
      const cy = y + margin;
      shapes.push(cellSvg(cx, cy, input.style));
    }
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="geometricPrecision">`,
    `<rect width="${total}" height="${total}" fill="#ffffff"/>`,
    `<g fill="${input.color}">${shapes.join('')}</g>`,
    `</svg>`,
  ].join('');
}

function cellSvg(cx: number, cy: number, style: ModuleStyle): string {
  if (style === 'dots') {
    return `<circle cx="${cx + 0.5}" cy="${cy + 0.5}" r="0.46"/>`;
  }
  if (style === 'rounded') {
    return `<rect x="${cx}" y="${cy}" width="1" height="1" rx="0.32" ry="0.32"/>`;
  }
  return `<rect x="${cx}" y="${cy}" width="1" height="1"/>`;
}
