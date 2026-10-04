import React, { useId, useState } from 'react';
import { YearCount } from '../types/bibliometrics';

export interface AcademicLineChartProps {
  id?: string;
  panelLetter?: string; // 'A', 'B', 'C', 'D'
  title: string; // 'Global', 'USA', etc.
  data: YearCount[];
  yMin?: number;
  yMax?: number;
  yStep?: number;
  xMin?: number;
  xMax?: number;
  xStep?: number;
  yAxisTitle?: string;
  xAxisTitle?: string;
  lineStyle?: 'dashed' | 'solid' | 'dotted';
  markerShape?: 'circle' | 'square' | 'triangle';
  markerSize?: number;
  strokeWidth?: number;
  lineColor?: string;
  pointColor?: string;
  fontFamily?: string;
  width?: number;
  height?: number;
  interactive?: boolean;
  onEditPanel?: () => void;
  showMinorTicks?: boolean;
  showGrid?: boolean;
}

export const AcademicLineChart: React.FC<AcademicLineChartProps> = ({
  id,
  panelLetter,
  title,
  data,
  yMin: propYMin,
  yMax: propYMax,
  yStep: propYStep,
  xMin: propXMin,
  xMax: propXMax,
  xStep: propXStep = 2,
  yAxisTitle = 'Numbers of publications',
  xAxisTitle = 'Publication year',
  lineStyle = 'dashed',
  markerShape = 'circle',
  markerSize = 4.2,
  strokeWidth = 1.4,
  lineColor = '#000000',
  pointColor = '#000000',
  fontFamily = 'Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  width = 460,
  height = 380,
  interactive = true,
  onEditPanel,
  showMinorTicks = true,
  showGrid = false
}) => {
  const chartId = useId();
  const [hoveredPoint, setHoveredPoint] = useState<{ year: number; count: number; x: number; y: number } | null>(null);

  // Layout margins carefully calibrated to match scientific publication layout
  const margin = { top: 38, right: 30, bottom: 58, left: 68 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Compute domain ranges
  const years = data.map(d => d.year);
  const counts = data.map(d => d.count);

  const minDataYear = years.length > 0 ? Math.min(...years) : 2011;
  const maxDataYear = years.length > 0 ? Math.max(...years) : 2020;
  const minDataCount = counts.length > 0 ? Math.min(...counts) : 0;
  const maxDataCount = counts.length > 0 ? Math.max(...counts) : 100;

  // X range: rounded to even numbers
  const xMin = propXMin !== undefined ? propXMin : Math.floor((minDataYear - 1) / 2) * 2;
  const xMax = propXMax !== undefined ? propXMax : Math.ceil((maxDataYear + 2) / 2) * 2;
  const xStep = propXStep || 2;

  // Y range: determine pleasant rounded tick boundaries
  let yMin = propYMin !== undefined ? propYMin : 0;
  let yMax = propYMax;
  let yStep = propYStep;

  if (yMax === undefined || yStep === undefined) {
    if (propYMin === undefined && minDataCount > 350 && (maxDataCount - minDataCount) < 800) {
      // Like USA in the screenshot: 400 to 1200
      yMin = Math.floor(minDataCount / 200) * 200;
    } else if (propYMin === undefined) {
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
      const mag = Math.pow(10, Math.floor(Math.log10(range)));
      yStep = yStep ?? (range / mag > 5 ? mag : mag / 2);
      yMax = yMax ?? Math.ceil((maxDataCount * 1.1) / yStep) * yStep;
    }
  }

  // Generate Major X Ticks
  const xTicks: number[] = [];
  for (let yr = xMin; yr <= xMax + 0.001; yr += xStep) {
    xTicks.push(Math.round(yr));
  }

  // Generate Minor X Ticks (in between major ticks)
  const minorXTicks: number[] = [];
  if (showMinorTicks && xStep >= 2) {
    for (let yr = xMin + xStep / 2; yr < xMax; yr += xStep) {
      minorXTicks.push(yr);
    }
  }

  // Generate Major Y Ticks
  const yTicks: number[] = [];
  for (let val = yMin; val <= yMax + 0.001; val += yStep) {
    yTicks.push(Math.round(val));
  }

  // Generate Minor Y Ticks (4 minor ticks between major ticks like Prism/Lancet figures)
  const minorYTicks: number[] = [];
  if (showMinorTicks && yStep > 0) {
    const minorInterval = yStep / 5;
    for (let val = yMin; val < yMax; val += yStep) {
      for (let m = 1; m < 5; m++) {
        minorYTicks.push(val + m * minorInterval);
      }
    }
  }

  // Coordinate mapping functions
  const getX = (year: number) => {
    return margin.left + ((year - xMin) / (xMax - xMin)) * plotWidth;
  };

  const getY = (count: number) => {
    return margin.top + plotHeight - ((count - yMin) / (yMax - yMin)) * plotHeight;
  };

  // Build SVG path for line
  const sortedData = [...data].sort((a, b) => a.year - b.year);
  const pathD = sortedData
    .map((pt, idx) => {
      const x = getX(pt.year);
      const y = getY(pt.count);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  // Line dash array
  let strokeDash: string | undefined = undefined;
  if (lineStyle === 'dashed') strokeDash = '4, 3';
  if (lineStyle === 'dotted') strokeDash = '1.5, 2.5';

  return (
    <div className="relative group bg-white border border-neutral-200 rounded-lg p-2 shadow-xs transition-shadow hover:shadow-md">
      {/* Quick panel edit button in corner on hover */}
      {onEditPanel && (
        <button
          onClick={onEditPanel}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs px-2 py-1 rounded flex items-center gap-1 z-10"
          title="Configure this panel's country, axes, or styles"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Configure
        </button>
      )}

      <svg
        id={id || `chart-${chartId}`}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto block select-none"
        style={{ fontFamily }}
      >
        {/* Subtle grid if enabled */}
        {showGrid && (
          <g className="grid-lines" stroke="#e5e7eb" strokeWidth="0.75" strokeDasharray="3,3">
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

        {/* Panel Letter (A, B, C, D) positioned top-left */}
        {panelLetter && (
          <text
            x={margin.left - 45}
            y={margin.top - 12}
            fontSize="18"
            fontWeight="bold"
            fill="#000000"
            textAnchor="start"
          >
            {panelLetter}
          </text>
        )}

        {/* Centered Panel Title (e.g. 'Global', 'USA', 'China', 'Australia') */}
        <text
          x={margin.left + plotWidth / 2}
          y={margin.top - 14}
          fontSize="14.5"
          fontWeight="500"
          fill="#111827"
          textAnchor="middle"
        >
          {title}
        </text>

        {/* Y Axis line (Left) */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + plotHeight}
          stroke="#000000"
          strokeWidth="1.6"
          strokeLinecap="square"
        />

        {/* X Axis line (Bottom) */}
        <line
          x1={margin.left}
          y1={margin.top + plotHeight}
          x2={margin.left + plotWidth}
          y2={margin.top + plotHeight}
          stroke="#000000"
          strokeWidth="1.6"
          strokeLinecap="square"
        />

        {/* Minor Y Ticks (Outward) */}
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
              {/* Outward tick */}
              <line
                x1={margin.left - 5.5}
                y1={yPos}
                x2={margin.left}
                y2={yPos}
                stroke="#000000"
                strokeWidth="1.4"
              />
              {/* Tick Label */}
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

        {/* Minor X Ticks (Outward) */}
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

        {/* Major X Ticks and Year Numbers */}
        {xTicks.map(yr => {
          const xPos = getX(yr);
          return (
            <g key={`xtick-${yr}`}>
              {/* Outward tick */}
              <line
                x1={xPos}
                y1={margin.top + plotHeight}
                x2={xPos}
                y2={margin.top + plotHeight + 5.5}
                stroke="#000000"
                strokeWidth="1.4"
              />
              {/* Year label */}
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

        {/* Y Axis Title ("Numbers of publications") */}
        <text
          x={-(margin.top + plotHeight / 2)}
          y={margin.left - 48}
          transform="rotate(-90)"
          fontSize="13"
          fontWeight="400"
          fill="#000000"
          textAnchor="middle"
        >
          {yAxisTitle}
        </text>

        {/* X Axis Title ("Publication year") */}
        <text
          x={margin.left + plotWidth / 2}
          y={margin.top + plotHeight + 38}
          fontSize="13"
          fontWeight="400"
          fill="#000000"
          textAnchor="middle"
        >
          {xAxisTitle}
        </text>

        {/* Data Line */}
        {sortedData.length > 1 && (
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth={strokeWidth}
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

          return (
            <g
              key={`point-${pt.year}`}
              className="cursor-pointer"
              onMouseEnter={() => {
                if (interactive) setHoveredPoint({ year: pt.year, count: pt.count, x: cx, y: cy });
              }}
              onMouseLeave={() => {
                if (interactive) setHoveredPoint(null);
              }}
            >
              {/* Invisible larger hit target for easy mouse hover */}
              <circle cx={cx} cy={cy} r={markerSize + 8} fill="transparent" />

              {markerShape === 'circle' && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={markerSize}
                  fill={pointColor}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                />
              )}
              {markerShape === 'square' && (
                <rect
                  x={cx - markerSize}
                  y={cy - markerSize}
                  width={markerSize * 2}
                  height={markerSize * 2}
                  fill={pointColor}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                />
              )}
              {markerShape === 'triangle' && (
                <polygon
                  points={`${cx},${cy - markerSize * 1.2} ${cx - markerSize * 1.1},${cy + markerSize * 0.9} ${cx + markerSize * 1.1},${cy + markerSize * 0.9}`}
                  fill={pointColor}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                />
              )}
            </g>
          );
        })}

        {/* Hover Tooltip inside SVG */}
        {hoveredPoint && (
          <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 12})`} pointerEvents="none">
            <rect
              x="-45"
              y="-28"
              width="90"
              height="24"
              rx="4"
              fill="#1e293b"
              opacity="0.92"
            />
            <text
              x="0"
              y="-12"
              fill="#ffffff"
              fontSize="11"
              fontWeight="500"
              textAnchor="middle"
            >
              {hoveredPoint.year}: {hoveredPoint.count.toLocaleString()}
            </text>
            <polygon points="-4,-4 4,-4 0,0" fill="#1e293b" opacity="0.92" />
          </g>
        )}
      </svg>
    </div>
  );
};
