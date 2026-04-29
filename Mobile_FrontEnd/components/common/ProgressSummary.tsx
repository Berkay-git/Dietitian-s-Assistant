import { View, Text, StyleSheet, Platform } from 'react-native';

interface Meal {
  mealName: string;
  isCompleted: boolean;
}

interface Props {
  meals: Meal[];
}

export default function ProgressSummary({ meals }: Props) {
  const total = meals.length;
  const completed = meals.filter(m => m.isCompleted).length;
  const percent = total > 0 ? completed / total : 0;
  const allDone = completed === total && total > 0;

  const statusText = allDone
    ? 'Great job! All meals reviewed.'
    : `${total - completed} meal${total - completed > 1 ? 's' : ''} still need your feedback.`;

  return (
    <View style={styles.safeArea}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Text style={styles.title}>Daily Feedback</Text>
          <Text style={[styles.count, allDone && styles.countDone]}>
            {completed}/{total}
          </Text>
        </View>

        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${percent * 100}%`, backgroundColor: allDone ? '#22C55E' : '#007AFF' }]} />
        </View>

        <Text style={[styles.statusText, allDone && styles.statusDone]}>{statusText}</Text>

        <View style={styles.mealRow}>
          {meals.map((meal, i) => (
            <View key={i} style={[styles.mealChip, meal.isCompleted && styles.mealChipDone]}>
              <Text style={[styles.mealIcon, meal.isCompleted && styles.mealIconDone]}>
                {meal.isCompleted ? '✔' : '?'}
              </Text>
              <Text style={[styles.mealLabel, meal.isCompleted && styles.mealLabelDone]}>
                {meal.mealName}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'android' ? 36 : 50,
    backgroundColor: '#F5F7FA',
  },
  card: {
    backgroundColor: '#1A1A2E',
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  countDone: {
    color: '#4ADE80',
  },
  barBg: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mealChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#2D2D44',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  mealChipDone: {
    backgroundColor: '#14532D',
  },
  mealIcon: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  mealIconDone: {
    color: '#4ADE80',
  },
  mealLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  mealLabelDone: {
    color: '#4ADE80',
    fontWeight: '600',
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusDone: {
    color: '#4ADE80',
  },
});