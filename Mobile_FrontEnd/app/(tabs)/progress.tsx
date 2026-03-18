import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { styles, skeletonStyles } from '../../styles/screens/ProgressStyles';
import { useAuth } from '../../context/AuthContext';
import { useChart, ChartDataPoint } from '../../context/ChartContext';
import ChartGenerator from '../../components/common/ChartGenerator';

const TYPE_OPTIONS = ['Weight', 'Body Fat', 'Adherence'];
const DURATION_OPTIONS = ['Daily', 'Weekly', 'Monthly'];

const METRIC_INFO: Record<string, { unit: string; description: string }> = {
  'Weight':     { unit: 'kg',  description: 'Track your weight changes over time' },
  'Body Fat':   { unit: '%',   description: 'Monitor your body fat percentage progress' },
  'Adherence':  { unit: '%',   description: 'See how well you followed your meal plans' },
};

const DURATION_INFO: Record<string, { label: string; description: string }> = {
  'Daily':    { label: '1D',  description: 'View your results for each individual day' },
  'Weekly':   { label: '7D',  description: 'See weekly averages and trends over time' },
  'Monthly':  { label: '30D', description: 'See monthly averages and trends over time' },
};

function SkeletonBar({ height, shimmer }: { height: string; shimmer: Animated.Value }) {
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  return (
    <View style={skeletonStyles.barWrapper}>
      <Animated.View style={[skeletonStyles.skeletonBar, { height: height as any, opacity }]} />
    </View>
  );
}

export default function Progress() {
  const [selectedType, setSelectedType] = useState('Weight');
  const [selectedDuration, setSelectedDuration] = useState('Weekly');

  const { user } = useAuth();
  const { chartData, loading, error, hasGenerated, fetchChartData } = useChart();
  const [windowData, setWindowData] = useState<ChartDataPoint[]>([]);

  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const info = METRIC_INFO[selectedType];
  const durationInfo = DURATION_INFO[selectedDuration];

  const handleGenerate = () => {
    if (user?.user_id) {
      fetchChartData(user.user_id, selectedType, selectedDuration);
    }
  };

  const hasData = hasGenerated && !loading && chartData.length > 0;
  const showSkeleton = !hasGenerated || loading;

  const hasWindow = windowData.length > 0;
  const avg = hasWindow ? windowData.reduce((s, d) => s + d.value, 0) / windowData.length : null;
  const min = hasWindow ? Math.min(...windowData.map(d => d.value)) : null;
  const max = hasWindow ? Math.max(...windowData.map(d => d.value)) : null;

  const allTimeMin = hasData ? Math.min(...chartData.map(d => d.value)) : null;
  const allTimeMax = hasData ? Math.max(...chartData.map(d => d.value)) : null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* Controls Card */}
      <View style={styles.card}>
        <View style={styles.sectionBlock}>
          <Text style={styles.label}>Metric</Text>
          <View style={styles.pillRow}>
            {TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.pill, selectedType === option && styles.pillActive]}
                onPress={() => setSelectedType(option)}
              >
                <Text style={[styles.pillText, selectedType === option && styles.pillTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={[styles.sectionBlock, { marginBottom: 0 }]}>
          <Text style={styles.label}>Duration</Text>
          <View style={styles.pillRow}>
            {DURATION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.pill, selectedDuration === option && styles.pillActive]}
                onPress={() => setSelectedDuration(option)}
              >
                <Text style={[styles.pillText, selectedDuration === option && styles.pillTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Metric Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoUnit}>{info.unit}</Text>
        <Text style={styles.infoDesc}>{info.description}</Text>
      </View>

      {/* Duration Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoUnit}>{durationInfo.label}</Text>
        <Text style={styles.infoDesc}>{durationInfo.description}</Text>
      </View>

      {/* Generate Button */}
      <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
        <Text style={styles.generateBtnText}>
          {loading ? 'Loading...' : 'Generate Report'}
        </Text>
      </TouchableOpacity>

      {/* Chart Card */}
      <View style={styles.card}>
        <View style={styles.chartHeaderRow}>
          <Text style={styles.label}>Chart</Text>
          {!hasData && (
            <View style={styles.emptyBadge}>
              <Text style={styles.emptyBadgeText}>
                {hasGenerated && !loading ? 'No data' : 'No data yet'}
              </Text>
            </View>
          )}
        </View>

        {/* Error state */}
        {error && !loading && (
          <View style={styles.hintBox}>
            <Text style={[styles.hintText, { color: '#EF4444' }]}>{error}</Text>
          </View>
        )}

        {/* Pre-generate hint */}
        {!hasGenerated && !loading && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              Select a metric and duration above, then tap{' '}
              <Text style={styles.hintBold}>Generate Report</Text> to see your chart.
            </Text>
          </View>
        )}

        {/* Skeleton — shown before first generate or while loading */}
        {showSkeleton && (
          <>
            <View style={skeletonStyles.chartArea}>
              <View style={skeletonStyles.yAxis}>
                {[...Array(5)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={[skeletonStyles.skeletonYLabel, { opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }) }]}
                  />
                ))}
              </View>
              <View style={skeletonStyles.chartBody}>
                <View style={skeletonStyles.barsRow}>
                  {['65%', '80%', '50%', '90%', '70%', '85%', '60%'].map((height, i) => (
                    <SkeletonBar key={i} height={height} shimmer={shimmer} />
                  ))}
                </View>
              </View>
            </View>
            <View style={skeletonStyles.xAxisRow}>
              {[...Array(7)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[skeletonStyles.skeletonXLabel, { opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }) }]}
                />
              ))}
            </View>
          </>
        )}

        {/* Real Chart */}
        {hasGenerated && !loading && (
          <ChartGenerator
            data={chartData}
            unit={info.unit}
            metric={selectedType}
            duration={selectedDuration}
            onWindowChange={setWindowData}
          />
        )}
      </View>

      {/* Current View Stats */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Avg', value: avg },
          { label: 'Min', value: min },
          { label: 'Max', value: max },
        ].map(({ label, value }) => (
          <View key={label} style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            {value !== null ? (
              <Text style={styles.statValue}>{value.toFixed(1)}</Text>
            ) : (
              <Animated.View style={[styles.statValueSkeleton, { opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }]} />
            )}
          </View>
        ))}
      </View>

      {/* All-Time Stats */}
      <View style={styles.card}>
        <Text style={styles.label}>All Time</Text>
        <View style={styles.allTimeRow}>
          <View style={styles.allTimeItem}>
            <Text style={styles.allTimeLabel}>Lowest</Text>
            {allTimeMin !== null ? (
              <Text style={styles.allTimeValue}>{allTimeMin.toFixed(1)} {info.unit}</Text>
            ) : (
              <Animated.View style={[styles.statValueSkeleton, { opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }]} />
            )}
          </View>
          <View style={styles.allTimeDivider} />
          <View style={styles.allTimeItem}>
            <Text style={styles.allTimeLabel}>Highest</Text>
            {allTimeMax !== null ? (
              <Text style={styles.allTimeValue}>{allTimeMax.toFixed(1)} {info.unit}</Text>
            ) : (
              <Animated.View style={[styles.statValueSkeleton, { opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] }) }]} />
            )}
          </View>
        </View>
      </View>

    </ScrollView>
  );
}
