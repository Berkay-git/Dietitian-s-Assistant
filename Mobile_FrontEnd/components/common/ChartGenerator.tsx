import React, { useState, useEffect } from 'react';
import { View, Text, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';
import { ChartDataPoint } from '../../context/ChartContext';
import { styles } from '../../styles/screens/ChartGeneratorStyles';

interface Props {
  data: ChartDataPoint[];
  unit: string;
  metric: string;
  duration: string;
  onWindowChange?: (windowData: ChartDataPoint[]) => void;
}

const PADDING = { left: 52, right: 16, top: 30, bottom: 36 };
const CHART_HEIGHT = 240;
const KG_TO_LBS = 2.20462;

const METRIC_COLORS: Record<string, string> = {
  'Weight':    '#007AFF', // Blue
  'Body Fat':  '#FF6B35', // Orange
  'Adherence': '#34C759', // Green
};

// Oluşturulan grafikte kaç tane data point olacağını gösterir
const WINDOW_SIZE: Record<string, number> = {
  'Daily':   7,  //To see detailed version of a week
  'Weekly':  4,  //To see detailed version of a month
  'Monthly': 3,  //To see each season
};

function formatXLabel(date: string): string {
  if (date.includes('-W')) {
    return `W${date.split('-W')[1]}`;
  }
  if (date.length === 7) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(date.split('-')[1], 10) - 1] ?? date;
  }
  const parts = date.split('-');
  return `${parts[1]}/${parts[2]}`;
}

function getPageLabel(windowData: ChartDataPoint[], duration: string): string {
  if (!windowData.length) return '';
  const first = windowData[0].date;
  const last = windowData[windowData.length - 1].date;

  if (duration === 'Monthly') {
    const firstYear = first.split('-')[0];
    const lastYear = last.split('-')[0];
    return firstYear === lastYear ? firstYear : `${firstYear} — ${lastYear}`;
  }
  if (duration === 'Weekly') {
    return `${formatXLabel(first)} — ${formatXLabel(last)}`;
  }
  const f = first.split('-');
  const l = last.split('-');
  return `${f[1]}/${f[2]} — ${l[1]}/${l[2]}`;
}

