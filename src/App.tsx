/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  Sliders,
  Table,
  MapPin,
  Copy,
  Plus,
  RotateCcw,
  FileSpreadsheet,
  Check,
  Eye,
  Settings2
} from 'lucide-react';
import {
  ProcessedRecord,
  PanelConfig,
  FigureStyleSettings,
  YearCount
} from './types/bibliometrics';
import {
  parseWOSExcelFile,
  downloadSampleWOSExcel,
  ParseResult
} from './utils/excelParser';
import { generateSampleWOSRecords } from './utils/sampleData';
import {
  resolveCityToCountry,
  getCustomCityOverrides,
  saveCustomCityOverride,
  clearCustomCityOverrides
} from './utils/cityCountryDatabase';
import { AcademicLineChart } from './components/AcademicLineChart';
import { CompositeFigureSVG } from './components/CompositeFigureSVG';
import { FileUploader } from './components/FileUploader';
import { CityMappingModal } from './components/CityMappingModal';
import { PanelConfigModal } from './components/PanelConfigModal';
import { FigureCustomizerDrawer } from './components/FigureCustomizerDrawer';
import { DataSummaryModal } from './components/DataSummaryModal';
import {
  downloadSVG,
  downloadPNG,
  copyFigureToClipboard
} from './utils/exportFigure';

// Default initial 4 panels matching the user's attachment
const INITIAL_PANELS: PanelConfig[] = [
  {
    id: 'panel-1',
    letter: 'A',
    countryKey: 'Global',
    title: 'Global',
    yMin: 0,
    yMax: 4000,
    yStep: 1000,
    xMin: 2010,
    xMax: 2022,
    xStep: 2,
    lineStyle: 'dashed',
    markerShape: 'circle',
    markerSize: 4.2
  },
  {
    id: 'panel-2',
    letter: 'B',
    countryKey: 'USA',
    title: 'USA',
    yMin: 400,
    yMax: 1200,
    yStep: 200,
    xMin: 2010,
    xMax: 2022,
    xStep: 2,
    lineStyle: 'dashed',
    markerShape: 'circle',
    markerSize: 4.2
  },
  {
    id: 'panel-3',
    letter: 'C',
    countryKey: 'China',
    title: 'China',
    yMin: 0,
    yMax: 500,
    yStep: 100,
    xMin: 2010,
    xMax: 2022,
    xStep: 2,
    lineStyle: 'dashed',
    markerShape: 'circle',
    markerSize: 4.2
  },
  {
    id: 'panel-4',
    letter: 'D',
    countryKey: 'Australia',
    title: 'Australia',
    yMin: 0,
    yMax: 250,
    yStep: 50,
    xMin: 2010,
    xMax: 2022,
    xStep: 2,
    lineStyle: 'dashed',
    markerShape: 'circle',
    markerSize: 4.2
  }
];

const DEFAULT_SETTINGS: FigureStyleSettings = {
  fontFamily: 'sans',
  xAxisTitle: 'Publication year',
  yAxisTitle: 'Numbers of publications',
  axisLineWidth: 1.6,
  tickLength: 5.5,
  tickDirection: 'out',
  showSubtleGrid: false,
  lineColor: '#000000',
  pointColor: '#000000',
  pointSize: 4.2,
  lineWidth: 1.4,
  defaultLineStyle: 'dashed',
  layout: '2x2',
  cardWidth: 460,
  cardHeight: 380
};

