import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, Rect } from 'react-native-svg';
import { ChartDataPoint } from '../../context/ChartContext';

interface Props {
  data: ChartDataPoint[];
  unit: string;
  metric: string;
  duration: string;
  onWindowChange?: (windowData: ChartDataPoint[]) => void;
}

const PADDING = { left: 44, right: 16, top: 30, bottom: 36 };
const CHART_HEIGHT = 240;

const WINDOW_SIZE: Record<string, number> = {
  'Daily':   7,
  'Weekly':  8,
  'Monthly': 12,
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
  const [chartWidth, setChartWidth] = useState(0);
  const [showValues, setShowValues] = useState(true);

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
  }, [currentPage, data.length, duration]);

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
        <TouchableOpacity
          style={[styles.toggleBtn, showValues && styles.toggleBtnActive]}
          onPress={() => setShowValues(v => !v)}
        >
          <Text style={[styles.toggleBtnText, showValues && styles.toggleBtnTextActive]}>
            Values {showValues ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
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
            <Path d={fillPath} fill="#007AFF" fillOpacity={0.08} />

            {/* Line */}
            <Path d={linePath} stroke="#007AFF" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data points + optional value labels */}
            {points.map((p, i) => {
              const valStr = windowData[i].value.toFixed(1);
              const rectW = valStr.length * 6 + 8;
              const rectH = 14;
              const isNearTop = p.y - PADDING.top < 35;
              const labelY = isNearTop ? p.y + 22 : p.y - 12;
              const rectX = p.x - rectW / 2;
              const rectY = labelY - 11;
              return (
                <React.Fragment key={i}>
                  <Circle cx={p.x} cy={p.y} r={5} fill="#007AFF" />
                  <Circle cx={p.x} cy={p.y} r={2.5} fill="white" />
                  {showValues && (
                    <>
                      <Rect x={rectX} y={rectY} width={rectW} height={rectH} rx={3} fill="white" stroke="#007AFF" strokeWidth={0.8} />
                      <SvgText x={p.x} y={labelY} fontSize={9} fill="#007AFF" textAnchor="middle" fontWeight="600">
                        {valStr}
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

const styles = StyleSheet.create({
  emptyContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptySubText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  toggleBtnActive: {
    borderColor: '#007AFF',
    backgroundColor: '#EFF6FF',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  toggleBtnTextActive: {
    color: '#007AFF',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
  },
  navBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navBtnTextDisabled: {
    color: '#D1D5DB',
  },
  pageInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
