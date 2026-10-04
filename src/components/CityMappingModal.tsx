import React, { useState, useMemo } from 'react';
import { STANDARD_COUNTRIES } from '../utils/cityCountryDatabase';

interface CityMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityStats: { city: string; country: string; count: number; status: 'verified' | 'inferred' | 'unmapped' }[];
  onUpdateMapping: (city: string, newCountry: string) => void;
  onResetOverrides: () => void;
}

export const CityMappingModal: React.FC<CityMappingModalProps> = ({
  isOpen,
  onClose,
  cityStats,
  onUpdateMapping,
  onResetOverrides,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unmapped' | 'inferred' | 'verified'>('all');
  const [customCountryInput, setCustomCountryInput] = useState<{ [city: string]: string }>({});

  const filteredStats = useMemo(() => {
    return cityStats.filter(item => {
      const matchesSearch = item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [cityStats, searchTerm, statusFilter]);

  const unmappedCount = useMemo(() => {
    return cityStats.filter(c => c.status === 'unmapped').length;
  }, [cityStats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Publisher City to Country Mapping
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Ensure cities are grouped into countries for the bibliometric line charts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search publisher city or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm border border-neutral-300 rounded-lg pl-9 pr-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-neutral-800"
              />
              <svg className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-neutral-500 hover:text-neutral-800 underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Interactive filter tabs adhering to zero-pill discipline */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({cityStats.length})
            </button>
            <button
              onClick={() => setStatusFilter('unmapped')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'unmapped' ? 'bg-white text-amber-700 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Needs Review ({unmappedCount})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'verified' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Verified ({cityStats.filter(c => c.status === 'verified').length})
            </button>
          </div>

          <button
            onClick={onResetOverrides}
            className="text-xs text-neutral-500 hover:text-red-600 px-2 py-1 rounded hover:bg-neutral-50 transition-colors"
            title="Reset manual overrides to standard database defaults"
          >
            Reset Defaults
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[500px]">
          {filteredStats.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-sm">
              No publisher cities match your filter.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Publisher City (from WOS)</th>
                  <th className="py-2.5 px-3">Publications</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Mapped Country</th>
                  <th className="py-2.5 px-3 text-right">Quick Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredStats.map((item) => {
                  const isUnmapped = item.status === 'unmapped';

                  return (
                    <tr key={item.city} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-2 px-3 font-mono text-xs text-neutral-800 font-medium">
                        {item.city}
                      </td>
                      <td className="py-2 px-3 text-neutral-600 text-xs">
                        {item.count.toLocaleString()} papers
                      </td>
                      <td className="py-2 px-3 text-xs">
                        {item.status === 'verified' && (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified
                          </span>
                        )}
                        {item.status === 'inferred' && (
                          <span className="text-sky-700 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> Auto-detected
                          </span>
                        )}
                        {item.status === 'unmapped' && (
                          <span className="text-amber-700 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Unmapped
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-xs font-medium ${isUnmapped ? 'text-amber-700' : 'text-neutral-900'}`}>
                          {item.country}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            value={STANDARD_COUNTRIES.includes(item.country as any) ? item.country : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                onUpdateMapping(item.city, e.target.value);
                              }
                            }}
                            className="text-xs border border-neutral-300 rounded px-2 py-1 bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-800"
                          >
                            <option value="">Select country...</option>
                            {STANDARD_COUNTRIES.filter(c => c !== 'Global').map((country) => (
                              <option key={country} value={country}>
                                {country}
                              </option>
                            ))}
                          </select>

                          {/* Quick manual text input for any other country */}
                          <div className="relative inline-block">
                            <input
                              type="text"
                              placeholder="Or type country..."
                              value={customCountryInput[item.city] ?? ''}
                              onChange={(e) => {
                                setCustomCountryInput({
                                  ...customCountryInput,
                                  [item.city]: e.target.value
                                });
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && customCountryInput[item.city]) {
                                  onUpdateMapping(item.city, customCountryInput[item.city].trim());
                                  setCustomCountryInput({ ...customCountryInput, [item.city]: '' });
                                }
                              }}
                              className="text-xs border border-neutral-200 rounded px-2 py-1 w-28 bg-white focus:outline-hidden focus:border-neutral-700"
                            />
                            {customCountryInput[item.city] && (
                              <button
                                onClick={() => {
                                  onUpdateMapping(item.city, customCountryInput[item.city].trim());
                                  setCustomCountryInput({ ...customCountryInput, [item.city]: '' });
                                }}
                                className="absolute right-1 top-1 bg-neutral-800 text-white rounded px-1 text-[10px]"
                                title="Apply"
                              >
                                ✓
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-600">
          <span>
            {unmappedCount === 0 ? (
              <span className="text-emerald-700 font-medium">✓ All publisher cities mapped to countries</span>
            ) : (
              <span className="text-amber-700 font-medium">{unmappedCount} publisher cities need country assignment</span>
            )}
          </span>
          <button
            onClick={onClose}
            className="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Apply & View Charts
          </button>
        </div>
      </div>
    </div>
  );
};