export default function App() {
  // Core Data
  const [records, setRecords] = useState<ProcessedRecord[]>(() => generateSampleWOSRecords());
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Panels & Settings
  const [panels, setPanels] = useState<PanelConfig[]>(INITIAL_PANELS);
  const [settings, setSettings] = useState<FigureStyleSettings>(DEFAULT_SETTINGS);

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<'figure' | 'interactive' | 'matrix'>('figure');
  const [editingPanel, setEditingPanel] = useState<PanelConfig | null>(null);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Ref to composite SVG for vector & high-res export
  const compositeSvgRef = useRef<SVGSVGElement | null>(null);

  // Aggregate country x year metrics from records
  const { countries, years, countryYearMap, totalPublications, cityStats } = useMemo(() => {
    const yrSet = new Set<number>();
    const ctrySet = new Set<string>();
    const matrix: Record<string, Record<number, number>> = {};
    const cityMap: Record<string, { country: string; count: number }> = {};

    records.forEach((r) => {
      yrSet.add(r.year);
      ctrySet.add(r.resolvedCountry);

      if (!matrix[r.resolvedCountry]) matrix[r.resolvedCountry] = {};
      matrix[r.resolvedCountry][r.year] = (matrix[r.resolvedCountry][r.year] || 0) + 1;

      // Track cities
      const c = r.originalCity || 'Unknown';
      if (!cityMap[c]) {
        cityMap[c] = { country: r.resolvedCountry, count: 0 };
      }
      cityMap[c].count++;
    });

    const sortedYears = Array.from(yrSet).sort((a, b) => a - b);
    const sortedCountries = Array.from(ctrySet)
      .filter((c) => c !== 'Global' && c !== 'Other / Unmapped' && c !== 'Unknown / Unmapped')
      .sort((a, b) => {
        const totalA = sortedYears.reduce((sum, y) => sum + (matrix[a]?.[y] || 0), 0);
        const totalB = sortedYears.reduce((sum, y) => sum + (matrix[b]?.[y] || 0), 0);
        return totalB - totalA;
      });

    // Add unmapped at end if present
    if (matrix['Other / Unmapped']) sortedCountries.push('Other / Unmapped');
    if (matrix['Unknown / Unmapped']) sortedCountries.push('Unknown / Unmapped');

    const stats = Object.entries(cityMap).map(([city, data]) => {
      const { status } = resolveCityToCountry(city);
      return {
        city,
        country: data.country,
        count: data.count,
        status: status as 'verified' | 'inferred' | 'unmapped'
      };
    }).sort((a, b) => b.count - a.count);

    return {
      countries: sortedCountries,
      years: sortedYears,
      countryYearMap: matrix,
      totalPublications: records.length,
      cityStats: stats
    };
  }, [records]);

  // Helper to extract year-by-year counts for a given country or "Global"
  const getCountryData = (countryKey: string): YearCount[] => {
    if (countryKey === 'Global') {
      return years.map((year) => {
        const totalForYear = countries.reduce((sum, c) => sum + (countryYearMap[c]?.[year] || 0), 0);
        return { year, count: totalForYear };
      });
    }

    return years.map((year) => {
      return { year, count: countryYearMap[countryKey]?.[year] || 0 };
    });
  };

  // Upload handler for user Excel or CSV
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const parsed = await parseWOSExcelFile(file);
      setCurrentFile(file);
      setParseResult(parsed);
      setRecords(parsed.records);

      // Auto-update panels if new countries are found
      // Keep Global, and populate top 3 countries from the file
      const topCountries = Array.from(
        new Set(parsed.records.map((r) => r.resolvedCountry))
      ).filter((c) => c !== 'Global' && !c.includes('Unmapped'));

      if (topCountries.length >= 3) {
        setPanels([
          {
            id: 'panel-1',
            letter: 'A',
            countryKey: 'Global',
            title: 'Global',
            lineStyle: 'dashed',
            markerShape: 'circle'
          },
          {
            id: 'panel-2',
            letter: 'B',
            countryKey: topCountries[0] || 'USA',
            title: topCountries[0] || 'USA',
            lineStyle: 'dashed',
            markerShape: 'circle'
          },
          {
            id: 'panel-3',
            letter: 'C',
            countryKey: topCountries[1] || 'China',
            title: topCountries[1] || 'China',
            lineStyle: 'dashed',
            markerShape: 'circle'
          },
          {
            id: 'panel-4',
            letter: 'D',
            countryKey: topCountries[2] || 'Australia',
            title: topCountries[2] || 'Australia',
            lineStyle: 'dashed',
            markerShape: 'circle'
          }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to parse Excel file. Please ensure it is a valid WOS export.');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-parse with custom column choices
  const handleCustomColumnChange = async (yearCol: string, cityCol: string) => {
    if (!currentFile) return;
    setIsLoading(true);
    try {
      const parsed = await parseWOSExcelFile(currentFile, yearCol, cityCol);
      setParseResult(parsed);
      setRecords(parsed.records);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sample dataset
  const handleLoadSample = () => {
    const samples = generateSampleWOSRecords();
    setRecords(samples);
    setParseResult(null);
    setCurrentFile(null);
    setPanels(INITIAL_PANELS);
    setSettings(DEFAULT_SETTINGS);
  };

  // Update city-to-country mapping
  const handleUpdateCityMapping = (city: string, newCountry: string) => {
    saveCustomCityOverride(city, newCountry);
    // Update all matching records in state
    setRecords((prev) =>
      prev.map((r) => {
        if (r.originalCity.toLowerCase() === city.toLowerCase()) {
          return { ...r, resolvedCountry: newCountry };
        }
        return r;
      })
    );
  };

  const handleResetCityOverrides = () => {
    clearCustomCityOverrides();
    // Re-resolve
    setRecords((prev) =>
      prev.map((r) => {
        const { country } = resolveCityToCountry(r.originalCity, {});
        return { ...r, resolvedCountry: country };
      })
    );
  };

  // Preset to recreate screenshot exactly
  const handlePresetScreenshot = () => {
    setPanels(INITIAL_PANELS);
    setSettings({
      ...DEFAULT_SETTINGS,
      layout: '2x2',
      defaultLineStyle: 'dashed'
    });
  };

  // Add a new panel
  const handleAddPanel = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nextLetter = letters[panels.length % letters.length] || 'E';
    const unusedCountry = countries.find((c) => !panels.some((p) => p.countryKey === c)) || 'United Kingdom';

    const newPanel: PanelConfig = {
      id: `panel-${Date.now()}`,
      letter: nextLetter,
      countryKey: unusedCountry,
      title: unusedCountry,
      lineStyle: 'dashed',
      markerShape: 'circle',
      markerSize: 4.2
    };
    setPanels([...panels, newPanel]);
  };

  const handleSavePanel = (updated: PanelConfig) => {
    setPanels(panels.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePanel = (panelId: string) => {
    setPanels(panels.filter((p) => p.id !== panelId));
  };

  // Export figure actions
  const handleExportSVG = () => {
    if (compositeSvgRef.current) {
      downloadSVG(compositeSvgRef.current, `WOS_Figure_${settings.layout}_Bibliometrics.svg`);
    }
  };

  const handleExportPNG = async () => {
    if (compositeSvgRef.current) {
      await downloadPNG(compositeSvgRef.current, `WOS_Figure_${settings.layout}_Bibliometrics.png`, 3);
    }
  };

  const handleCopyClipboard = async () => {
    if (compositeSvgRef.current) {
      const ok = await copyFigureToClipboard(compositeSvgRef.current, 2);
      if (ok) {
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              W
            </div>
            <div>
              <h1 className="text-sm font-semibold text-neutral-900 leading-tight">
                Web of Science Bibliometric Line Chart Studio
              </h1>
              <p className="text-[11px] text-neutral-500 leading-none mt-0.5">
                Sort publisher cities into countries · Multi-panel publication figures
              </p>
            </div>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMappingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              <span>City Mappings</span>
              {cityStats.some((c) => c.status === 'unmapped') && (
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>

            <button
              onClick={() => setIsSummaryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Table className="w-3.5 h-3.5 text-neutral-500" />
              <span>Matrix Data</span>
            </button>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-500" />
              <span>Figure Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error notification if any */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-800">
              ✕
            </button>
          </div>
        )}

        {/* File Upload Section */}
        <FileUploader
          onFileUpload={handleFileUpload}
          onLoadSampleData={handleLoadSample}
          onDownloadSampleExcel={() => downloadSampleWOSExcel(records)}
          isLoading={isLoading}
          parseResult={parseResult}
          onReviewCities={() => setIsMappingModalOpen(true)}
          onColumnChange={handleCustomColumnChange}
        />

        {/* View Selection & Figure Toolbar */}
        <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Segmented Tab Controls adhering to zero-pill guidelines */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setActiveTab('figure')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'figure'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Publication Figure (Composite)</span>
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'interactive'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Interactive Panels ({panels.length})</span>
            </button>
          </div>

          {/* Figure Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
              title="Copy figure image to clipboard for Word or PowerPoint"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copy Image</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportSVG}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
              title="Download vector graphic for Adobe Illustrator, Inkscape, or LaTeX"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Export SVG (Vector)</span>
            </button>

            <button
              onClick={handleExportPNG}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs"
              title="Download 300 DPI high-resolution PNG for journal publication"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export High-Res PNG (300 DPI)</span>
            </button>
          </div>
        </div>

        {/* View 1: Exact Composite Scientific Figure (Matching Screenshot) */}
        {activeTab === 'figure' && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex flex-col items-center">
            {/* Figure Header Bar */}
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-800">
                  Figure: Number of publications per year by country
                </span>
                <span className="text-xs text-neutral-500">
                  Layout: {settings.layout} · {panels.length} Subfigures
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePresetScreenshot}
                  className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 px-2.5 py-1 rounded border border-neutral-200 hover:bg-neutral-50"
                  title="Reset to 4 panels (A: Global, B: USA, C: China, D: Australia)"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Attachment Preset
                </button>
                <button
                  onClick={handleAddPanel}
                  className="text-xs text-neutral-800 hover:text-neutral-950 font-medium flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200"
                >
                  <Plus className="w-3 h-3" />
                  Add Subfigure Panel
                </button>
              </div>
            </div>

            {/* Publication Figure Canvas (Matches screenshot) */}
            <div className="w-full overflow-x-auto py-2 flex justify-center">
              <div className="border border-neutral-200 p-4 bg-white shadow-xs rounded-lg inline-block">
                <CompositeFigureSVG
                  svgRef={compositeSvgRef}
                  panels={panels}
                  getCountryData={getCountryData}
                  settings={settings}
                />
              </div>
            </div>

            {/* Quick Panel List with Config Buttons */}
            <div className="w-full mt-6 pt-4 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  onClick={() => setEditingPanel(panel)}
                  className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-sm">{panel.letter}</span>
                    <span className="text-xs font-medium text-neutral-700">{panel.title}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 hover:text-neutral-700">Configure →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 2: Interactive Panels Grid with Point Inspection */}
        {activeTab === 'interactive' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-neutral-600">
                Hover over data points to inspect exact publication counts for each year. Click "Configure" on any chart to customize country or axis limits.
              </p>
              <button
                onClick={handleAddPanel}
                className="text-xs bg-neutral-900 text-white hover:bg-neutral-800 px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Panel
              </button>
            </div>

            <div
              className={`grid gap-6 ${
                settings.layout === '1x1'
                  ? 'grid-cols-1 max-w-xl mx-auto'
                  : settings.layout === '1x2'
                  ? 'grid-cols-1 md:grid-cols-2'
                  : settings.layout === '1x3'
                  ? 'grid-cols-1 md:grid-cols-3'
                  : settings.layout === '1x4'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {panels.map((panel) => {
                const data = getCountryData(panel.countryKey);
                return (
                  <AcademicLineChart
                    key={panel.id}
                    panelLetter={panel.letter}
                    title={panel.title}
                    data={data}
                    yMin={panel.yMin}
                    yMax={panel.yMax}
                    yStep={panel.yStep}
                    xMin={panel.xMin}
                    xMax={panel.xMax}
                    xStep={panel.xStep}
                    yAxisTitle={settings.yAxisTitle}
                    xAxisTitle={settings.xAxisTitle}
                    lineStyle={panel.lineStyle || settings.defaultLineStyle}
                    markerShape={panel.markerShape}
                    markerSize={panel.markerSize || settings.pointSize}
                    strokeWidth={panel.strokeWidth || settings.lineWidth}
                    showGrid={settings.showSubtleGrid}
                    fontFamily={
                      settings.fontFamily === 'serif'
                        ? 'Times New Roman, serif'
                        : settings.fontFamily === 'mono'
                        ? 'Courier New, monospace'
                        : 'Arial, sans-serif'
                    }
                    onEditPanel={() => setEditingPanel(panel)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div>
            Web of Science Bibliometric Line Chart Studio · Academic Journal Figure Generator
          </div>
          <div className="flex items-center gap-3 text-neutral-600">
            <span>{totalPublications.toLocaleString()} records loaded</span>
            <span aria-hidden="true">·</span>
            <span>{countries.length} countries mapped</span>
            <span aria-hidden="true">·</span>
            <span>Years {years[0]}–{years[years.length - 1]}</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <CityMappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        cityStats={cityStats}
        onUpdateMapping={handleUpdateCityMapping}
        onResetOverrides={handleResetCityOverrides}
      />

      <PanelConfigModal
        isOpen={editingPanel !== null}
        onClose={() => setEditingPanel(null)}
        panel={editingPanel}
        availableCountries={['Global', ...countries]}
        onSave={handleSavePanel}
        onDelete={panels.length > 1 ? handleDeletePanel : undefined}
      />

      <DataSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        countries={countries}
        years={years}
        countryYearMap={countryYearMap}
        totalPublications={totalPublications}
      />

      <FigureCustomizerDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings({ ...settings, ...newSettings })}
        onApplyPresetScreenshot={handlePresetScreenshot}
      />
    </div>
  );
}
