import React, { useState, useMemo } from 'react';
import { exportCountryMatrixToExcel } from '../utils/excelParser';

interface DataSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  countries: string[];
  years: number[];
  countryYearMap: Record<string, Record<number, number>>;
  totalPublications: number;
}

export const DataSummaryModal: React.FC<DataSummaryModalProps> = ({
  isOpen,
  onClose,
  countries,
  years,
  countryYearMap,
  totalPublications
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'total' | 'name'>('total');

  const filteredCountries = useMemo(() => {
    let list = countries.filter(c => c.toLowerCase().includes(filterQuery.toLowerCase()));
    if (sortBy === 'total') {
      list.sort((a, b) => {
        const totalA = years.reduce((sum, yr) => sum + (countryYearMap[a]?.[yr] || 0), 0);
        const totalB = years.reduce((sum, yr) => sum + (countryYearMap[b]?.[yr] || 0), 0);
        return totalB - totalA;
      });
    } else {
      list.sort((a, b) => a.localeCompare(b));
    }
    return list;
  }, [countries, years, countryYearMap, filterQuery, sortBy]);

  if (!isOpen) return null;

  const handleExportExcel = () => {
    exportCountryMatrixToExcel(countries, years, countryYearMap);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              Bibliometric Publications Matrix (Country × Year)
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span>{totalPublications.toLocaleString()} total publications</span>
              <span aria-hidden="true">·</span>
              <span>{countries.length} countries identified</span>
              <span aria-hidden="true">·</span>
              <span>Years {years[0]}–{years[years.length - 1]}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter country..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="text-xs border border-neutral-300 rounded-lg px-3 py-1.5 w-52 focus:ring-1 focus:ring-neutral-800"
            />
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <span>Sort by:</span>
              <button
                onClick={() => setSortBy('total')}
                className={`px-2 py-1 rounded text-xs ${sortBy === 'total' ? 'bg-neutral-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >
                Total
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-2 py-1 rounded text-xs ${sortBy === 'name' ? 'bg-neutral-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >
                A-Z
              </button>
            </div>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Matrix to Excel (.xlsx)
          </button>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-600 bg-neutral-50/50 sticky top-0">
                <th className="py-2.5 px-3 font-semibold">Country</th>
                {years.map(yr => (
                  <th key={yr} className="py-2.5 px-2.5 text-right font-medium">{yr}</th>
                ))}
                <th className="py-2.5 px-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {/* Global Total Row */}
              <tr className="bg-neutral-50 font-semibold text-neutral-900">
                <td className="py-2.5 px-3">Global (All Countries)</td>
                {years.map(yr => {
                  const sumYr = countries.reduce((acc, c) => acc + (countryYearMap[c]?.[yr] || 0), 0);
                  return (
                    <td key={`global-${yr}`} className="py-2.5 px-2.5 text-right font-mono">
                      {sumYr.toLocaleString()}
                    </td>
                  );
                })}
                <td className="py-2.5 px-3 text-right font-mono text-neutral-950 font-bold">
                  {totalPublications.toLocaleString()}
                </td>
              </tr>

              {/* Individual Countries */}
              {filteredCountries.map(country => {
                const total = years.reduce((acc, yr) => acc + (countryYearMap[country]?.[yr] || 0), 0);
                return (
                  <tr key={country} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-2 px-3 font-medium text-neutral-800">
                      {country}
                    </td>
                    {years.map(yr => {
                      const count = countryYearMap[country]?.[yr] || 0;
                      return (
                        <td
                          key={`${country}-${yr}`}
                          className={`py-2 px-2.5 text-right font-mono ${count > 0 ? 'text-neutral-900' : 'text-neutral-300'}`}
                        >
                          {count > 0 ? count.toLocaleString() : '-'}
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-right font-mono font-semibold text-neutral-900">
                      {total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
