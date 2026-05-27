'use client';

export function buildQrPdf(input: {
  title: string;
  url: string;
  jpegBytes: Uint8Array;
  width: number;
  height: number;
}): Blob {
  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push(pageObject(input.width, input.height));
  objects.push(imageObject(input.jpegBytes.length, input.width, input.height));
  objects.push(contentObject(input.title, input.url, input.width, input.height));
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  return assemblePdf(objects, input.jpegBytes);
}

function pageObject(width: number, height: number): string {
  const x = Math.round((595 - width) / 2);
  return [
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]',
    '/Resources << /XObject << /Im0 4 0 R >> /Font << /F1 6 0 R >> >>',
    `/Contents 5 0 R >> % ${x} ${height}`,
  ].join(' ');
}

function imageObject(length: number, width: number, height: number): string {
  return [
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height}`,
    '/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode',
    `/Length ${length} >>\nstream\n__IMAGE__\nendstream`,
  ].join(' ');
}

function contentObject(title: string, url: string, width: number, height: number): string {
  const x = Math.round((595 - width) / 2);
  const y = 390;
  const stream = [
    'BT /F1 22 Tf 72 760 Td',
    `(${escapePdf(title)}) Tj ET`,
    'BT /F1 10 Tf 72 735 Td',
    `(${escapePdf(url)}) Tj ET`,
    `q ${width} 0 0 ${height} ${x} ${y} cm /Im0 Do Q`,
  ].join('\n');
  return `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
}

function assemblePdf(objects: string[], imageBytes: Uint8Array): Blob {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [encoder.encode('%PDF-1.4\n')];
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(totalLength(parts));
    appendObject(parts, i + 1, objects[i]!, imageBytes);
  }
  const xrefOffset = totalLength(parts);
  parts.push(encoder.encode(xref(offsets, xrefOffset, objects.length)));
  const blobParts: BlobPart[] = parts.map((part) => new Uint8Array(part).buffer as ArrayBuffer);
  return new Blob(blobParts, { type: 'application/pdf' });
}

function appendObject(parts: Uint8Array[], id: number, object: string, imageBytes: Uint8Array): void {
  const encoder = new TextEncoder();
  const [before, after] = object.split('__IMAGE__');
  parts.push(encoder.encode(`${id} 0 obj\n${before ?? ''}`));
  if (after !== undefined) parts.push(imageBytes, encoder.encode(after));
  parts.push(encoder.encode('\nendobj\n'));
}

function xref(offsets: number[], xrefOffset: number, count: number): string {
  const rows = offsets.map((offset, idx) =>
    idx === 0 ? '0000000000 65535 f ' : `${String(offset).padStart(10, '0')} 00000 n `);
  return `xref\n0 ${count + 1}\n${rows.join('\n')}\ntrailer << /Size ${count + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
}

function totalLength(parts: ReadonlyArray<Uint8Array>): number {
  return parts.reduce((total, part) => total + part.length, 0);
}

function escapePdf(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}