export default function ChartGenerator({ data, unit, metric, duration, onWindowChange }: Props) {
  const color = METRIC_COLORS[metric] ?? '#007AFF';
  const isKg = unit === 'kg';
  const [chartWidth, setChartWidth] = useState(0);
  const [showValues, setShowValues] = useState(true);
  const [showLbs, setShowLbs] = useState(false);

  const windowSize = WINDOW_SIZE[duration] ?? 7;
  const totalPages = Math.ceil(data.length / windowSize);
  const [currentPage, setCurrentPage] = useState(Math.max(0, totalPages - 1));

  useEffect(() => {
    setCurrentPage(Math.max(0, Math.ceil(data.length / windowSize) - 1));
  }, [data, duration]);

  useEffect(() => {
    if (onWindowChange) {
      const start = currentPage * windowSize;
      onWindowChange(data.slice(start, start + windowSize));
    }
  }, [currentPage, data]);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No records found for this metric.</Text>
        <Text style={styles.emptySubText}>Ask your dietitian to record measurements.</Text>
      </View>
    );
  }

  const startIdx = currentPage * windowSize;
  const windowData = data.slice(startIdx, startIdx + windowSize);

  const plotWidth = chartWidth - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const values = windowData.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal === minVal ? 1 : maxVal - minVal;

  const getX = (i: number) =>
    PADDING.left + (windowData.length === 1 ? plotWidth / 2 : (i / (windowData.length - 1)) * plotWidth);
  const getY = (val: number) =>
    PADDING.top + (1 - (val - minVal) / range) * plotHeight;

  const points = windowData.map((d, i) => ({ x: getX(i), y: getY(d.value) }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const baseY = PADDING.top + plotHeight;
  const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baseY} L ${points[0].x.toFixed(1)} ${baseY} Z`;

  const yLabels = [
    { val: maxVal, y: getY(maxVal) },
    { val: (minVal + maxVal) / 2, y: getY((minVal + maxVal) / 2) },
    { val: minVal, y: getY(minVal) },
  ];

  const step = Math.max(1, Math.floor(windowData.length / 6));
  const xLabelIndices = windowData
    .map((_, i) => i)
    .filter(i => i % step === 0 || i === windowData.length - 1);

  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;
  const showNav = totalPages > 1;

  return (
    <View>
      {/* Top row: page label + values toggle */}
      <View style={styles.topRow}>
        <Text style={styles.pageLabel}>{getPageLabel(windowData, duration)}</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {isKg && (
            <TouchableOpacity
              style={[styles.toggleBtn, { borderColor: color, backgroundColor: color + '15' }]}
              onPress={() => setShowLbs(v => !v)}
            >
              <Text style={[styles.toggleBtnText, { color }]}>
                {showLbs ? 'lbs' : 'kg'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.toggleBtn, showValues && { borderColor: color, backgroundColor: color + '15' }]}
            onPress={() => setShowValues(v => !v)}
          >
            <Text style={[styles.toggleBtnText, showValues && { color }]}>
              Values {showValues ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart SVG */}
      <View onLayout={(e: LayoutChangeEvent) => setChartWidth(e.nativeEvent.layout.width)}>
        {chartWidth > 0 && (
          <Svg width={chartWidth} height={CHART_HEIGHT}>
            {/* Grid lines */}
            {yLabels.map((l, i) => (
              <Line key={i} x1={PADDING.left} y1={l.y} x2={chartWidth - PADDING.right} y2={l.y} stroke="#F3F4F6" strokeWidth={1} />
            ))}

            {/* Fill area */}
            <Path d={fillPath} fill={color} fillOpacity={0.08} />

            {/* Line */}
            <Path d={linePath} stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points + optional value labels */}
            {points.map((p, i) => {
              const val = windowData[i].value;
              const displayVal = isKg && showLbs ? (val * KG_TO_LBS).toFixed(1) : val.toFixed(1);
              const displayUnit = isKg ? (showLbs ? 'lbs' : 'kg') : unit;
              const displayStr = `${displayVal} ${displayUnit}`;
              const rectW = displayStr.length * 5.5 + 12;
              const rectH = 14;
              const isNearTop = p.y - PADDING.top < 35;
              const labelY = isNearTop ? p.y + 22 : p.y - 12;
              const rectX = p.x - rectW / 2;
              const rectY = labelY - 11;
              return (
                <React.Fragment key={i}>
                  <Circle cx={p.x} cy={p.y} r={5} fill={color} />
                  <Circle cx={p.x} cy={p.y} r={2.5} fill="white" />
                  {showValues && (
                    <>
                      <Rect x={rectX} y={rectY} width={rectW} height={rectH} rx={3} fill="white" stroke={color} strokeWidth={0.8} />
                      <SvgText x={p.x} y={labelY} fontSize={9} fill={color} textAnchor="middle" fontWeight="600">
                        {displayStr}
                      </SvgText>
                    </>
                  )}
                </React.Fragment>
              );
            })}

            {/* Y axis labels */}
            {yLabels.map((l, i) => (
              <SvgText key={i} x={PADDING.left - 6} y={l.y + 4} fontSize={10} fill="#9CA3AF" textAnchor="end">
                {l.val.toFixed(1)}
              </SvgText>
            ))}

            {/* X axis labels */}
            {xLabelIndices.map(idx => (
              <SvgText key={idx} x={getX(idx)} y={CHART_HEIGHT - 6} fontSize={10} fill="#9CA3AF" textAnchor="middle">
                {formatXLabel(windowData[idx].date)}
              </SvgText>
            ))}
          </Svg>
        )}
      </View>

      {/* Pagination */}
      {showNav && (
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, !hasPrev && styles.navBtnDisabled]}
            onPress={() => hasPrev && setCurrentPage(p => p - 1)}
            disabled={!hasPrev}
          >
            <Text style={[styles.navBtnText, !hasPrev && styles.navBtnTextDisabled]}>‹ Prev</Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>{currentPage + 1} / {totalPages}</Text>

          <TouchableOpacity
            style={[styles.navBtn, !hasNext && styles.navBtnDisabled]}
            onPress={() => hasNext && setCurrentPage(p => p + 1)}
            disabled={!hasNext}
          >
            <Text style={[styles.navBtnText, !hasNext && styles.navBtnTextDisabled]}>Next ›</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

