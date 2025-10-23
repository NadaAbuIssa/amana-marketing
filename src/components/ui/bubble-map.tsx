"use client";

import { useState, useRef } from 'react';

interface BubbleMapDataPoint {
  region: string;
  revenue: number;
  spend: number;
  lat?: number;
  lon?: number;
}

interface BubbleMapProps {
  data: BubbleMapDataPoint[];
  mode: 'revenue' | 'spend';
  className?: string;
  title?: string;
}

interface TooltipData {
  x: number;
  y: number;
  region: string;
  value: number;
  mode: 'revenue' | 'spend';
}

export function BubbleMap({ 
  data, 
  mode, 
  className = "",
  title
}: BubbleMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        {title && (
          <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center h-64 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  // Calculate dimensions
  const width = 600;
  const height = 400;
  const padding = 40;

  // Get min and max values for scaling
  const values = data.map(d => d[mode]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  // Generate positions (random if no lat/lon provided)
  const generatePosition = (item: BubbleMapDataPoint, index: number) => {
    if (item.lat !== undefined && item.lon !== undefined) {
      // Use provided coordinates (scaled to fit the SVG)
      return {
        x: padding + (item.lon + 180) * (width - 2 * padding) / 360,
        y: padding + (90 - item.lat) * (height - 2 * padding) / 180
      };
    } else {
      // Generate random positions with some clustering
      const clusterX = (index % 3) * (width - 2 * padding) / 3;
      const clusterY = Math.floor(index / 3) * (height - 2 * padding) / Math.ceil(data.length / 3);
      
      return {
        x: padding + clusterX + Math.random() * 80 - 40,
        y: padding + clusterY + Math.random() * 60 - 30
      };
    }
  };

  // Calculate bubble size based on value
  const getBubbleSize = (value: number) => {
    const normalizedValue = valueRange > 0 ? (value - minValue) / valueRange : 0.5;
    const minSize = 20;
    const maxSize = 80;
    return minSize + normalizedValue * (maxSize - minSize);
  };

  // Generate color based on value
  const getBubbleColor = (value: number) => {
    const normalizedValue = valueRange > 0 ? (value - minValue) / valueRange : 0.5;
    
    if (mode === 'revenue') {
      // Green gradient for revenue
      const intensity = Math.floor(normalizedValue * 255);
      return `rgb(${255 - intensity}, ${intensity + 100}, 100)`;
    } else {
      // Blue gradient for spend
      const intensity = Math.floor(normalizedValue * 255);
      return `rgb(${100}, ${100}, ${intensity + 100})`;
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<SVGCircleElement>, item: BubbleMapDataPoint) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setTooltip({
      x,
      y,
      region: item.region,
      value: item[mode],
      mode
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-6">{title}</h3>
      )}
      
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="w-full h-auto"
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Bubbles */}
          {data.map((item, index) => {
            const position = generatePosition(item, index);
            const size = getBubbleSize(item[mode]);
            const color = getBubbleColor(item[mode]);
            
            return (
              <g key={item.region}>
                {/* Bubble */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={size / 2}
                  fill={color}
                  stroke="#1F2937"
                  strokeWidth="2"
                  opacity="0.8"
                  className="cursor-pointer transition-all duration-200 hover:opacity-100 hover:scale-110"
                  onMouseEnter={(e) => handleMouseEnter(e, item)}
                  onMouseLeave={handleMouseLeave}
                />
                
                {/* Region label */}
                <text
                  x={position.x}
                  y={position.y + 4}
                  textAnchor="middle"
                  className="text-xs font-medium fill-white pointer-events-none"
                  style={{ fontSize: Math.max(10, size / 6) }}
                >
                  {item.region.length > 8 ? item.region.substring(0, 8) + '...' : item.region}
                </text>
              </g>
            );
          })}
          
          {/* Tooltip */}
          {tooltip && (
            <g>
              {/* Tooltip background */}
              <rect
                x={tooltip.x - 60}
                y={tooltip.y - 50}
                width="120"
                height="40"
                rx="6"
                fill="#1F2937"
                stroke="#374151"
                strokeWidth="1"
                className="drop-shadow-lg"
              />
              {/* Tooltip text */}
              <text
                x={tooltip.x}
                y={tooltip.y - 30}
                textAnchor="middle"
                className="text-sm font-medium fill-white"
              >
                {tooltip.region}
              </text>
              <text
                x={tooltip.x}
                y={tooltip.y - 10}
                textAnchor="middle"
                className="text-xs fill-gray-300"
              >
                {mode === 'revenue' ? 'Revenue' : 'Spend'}: ${tooltip.value.toLocaleString()}
              </text>
            </g>
          )}
        </svg>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-300">
              {mode === 'revenue' ? 'Revenue' : 'Spend'} by Region
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Size represents {mode === 'revenue' ? 'revenue' : 'spending'} amount
          </div>
        </div>
      </div>
    </div>
  );
}
