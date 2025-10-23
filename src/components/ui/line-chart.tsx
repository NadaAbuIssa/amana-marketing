"use client";

import { useState, useRef } from 'react';

interface LineChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  title: string;
  data: LineChartDataPoint[];
  height?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

interface TooltipData {
  x: number;
  y: number;
  label: string;
  value: number;
}

export function LineChart({ 
  title, 
  data, 
  height = 300,
  formatValue = (value) => value.toLocaleString(),
  className = ""
}: LineChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Calculate dimensions and scales
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };
  const chartWidth = 600;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue;
  const valuePadding = valueRange * 0.1; // 10% padding

  const xScale = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const yScale = (value: number) => {
    const normalizedValue = (value - minValue + valuePadding) / (valueRange + 2 * valuePadding);
    return padding.top + (1 - normalizedValue) * innerHeight;
  };

  // Generate path for the line
  const pathData = data.map((point, index) => {
    const x = xScale(index);
    const y = yScale(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate smooth curve using quadratic bezier curves
  const smoothPathData = data.map((point, index) => {
    const x = xScale(index);
    const y = yScale(point.value);
    
    if (index === 0) {
      return `M ${x} ${y}`;
    }
    
    const prevX = xScale(index - 1);
    const prevY = yScale(data[index - 1].value);
    const cp1x = prevX + (x - prevX) / 3;
    const cp1y = prevY;
    const cp2x = x - (x - prevX) / 3;
    const cp2y = y;
    
    return `C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${x} ${y}`;
  }).join(' ');

  // Generate Y-axis labels
  const yAxisLabels = [];
  const numLabels = 5;
  for (let i = 0; i <= numLabels; i++) {
    const value = minValue - valuePadding + (i / numLabels) * (valueRange + 2 * valuePadding);
    const y = yScale(value);
    yAxisLabels.push({ value, y });
  }

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    
    // Find the closest data point
    let closestIndex = 0;
    let minDistance = Math.abs(mouseX - xScale(0));
    
    for (let i = 1; i < data.length; i++) {
      const distance = Math.abs(mouseX - xScale(i));
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    const point = data[closestIndex];
    setTooltip({
      x: xScale(closestIndex),
      y: yScale(point.value),
      label: point.label,
      value: point.value
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      
      <div className="relative">
        <svg
          ref={svgRef}
          width={chartWidth}
          height={chartHeight}
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Y-axis lines */}
          {yAxisLabels.map((label, index) => (
            <line
              key={index}
              x1={padding.left}
              y1={label.y}
              x2={chartWidth - padding.right}
              y2={label.y}
              stroke="#4B5563"
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}

          {/* Y-axis labels */}
          {yAxisLabels.map((label, index) => (
            <text
              key={index}
              x={padding.left - 10}
              y={label.y + 4}
              textAnchor="end"
              className="text-xs fill-gray-400"
            >
              {formatValue(label.value)}
            </text>
          ))}

          {/* X-axis labels */}
          {data.map((point, index) => (
            <text
              key={index}
              x={xScale(index)}
              y={chartHeight - padding.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-gray-400"
            >
              {point.label}
            </text>
          ))}

          {/* Line path */}
          <path
            d={smoothPathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {/* Data points */}
          {data.map((point, index) => (
            <circle
              key={index}
              cx={xScale(index)}
              cy={yScale(point.value)}
              r="4"
              fill="#3B82F6"
              stroke="#1E40AF"
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all duration-200"
            />
          ))}

          {/* Tooltip */}
          {tooltip && (
            <g>
              {/* Tooltip background */}
              <rect
                x={tooltip.x - 30}
                y={tooltip.y - 40}
                width="60"
                height="30"
                rx="4"
                fill="#1F2937"
                stroke="#374151"
                strokeWidth="1"
              />
              {/* Tooltip text */}
              <text
                x={tooltip.x}
                y={tooltip.y - 25}
                textAnchor="middle"
                className="text-xs fill-white font-medium"
              >
                {formatValue(tooltip.value)}
              </text>
              <text
                x={tooltip.x}
                y={tooltip.y - 10}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                {tooltip.label}
              </text>
              {/* Tooltip line */}
              <line
                x1={tooltip.x}
                y1={padding.top}
                x2={tooltip.x}
                y2={chartHeight - padding.bottom}
                stroke="#6B7280"
                strokeWidth="1"
                strokeDasharray="2,2"
                opacity="0.7"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
