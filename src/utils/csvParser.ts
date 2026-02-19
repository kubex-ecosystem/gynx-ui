import { GNyxDataTable } from '../types';

// Robust CSV Parser
export const parseCSV = (text: string): { headers: string[]; rows: Record<string, any>[] } => {
  // Detect delimiter
  const detectDelimiter = (line: string) => {
    const delimiters = [',', ';', '	', '|'];
    const counts = delimiters.map(d => (line.match(new RegExp('' + d, 'g')) || []).length);
    const maxCount = Math.max(...counts);
    return delimiters[counts.indexOf(maxCount)] || ',';
  };

  const lines = text.trim().split('\n').map(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(lines[0]);

  // Parse a line considering quotes
  const parseLine = (line: string) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    return values;
  };

  // Parse headers
  const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());

  // Parse data rows
  const rows: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;

    const values = parseLine(lines[i]);
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      // Remove surrounding quotes
      value = value.replace(/^["']|["']$/g, '').trim();
      row[header] = value;
    });
    rows.push(row);
  }

  return { headers, rows };
};

// Data type detection
export const inferColumnType = (values: any[]): 'text' | 'number' | 'date' | 'mixed' => {
  if (!values || values.length === 0) return 'text';

  const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonEmptyValues.length === 0) return 'text';

  let numberCount = 0;
  let dateCount = 0;

  for (const value of nonEmptyValues.slice(0, 20)) {
    const str = String(value).trim();

    if (!isNaN(str as any) && !isNaN(parseFloat(str)) && str !== '') {
      numberCount++;
      continue;
    }

    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{2}-\d{2}-\d{4}$/,
      /^\d{4}\/\d{2}\/\d{2}$/
    ];

    if (datePatterns.some(pattern => pattern.test(str))) {
      dateCount++;
    }
  }

  const sampleSize = Math.min(nonEmptyValues.length, 20);
  const numberRatio = numberCount / sampleSize;
  const dateRatio = dateCount / sampleSize;

  if (numberRatio > 0.8) return 'number';
  if (dateRatio > 0.8) return 'date';
  if (numberRatio > 0.3 && numberRatio < 0.8) return 'mixed';

  return 'text';
};

// Create file structure fingerprint
export const createStructureFingerprint = (headers: string[], data: Record<string, any>[]) => {
  const columns = headers.map((header) => {
    const columnValues = data.map(row => row[header]);
    const type = inferColumnType(columnValues);
    return { type, originalName: header };
  });

  return {
    columnCount: headers.length,
    columns: columns
  };
};

export const csvToGNyxTable = (text: string, fileName: string): GNyxDataTable => {
  const { headers, rows } = parseCSV(text);
  const fingerprint = createStructureFingerprint(headers, rows);

  return {
    name: fileName,
    schema: fingerprint,
    headers,
    rows,
    sourceType: 'csv_upload'
  };
};
