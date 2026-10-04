import React from 'react';
import { FigureStyleSettings } from '../types/bibliometrics';

interface FigureCustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FigureStyleSettings;
  onUpdateSettings: (newSettings: Partial<FigureStyleSettings>) => void;
  onApplyPresetScreenshot: () => void;
}

export const FigureCustomizerDrawer: React.FC<FigureCustomizerDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onApplyPresetScreenshot
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-neutral-200 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Figure Styling & Layout</h3>
          <p className="text-[11px] text-neutral-500">Journal & Publication formatting</p>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md hover:bg-neutral-100"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs text-neutral-700">
        {/* Preset button */}
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <span className="font-semibold text-neutral-900 block mb-1">Quick Layout Preset</span>
          <p className="text-[11px] text-neutral-500 mb-2.5">
            Reset to match user's uploaded 4-panel scientific paper figure (Global, USA, China, Australia).
          </p>
          <button
            onClick={onApplyPresetScreenshot}
            className="w-full py-1.5 px-3 bg-neutral-900 text-white rounded font-medium hover:bg-neutral-800 transition-colors text-center text-xs"
          >
            Apply Screenshot Preset (2×2)
          </button>
        </div>

        {/* Layout */}
        <div>
          <label className="block font-semibold text-neutral-900 mb-1.5">
            Composite Layout Grid
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: '2x2', label: '2 × 2' },
              { id: '1x2', label: '1 × 2' },
              { id: '1x3', label: '1 × 3' },
              { id: '2x3', label: '2 × 3' },
              { id: '1x4', label: '1 × 4' },
              { id: '1x1', label: 'Single' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onUpdateSettings({ layout: item.id as any })}
                className={`py-1.5 text-center rounded border font-medium transition-colors ${
                  settings.layout === item.id
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div>
          <label className="block font-semibold text-neutral-900 mb-1.5">
            Font Family (Journal Spec)
          </label>
          <select
            value={settings.fontFamily}
            onChange={(e) => onUpdateSettings({ fontFamily: e.target.value as any })}
            className="w-full border border-neutral-300 rounded px-2.5 py-1.5 bg-white text-xs"
          >
            <option value="sans">Arial / Helvetica (Default Nature/Science)</option>
            <option value="serif">Times New Roman (Lancet / IEEE / APA)</option>
            <option value="mono">Monospace (Clean / Technical)</option>
          </select>
        </div>

        {/* Default Line Style */}
        <div>
          <label className="block font-semibold text-neutral-900 mb-1.5">
            Curve Line Style
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'dashed', label: 'Dashed (– – –)' },
              { id: 'solid', label: 'Solid (───)' },
              { id: 'dotted', label: 'Dotted (· · ·)' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onUpdateSettings({ defaultLineStyle: item.id as any })}
                className={`py-1 text-center rounded border text-[11px] font-medium transition-colors ${
                  settings.defaultLineStyle === item.id
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Axis Titles */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">
              Y-Axis Title (Rotated -90°)
            </label>
            <input
              type="text"
              value={settings.yAxisTitle}
              onChange={(e) => onUpdateSettings({ yAxisTitle: e.target.value })}
              className="w-full border border-neutral-300 rounded px-2 py-1 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">
              X-Axis Title
            </label>
            <input
              type="text"
              value={settings.xAxisTitle}
              onChange={(e) => onUpdateSettings({ xAxisTitle: e.target.value })}
              className="w-full border border-neutral-300 rounded px-2 py-1 text-xs"
            />
          </div>
        </div>

        {/* Fine-Tuning */}
        <div className="space-y-3 pt-2 border-t border-neutral-100">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-neutral-600">
                Axis Line Width: {settings.axisLineWidth}px
              </label>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={settings.axisLineWidth}
              onChange={(e) => onUpdateSettings({ axisLineWidth: parseFloat(e.target.value) })}
              className="w-full accent-neutral-800"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-medium text-neutral-600">
                Point Marker Size: {settings.pointSize}px
              </label>
            </div>
            <input
              type="range"
              min="2.5"
              max="7"
              step="0.5"
              value={settings.pointSize}
              onChange={(e) => onUpdateSettings({ pointSize: parseFloat(e.target.value) })}
              className="w-full accent-neutral-800"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-neutral-700">Subtle background grid</span>
            <input
              type="checkbox"
              checked={settings.showSubtleGrid}
              onChange={(e) => onUpdateSettings({ showSubtleGrid: e.target.checked })}
              className="accent-neutral-900 rounded"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800"
        >
          Done
        </button>
      </div>
    </div>
  );
};
