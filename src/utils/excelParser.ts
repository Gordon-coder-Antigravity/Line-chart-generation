import * as XLSX from 'xlsx';
import { ProcessedRecord } from '../types/bibliometrics';
import { resolveCityToCountry, getCustomCityOverrides } from './cityCountryDatabase';

export interface ColumnMappingDetection {
  yearCol: string | null;
  cityCol: string | null;
  titleCol: string | null;
  journalCol: string | null;
  publisherCol: string | null;
  allColumns: string[];
}

export interface ParseResult {
  records: ProcessedRecord[];
  allColumns: string[];
  detectedMapping: ColumnMappingDetection;
  rawRowCount: number;
  unmappedCities: string[];
  yearsDetected: number[];
}

/**
 * Intelligent column header detection for Web of Science exports
 */
export function detectWOSColumns(headers: string[]): ColumnMappingDetection {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  let yearCol: string | null = null;
  let cityCol: string | null = null;
  let titleCol: string | null = null;
  let journalCol: string | null = null;
  let publisherCol: string | null = null;

  for (const h of headers) {
    const n = norm(h);

    // Year candidates: Publication Year, PY, Year, PubYear, Publication_Year
    if (!yearCol) {
      if (['publicationyear', 'py', 'year', 'pubyear', 'publicationdate'].includes(n) || n.endsWith('year')) {
        yearCol = h;
      }
    }

    // City candidates: Publisher City, City, PA, PI, Publisher Address, PublisherCity
    if (!cityCol) {
      if (['publishercity', 'city', 'pa', 'pi', 'publisheraddress', 'pubcity'].includes(n)) {
        cityCol = h;
      }
    }

    // Title candidates: Article Title, Title, TI
    if (!titleCol) {
      if (['articletitle', 'title', 'ti'].includes(n)) {
        titleCol = h;
      }
    }

    // Journal/Source: Source Title, Journal, SO
    if (!journalCol) {
      if (['sourcetitle', 'journal', 'so', 'publicationname', 'source'].includes(n)) {
        journalCol = h;
      }
    }

    // Publisher: Publisher, PU
    if (!publisherCol) {
      if (['publisher', 'pu'].includes(n)) {
        publisherCol = h;
      }
    }
  }

  // Fallbacks if not found by exact tokens
  if (!cityCol) {
    cityCol = headers.find(h => norm(h).includes('city') || norm(h).includes('address')) || null;
  }
  if (!yearCol) {
    yearCol = headers.find(h => norm(h).includes('year')) || null;
  }

  return {
    yearCol,
    cityCol,
    titleCol,
    journalCol,
    publisherCol,
    allColumns: headers
  };
}

/**
 * Parse an Excel file (.xlsx, .xls) or delimited text buffer
 */
export async function parseWOSExcelFile(
  file: File,
  customYearCol?: string,
  customCityCol?: string,
  userOverrides?: Record<string, string>
): Promise<ParseResult> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (rawRows.length === 0) {
    throw new Error('The uploaded file is empty.');
  }

  const allColumns = Object.keys(rawRows[0] || {});
  const detected = detectWOSColumns(allColumns);

  const yearKey = customYearCol || detected.yearCol || allColumns[0];
  const cityKey = customCityCol || detected.cityCol;

  const overrides = userOverrides || getCustomCityOverrides();
  const records: ProcessedRecord[] = [];
  const unmappedCitiesSet = new Set<string>();
  const yearsSet = new Set<number>();

  rawRows.forEach((row, index) => {
    // Extract year
    let rawYear = row[yearKey];
    let yearNum: number | null = null;

    if (rawYear instanceof Date) {
      yearNum = rawYear.getFullYear();
    } else if (typeof rawYear === 'number') {
      yearNum = Math.floor(rawYear);
    } else if (typeof rawYear === 'string') {
      const match = rawYear.match(/\b(19\d\d|20\d\d)\b/);
      if (match) {
        yearNum = parseInt(match[1], 10);
      }
    }

    // Default or discard invalid years
    if (!yearNum || yearNum < 1900 || yearNum > 2100) {
      return; // skip rows without valid publication year
    }
    yearsSet.add(yearNum);

    // Extract publisher city
    let rawCity = cityKey ? String(row[cityKey] || '').trim() : '';
    if (!rawCity && detected.publisherCol && row[detected.publisherCol]) {
      rawCity = String(row[detected.publisherCol]).trim();
    }

    const { country, status } = resolveCityToCountry(rawCity, overrides);

    if (status === 'unmapped' && rawCity) {
      unmappedCitiesSet.add(rawCity);
    }

    const title = detected.titleCol ? String(row[detected.titleCol] || 'Untitled') : `Publication #${index + 1}`;
    const journal = detected.journalCol ? String(row[detected.journalCol] || '') : '';
    const publisher = detected.publisherCol ? String(row[detected.publisherCol] || '') : '';

    records.push({
      id: `rec-${index + 1}`,
      title,
      year: yearNum,
      originalCity: rawCity || 'Unknown',
      resolvedCountry: country,
      publisher,
      journal
    });
  });

  return {
    records,
    allColumns,
    detectedMapping: detected,
    rawRowCount: rawRows.length,
    unmappedCities: Array.from(unmappedCitiesSet),
    yearsDetected: Array.from(yearsSet).sort((a, b) => a - b)
  };
}

/**
 * Export summarized Country x Year data matrix to Excel (.xlsx)
 */
export function exportCountryMatrixToExcel(
  countries: string[],
  years: number[],
  countryYearMap: Record<string, Record<number, number>>,
  filename = 'WOS_Bibliometric_Country_Analysis.xlsx'
) {
  // Construct rows:
  // Country | 2011 | 2012 | ... | Total
  const rows = countries.map(country => {
    const row: Record<string, any> = { Country: country };
    let total = 0;
    years.forEach(year => {
      const val = countryYearMap[country]?.[year] || 0;
      row[year] = val;
      total += val;
    });
    row['Total Publications'] = total;
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Country Publications');
  XLSX.writeFile(wb, filename);
}

/**
 * Download a real sample WOS Excel dataset
 */
export function downloadSampleWOSExcel(sampleRecords: ProcessedRecord[]) {
  const exportData = sampleRecords.map(r => ({
    'Publication Year': r.year,
    'Publisher City': r.originalCity,
    'Article Title': r.title,
    'Source Title': r.journal,
    'Publisher': r.publisher,
    'Resolved Country': r.resolvedCountry
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'WOS Records');
  XLSX.writeFile(wb, 'WOS_Sample_Bibliometric_Records.xlsx');
}
