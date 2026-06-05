import { ValidationError } from '@/lib/errors/errors';
import { MENU_TEMPLATE_COLUMNS } from './menu-template';
import type { OptionGroupDTO } from '@/dtos/menu.dto';

export interface MenuImportRow {
  rowNumber: number;
  categoryName: string;
  categoryNameAr: string;
  itemName: string;
  itemNameAr: string;
  description: string;
  descriptionAr: string;
  priceCents: number;
  tags: string[];
  isAvailable: boolean;
  optionGroups: OptionGroupDTO[];
}

type ColumnKey = (typeof MENU_TEMPLATE_COLUMNS)[number];
type CsvRecord = Record<ColumnKey, string>;

const MAX_IMPORT_ROWS = 500;

/** Parse the CSV menu template exported by buildMenuTemplateCsv. */
export function parseMenuImportCsv(csv: string): MenuImportRow[] {
  const rows = parseCsv(csv.replace(/^\uFEFF/, ''));
  if (rows.length < 2) throw new ValidationError('The sheet is empty');

  const headers = rows[0]?.map((h) => h.trim()) ?? [];
  assertHeaders(headers);

  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0));
  if (dataRows.length === 0) throw new ValidationError('The sheet has no menu items');
  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw new ValidationError(`Import up to ${MAX_IMPORT_ROWS} rows at a time`);
  }

  return dataRows.map((row, idx) => parseRow(row, idx + 2));
}

function assertHeaders(headers: string[]): void {
  const expected = [...MENU_TEMPLATE_COLUMNS];
  const mismatch =
    headers.length < expected.length ||
    expected.some((key, idx) => headers[idx] !== key);
  if (mismatch) {
    throw new ValidationError(`Invalid sheet header. Use the downloaded example sheet.`);
  }
}

function parseRow(row: string[], rowNumber: number): MenuImportRow {
  const record = MENU_TEMPLATE_COLUMNS.reduce((acc, key, idx) => {
    acc[key] = (row[idx] ?? '').trim();
    return acc;
  }, {} as CsvRecord);

  requireCell(record.category_en, rowNumber, 'category_en');
  requireCell(record.item_en, rowNumber, 'item_en');

  return {
    rowNumber,
    categoryName: record.category_en,
    categoryNameAr: record.category_ar,
    itemName: record.item_en,
    itemNameAr: record.item_ar,
    description: record.description_en,
    descriptionAr: record.description_ar,
    priceCents: parsePrice(record.price_egp, rowNumber),
    tags: splitList(record.tags),
    isAvailable: parseAvailable(record.available, rowNumber),
    optionGroups: parseOptionGroups(record.options, rowNumber),
  };
}

function requireCell(value: string, rowNumber: number, column: string): void {
  if (!value) throw new ValidationError(`Row ${rowNumber}: ${column} is required`);
}

function parsePrice(value: string, rowNumber: number): number {
  const normalized = value.replace(/[,_\s]/g, '');
  const price = Number(normalized);
  if (!Number.isFinite(price) || price < 0) {
    throw new ValidationError(`Row ${rowNumber}: price_egp must be a valid number`);
  }
  return Math.round(price * 100);
}

function parseAvailable(value: string, rowNumber: number): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized || ['yes', 'y', 'true', '1', 'available'].includes(normalized)) return true;
  if (['no', 'n', 'false', '0', 'unavailable'].includes(normalized)) return false;
  throw new ValidationError(`Row ${rowNumber}: available must be yes or no`);
}

function splitList(value: string): string[] {
  return value
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function parseOptionGroups(value: string, rowNumber: number): OptionGroupDTO[] {
  if (!value.trim()) return [];
  return value
    .split(';')
    .map((groupText, groupIndex) => parseOptionGroup(groupText.trim(), rowNumber, groupIndex))
    .filter((group) => group.name.length > 0);
}

function parseOptionGroup(text: string, rowNumber: number, groupIndex: number): OptionGroupDTO {
  const [metaText, choicesText] = text.split('::').map((part) => part.trim());
  if (!metaText || !choicesText) {
    throw new ValidationError(`Row ${rowNumber}: option group ${groupIndex + 1} is invalid`);
  }
  const [name, nameAr = '', min = '0', max = '1', required = 'optional'] = metaText
    .split('~')
    .map((part) => part.trim());
  if (!name) throw new ValidationError(`Row ${rowNumber}: option group name is required`);
  const minSelect = parseIntCell(min, rowNumber, 'option min');
  const maxSelect = parseIntCell(max, rowNumber, 'option max');
  if (maxSelect < minSelect) throw new ValidationError(`Row ${rowNumber}: option max must be >= min`);

  const options = choicesText
    .split('|')
    .map((choiceText, choiceIndex) => parseChoice(choiceText.trim(), rowNumber, choiceIndex));
  if (options.length === 0) throw new ValidationError(`Row ${rowNumber}: option group has no choices`);

  return {
    name,
    nameAr,
    minSelect,
    maxSelect,
    required: required.toLowerCase() === 'required',
    sortOrder: groupIndex,
    options,
  };
}

function parseChoice(text: string, rowNumber: number, choiceIndex: number): OptionGroupDTO['options'][number] {
  const [label, labelAr = '', delta = '0'] = text.split('/').map((part) => part.trim());
  if (!label) throw new ValidationError(`Row ${rowNumber}: option choice ${choiceIndex + 1} needs a label`);
  const priceDeltaCents = Math.round(Number(delta.replace('+', '')) * 100);
  if (!Number.isFinite(priceDeltaCents)) {
    throw new ValidationError(`Row ${rowNumber}: option choice price delta is invalid`);
  }
  return { label, labelAr, priceDeltaCents, sortOrder: choiceIndex };
}

function parseIntCell(value: string, rowNumber: number, label: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new ValidationError(`Row ${rowNumber}: ${label} must be a whole number`);
  }
  return parsed;
}

// eslint-disable-next-line complexity -- CSV quoting rules are easiest to verify in one state machine.
function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
