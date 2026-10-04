import React from 'react';
import { PanelConfig, FigureStyleSettings, YearCount } from '../types/bibliometrics';

interface CompositeFigureSVGProps {
  panels: PanelConfig[];
  getCountryData: (countryKey: string) => YearCount[];
  settings: FigureStyleSettings;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export const CompositeFigureSVG: React.FC<CompositeFigureSVGProps> = ({
  panels,
  getCountryData,
  settings,
  svgRef
}) => {
  const cellWidth = settings.cardWidth || 480;
  const cellHeight = settings.cardHeight || 400;

  // Determine grid columns and rows based on layout
  let cols = 2;
  if (settings.layout === '1x1') cols = 1;
  else if (settings.layout === '1x2') cols = 2;
  else if (settings.layout === '1x3') cols = 3;
  else if (settings.layout === '1x4') cols = 4;
  else if (settings.layout === '2x2') cols = 2;
  else if (settings.layout === '2x3') cols = 3;
  else if (settings.layout === '3x3') cols = 3;

  const totalPanels = panels.length;
  const rows = Math.ceil(totalPanels / cols) || 1;

  const totalWidth = cols * cellWidth;
  const totalHeight = rows * cellHeight;

  const margin = { top: 38, right: 30, bottom: 58, left: 68 };
  const plotWidth = cellWidth - margin.left - margin.right;
  const plotHeight = cellHeight - margin.top - margin.bottom;

  const fontFamilies = {
    sans: 'Arial, Helvetica, -apple-system, sans-serif',
    serif: 'Times New Roman, Times, Georgia, serif',
    mono: 'Courier New, monospace'
  };
  const activeFont = fontFamilies[settings.fontFamily] || fontFamilies.sans;

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      width={totalWidth}
      height={totalHeight}
      className="bg-white mx-auto block max-w-full h-auto"
      style={{ fontFamily: activeFont, backgroundColor: '#ffffff' }}
    >
      <rect width={totalWidth} height={totalHeight} fill="#ffffff" />

      {panels.map((panel, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const offsetX = col * cellWidth;
        const offsetY = row * cellHeight;

        const data = getCountryData(panel.countryKey);
        const years = data.map(d => d.year);
        const counts = data.map(d => d.count);

        const minDataYear = years.length > 0 ? Math.min(...years) : 2011;
        const maxDataYear = years.length > 0 ? Math.max(...years) : 2020;
        const minDataCount = counts.length > 0 ? Math.min(...counts) : 0;
        const maxDataCount = counts.length > 0 ? Math.max(...counts) : 100;

        // X boundaries
        const xMin = panel.xMin !== undefined ? panel.xMin : Math.floor((minDataYear - 1) / 2) * 2;
        const xMax = panel.xMax !== undefined ? panel.xMax : Math.ceil((maxDataYear + 2) / 2) * 2;
        const xStep = panel.xStep || 2;

        // Y boundaries
        let yMin = panel.yMin !== undefined ? panel.yMin : 0;
        let yMax = panel.yMax;
        let yStep = panel.yStep;

        if (yMax === undefined || yStep === undefined) {
          if (panel.yMin === undefined && minDataCount > 350 && (maxDataCount - minDataCount) < 800) {
            yMin = Math.floor(minDataCount / 200) * 200;
          } else if (panel.yMin === undefined) {
            yMin = 0;
          }

          const range = maxDataCount - yMin;
          if (range <= 250) {
            yMax = yMax ?? 250;
            yStep = yStep ?? 50;
          } else if (range <= 500) {
            yMax = yMax ?? 500;
            yStep = yStep ?? 100;
          } else if (range <= 1200) {
            yMax = yMax ?? 1200;
            yStep = yStep ?? 200;
          } else if (range <= 2000) {
            yMax = yMax ?? 2000;
            yStep = yStep ?? 500;
          } else if (range <= 4000) {
            yMax = yMax ?? 4000;
            yStep = yStep ?? 1000;
          } else {
            const mag = Math.pow(10, Math.floor(Math.log10(range || 1)));
            yStep = yStep ?? (range / mag > 5 ? mag : mag / 2);
            yMax = yMax ?? Math.ceil((maxDataCount * 1.1) / yStep) * yStep;
          }
        }

        // Ticks
        const xTicks: number[] = [];
        for (let yr = xMin; yr <= xMax + 0.001; yr += xStep) {
          xTicks.push(Math.round(yr));
        }

        const minorXTicks: number[] = [];
        if (xStep >= 2) {
          for (let yr = xMin + xStep / 2; yr < xMax; yr += xStep) {
            minorXTicks.push(yr);
          }
        }

        const yTicks: number[] = [];
        for (let val = yMin; val <= yMax + 0.001; val += yStep) {
          yTicks.push(Math.round(val));
        }

        const minorYTicks: number[] = [];
        if (yStep > 0) {
          const minorInterval = yStep / 5;
          for (let val = yMin; val < yMax; val += yStep) {
            for (let m = 1; m < 5; m++) {
              minorYTicks.push(val + m * minorInterval);
            }
          }
        }

        const getX = (year: number) => {
          return margin.left + ((year - xMin) / (xMax - xMin)) * plotWidth;
        };

        const getY = (count: number) => {
          return margin.top + plotHeight - ((count - yMin) / (yMax - yMin)) * plotHeight;
        };

        const sortedData = [...data].sort((a, b) => a.year - b.year);
        const pathD = sortedData
          .map((pt, idx) => {
            const x = getX(pt.year);
            const y = getY(pt.count);
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
          })
          .join(' ');

        const strokeStyle = panel.lineStyle || settings.defaultLineStyle;
        let strokeDash: string | undefined = undefined;
        if (strokeStyle === 'dashed') strokeDash = '4, 3';
        if (strokeStyle === 'dotted') strokeDash = '1.5, 2.5';

        const strokeColor = panel.lineColor || settings.lineColor;
        const markerColor = panel.lineColor || settings.pointColor;
        const mSize = panel.markerSize || settings.pointSize;
        const mShape = panel.markerShape || 'circle';

        return (
          <g key={panel.id} transform={`translate(${offsetX}, ${offsetY})`}>
            {/* Background of cell */}
            <rect width={cellWidth} height={cellHeight} fill="#ffffff" />

            {/* Subtle grid */}
            {settings.showSubtleGrid && (
              <g stroke="#f1f5f9" strokeWidth="0.75" strokeDasharray="3,3">
                {yTicks.map(val => (
                  <line
                    key={`grid-y-${val}`}
                    x1={margin.left}
                    y1={getY(val)}
                    x2={margin.left + plotWidth}
                    y2={getY(val)}
                  />
                ))}
                {xTicks.map(yr => (
                  <line
                    key={`grid-x-${yr}`}
                    x1={getX(yr)}
                    y1={margin.top}
                    x2={getX(yr)}
                    y2={margin.top + plotHeight}
                  />
                ))}
              </g>
            )}

            {/* Panel Letter (A, B, C, D) in top left corner */}
            {panel.letter && (
              <text
                x={margin.left - 45}
                y={margin.top - 12}
                fontSize="18"
                fontWeight="bold"
                fill="#000000"
                textAnchor="start"
              >
                {panel.letter}
              </text>
            )}

            {/* Panel Title ("Global", "USA", "China", "Australia") */}
            <text
              x={margin.left + plotWidth / 2}
              y={margin.top - 14}
              fontSize="14.5"
              fontWeight="500"
              fill="#000000"
              textAnchor="middle"
            >
              {panel.title}
            </text>

            {/* Y Axis line */}
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={margin.top + plotHeight}
              stroke="#000000"
              strokeWidth={settings.axisLineWidth || 1.6}
              strokeLinecap="square"
            />

            {/* X Axis line */}
            <line
              x1={margin.left}
              y1={margin.top + plotHeight}
              x2={margin.left + plotWidth}
              y2={margin.top + plotHeight}
              stroke="#000000"
              strokeWidth={settings.axisLineWidth || 1.6}
              strokeLinecap="square"
            />

            {/* Minor Y Ticks */}
            {minorYTicks.map((val, idx) => {
              const yPos = getY(val);
              if (yPos < margin.top || yPos > margin.top + plotHeight) return null;
              return (
                <line
                  key={`yminor-${idx}`}
                  x1={margin.left - 2.8}
                  y1={yPos}
                  x2={margin.left}
                  y2={yPos}
                  stroke="#000000"
                  strokeWidth="1.0"
                />
              );
            })}

            {/* Major Y Ticks and Numbers */}
            {yTicks.map(val => {
              const yPos = getY(val);
              return (
                <g key={`ytick-${val}`}>
                  <line
                    x1={margin.left - (settings.tickLength || 5.5)}
                    y1={yPos}
                    x2={margin.left}
                    y2={yPos}
                    stroke="#000000"
                    strokeWidth="1.4"
                  />
                  <text
                    x={margin.left - 9}
                    y={yPos + 4.2}
                    fontSize="12"
                    fill="#000000"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Minor X Ticks */}
            {minorXTicks.map((yr, idx) => {
              const xPos = getX(yr);
              if (xPos < margin.left || xPos > margin.left + plotWidth) return null;
              return (
                <line
                  key={`xminor-${idx}`}
                  x1={xPos}
                  y1={margin.top + plotHeight}
                  x2={xPos}
                  y2={margin.top + plotHeight + 2.8}
                  stroke="#000000"
                  strokeWidth="1.0"
                />
              );
            })}

            {/* Major X Ticks and Years */}
            {xTicks.map(yr => {
              const xPos = getX(yr);
              return (
                <g key={`xtick-${yr}`}>
                  <line
                    x1={xPos}
                    y1={margin.top + plotHeight}
                    x2={xPos}
                    y2={margin.top + plotHeight + (settings.tickLength || 5.5)}
                    stroke="#000000"
                    strokeWidth="1.4"
                  />
                  <text
                    x={xPos}
                    y={margin.top + plotHeight + 19}
                    fontSize="12"
                    fill="#000000"
                    textAnchor="middle"
                  >
                    {yr}
                  </text>
                </g>
              );
            })}

            {/* Y Axis Title */}
            <text
              x={-(margin.top + plotHeight / 2)}
              y={margin.left - 48}
              transform="rotate(-90)"
              fontSize="13"
              fontWeight="400"
              fill="#000000"
              textAnchor="middle"
            >
              {settings.yAxisTitle}
            </text>

            {/* X Axis Title */}
            <text
              x={margin.left + plotWidth / 2}
              y={margin.top + plotHeight + 38}
              fontSize="13"
              fontWeight="400"
              fill="#000000"
              textAnchor="middle"
            >
              {settings.xAxisTitle}
            </text>

            {/* Data Line */}
            {sortedData.length > 1 && (
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={panel.strokeWidth || settings.lineWidth || 1.4}
                strokeDasharray={strokeDash}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Data Points */}
            {sortedData.map(pt => {
              const cx = getX(pt.year);
              const cy = getY(pt.count);
              if (cx < margin.left || cx > margin.left + plotWidth || cy < margin.top || cy > margin.top + plotHeight) {
                return null;
              }

              if (mShape === 'square') {
                return (
                  <rect
                    key={`point-${pt.year}`}
                    x={cx - mSize}
                    y={cy - mSize}
                    width={mSize * 2}
                    height={mSize * 2}
                    fill={markerColor}
                  />
                );
              }
              if (mShape === 'triangle') {
                return (
                  <polygon
                    key={`point-${pt.year}`}
                    points={`${cx},${cy - mSize * 1.2} ${cx - mSize * 1.1},${cy + mSize * 0.9} ${cx + mSize * 1.1},${cy + mSize * 0.9}`}
                    fill={markerColor}
                  />
                );
              }
              return (
                <circle
                  key={`point-${pt.year}`}
                  cx={cx}
                  cy={cy}
                  r={mSize}
                  fill={markerColor}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};
