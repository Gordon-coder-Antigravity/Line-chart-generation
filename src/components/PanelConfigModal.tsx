import React, { useState, useEffect } from 'react';
import { PanelConfig } from '../types/bibliometrics';

interface PanelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  panel: PanelConfig | null;
  availableCountries: string[];
  onSave: (updatedPanel: PanelConfig) => void;
  onDelete?: (panelId: string) => void;
}

export const PanelConfigModal: React.FC<PanelConfigModalProps> = ({
  isOpen,
  onClose,
  panel,
  availableCountries,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<PanelConfig | null>(null);

  useEffect(() => {
    if (panel) {
      setFormData({ ...panel });
    }
  }, [panel]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">
                Configure Panel {formData.letter} ({formData.title})
              </h3>
              <p className="text-xs text-neutral-500">
                Adjust country, axis boundaries, and aesthetic parameters.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
            {/* Country and Letter */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Panel Label
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.letter}
                  onChange={(e) => setFormData({ ...formData, letter: e.target.value.toUpperCase() })}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-center font-bold text-base focus:ring-1 focus:ring-neutral-800"
                  placeholder="A"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Country / Scope
                </label>
                <select
                  value={formData.countryKey}
                  onChange={(e) => {
                    const country = e.target.value;
                    setFormData({
                      ...formData,
                      countryKey: country,
                      title: country // automatically update title to match
                    });
                  }}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 bg-white text-sm focus:ring-1 focus:ring-neutral-800"
                >
                  <option value="Global">Global (Total Publications)</option>
                  {availableCountries.filter(c => c !== 'Global').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Subfigure Title */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Subfigure Title (centered top)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-neutral-300 rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-neutral-800"
                placeholder="e.g. USA or Global"
              />
            </div>

            {/* Y Axis Bounds */}
            <div className="border-t border-neutral-100 pt-3">
              <span className="block text-xs font-semibold text-neutral-900 mb-2">
                Y-Axis Range (Numbers of publications)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Min (e.g. 0 or 400)</label>
                  <input
                    type="number"
                    value={formData.yMin !== undefined ? formData.yMin : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      yMin: e.target.value === '' ? undefined : Number(e.target.value)
                    })}
                    placeholder="Auto"
                    className="w-full border border-neutral-300 rounded px-2.5 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Max (e.g. 1200, 4000)</label>
                  <input
                    type="number"
                    value={formData.yMax !== undefined ? formData.yMax : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      yMax: e.target.value === '' ? undefined : Number(e.target.value)
                    })}
                    placeholder="Auto"
                    className="w-full border border-neutral-300 rounded px-2.5 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Step / Interval</label>
                  <input
                    type="number"
                    value={formData.yStep !== undefined ? formData.yStep : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      yStep: e.target.value === '' ? undefined : Number(e.target.value)
                    })}
                    placeholder="Auto"
                    className="w-full border border-neutral-300 rounded px-2.5 py-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* X Axis Bounds */}
            <div className="border-t border-neutral-100 pt-3">
              <span className="block text-xs font-semibold text-neutral-900 mb-2">
                X-Axis Range (Publication year)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Start Year</label>
                  <input
                    type="number"
                    value={formData.xMin !== undefined ? formData.xMin : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      xMin: e.target.value === '' ? undefined : Number(e.target.value)
                    })}
                    placeholder="Auto (2010)"
                    className="w-full border border-neutral-300 rounded px-2.5 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">End Year</label>
                  <input
                    type="number"
                    value={formData.xMax !== undefined ? formData.xMax : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      xMax: e.target.value === '' ? undefined : Number(e.target.value)
                    })}
                    placeholder="Auto (2022)"
                    className="w-full border border-neutral-300 rounded px-2.5 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-0.5">Year Step (e.g. 2)</label>
                  <input
                    type="number"
                    value={formData.xStep || 2}
                    onChange={(e) => setFormData({
                      ...formData,
                      xStep: Number(e.target.value) || 2
                    })}
                    className="w-full border border-neutral-300 rounded px-2.5 py-1 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Styling */}
            <div className="border-t border-neutral-100 pt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Line Style
                </label>
                <select
                  value={formData.lineStyle || 'dashed'}
                  onChange={(e) => setFormData({ ...formData, lineStyle: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="dashed">Dashed (- - - -)</option>
                  <option value="solid">Solid (─────)</option>
                  <option value="dotted">Dotted (· · · ·)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Marker Shape
                </label>
                <select
                  value={formData.markerShape || 'circle'}
                  onChange={(e) => setFormData({ ...formData, markerShape: e.target.value as any })}
                  className="w-full border border-neutral-300 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="circle">Filled Circle (●)</option>
                  <option value="square">Filled Square (■)</option>
                  <option value="triangle">Filled Triangle (▲)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(formData.id);
                  onClose();
                }}
                className="text-xs text-red-600 hover:text-red-800 hover:underline"
              >
                Remove Panel
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
