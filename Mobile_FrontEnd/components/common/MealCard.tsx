import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MealItem {
  name: string;
  portion: string;
  calories: number;
}

interface MealCardProps {
  mealType: string;
  timeRange: string;
  totalCalories: number;
  items: MealItem[];
  isCompleted?: boolean;
  onPress?: () => void;
}

export default function MealCard({
  mealType,
  timeRange,
  totalCalories,
  items,
  isCompleted = false,
  onPress,
}: MealCardProps) {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mealTitle}>
          {mealType} ({timeRange})
        </Text>
        <View style={styles.caloriesBox}>
          <Text style={styles.caloriesText}>{totalCalories}</Text>
          {isCompleted ? (
            <Text style={styles.checkmark}>✓</Text>
          ) : (
            <Text style={styles.questionMark}>?</Text>
          )}
        </View>
      </View>

      {/* Ayırıcı Çizgi */}
      <View style={styles.divider} />

      {/* Meal Items */}
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPortion}>{item.portion}</Text>
          </View>
          <Text style={styles.itemCalories}>{item.calories}</Text>
        </View>
      ))}

      {/* Click for Details Button - En Altta */}
      <View style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>Click for Details</Text>
        <Text style={styles.detailsIcon}>📋</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  caloriesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  caloriesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
    marginLeft: 6,
  },
  questionMark: {
    fontSize: 18,
    color: '#FF9800',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  itemPortion: {
    fontSize: 13,
    color: '#666',
  },
  itemCalories: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  detailsIcon: {
    fontSize: 16,
  },
});