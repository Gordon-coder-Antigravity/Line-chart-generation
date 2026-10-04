import React, { useRef, useState } from 'react';
import { ParseResult } from '../utils/excelParser';

interface FileUploaderProps {
  onFileUpload: (file: File) => Promise<void>;
  onLoadSampleData: () => void;
  onDownloadSampleExcel: () => void;
  isLoading: boolean;
  parseResult: ParseResult | null;
  onReviewCities: () => void;
  onColumnChange?: (yearCol: string, cityCol: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onLoadSampleData,
  onDownloadSampleExcel,
  isLoading,
  parseResult,
  onReviewCities,
  onColumnChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showColSettings, setShowColSettings] = useState(false);
  const [selectedYearCol, setSelectedYearCol] = useState<string>('');
  const [selectedCityCol, setSelectedCityCol] = useState<string>('');

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
            isDragOver
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, .tsv, .txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-1.5">
            <svg
              className="w-7 h-7 text-neutral-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <div className="text-xs font-semibold text-neutral-800">
              {isLoading ? 'Processing Excel file...' : 'Upload Web of Science (WOS) Excel or CSV file'}
            </div>
            <p className="text-[11px] text-neutral-500 max-w-sm">
              Drag & drop .xlsx, .xls, or .csv. Automatically detects <span className="font-mono text-neutral-700">Publication Year</span> and maps <span className="font-mono text-neutral-700">Publisher City</span> to Country.
            </p>
          </div>
        </div>

        {/* Quick Actions & Sample Data */}
        <div className="flex flex-col justify-center gap-2 md:w-64 border-t md:border-t-0 md:border-l border-neutral-200 pt-3 md:pt-0 md:pl-5">
          <button
            onClick={onLoadSampleData}
            disabled={isLoading}
            className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Load Example WOS Data
          </button>

          <button
            onClick={onDownloadSampleExcel}
            className="w-full py-1.5 px-3 text-xs font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Sample Excel
          </button>
        </div>
      </div>

      {/* Dataset status & column mapping summary if parsed */}
      {parseResult && (
        <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-2 text-neutral-600">
            <span className="font-semibold text-neutral-900">
              {parseResult.records.length.toLocaleString()} publications
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Years {parseResult.yearsDetected[0]}–{parseResult.yearsDetected[parseResult.yearsDetected.length - 1]}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Year Column: <code className="text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">{parseResult.detectedMapping.yearCol || 'Not found'}</code>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Publisher City Column: <code className="text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">{parseResult.detectedMapping.cityCol || 'Not found'}</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {parseResult.unmappedCities.length > 0 && (
              <button
                onClick={onReviewCities}
                className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {parseResult.unmappedCities.length} Unmapped Cities
              </button>
            )}

            <button
              onClick={() => setShowColSettings(!showColSettings)}
              className="text-neutral-600 hover:text-neutral-900 px-2.5 py-1 rounded-md border border-neutral-300 hover:bg-neutral-50 transition-colors"
            >
              {showColSettings ? 'Hide Columns' : 'Change Column Selection'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Column Overrides if needed */}
      {showColSettings && parseResult && (
        <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Select Year Column
            </label>
            <select
              value={selectedYearCol || parseResult.detectedMapping.yearCol || ''}
              onChange={(e) => {
                setSelectedYearCol(e.target.value);
                if (onColumnChange) {
                  onColumnChange(e.target.value, selectedCityCol || parseResult.detectedMapping.cityCol || '');
                }
              }}
              className="w-full border border-neutral-300 rounded px-2.5 py-1 bg-white text-xs"
            >
              {parseResult.allColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 mb-1">
              Select Publisher City Column
            </label>
            <select
              value={selectedCityCol || parseResult.detectedMapping.cityCol || ''}
              onChange={(e) => {
                setSelectedCityCol(e.target.value);
                if (onColumnChange) {
                  onColumnChange(selectedYearCol || parseResult.detectedMapping.yearCol || '', e.target.value);
                }
              }}
              className="w-full border border-neutral-300 rounded px-2.5 py-1 bg-white text-xs"
            >
              <option value="">(None / Unknown)</option>
              {parseResult.allColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
