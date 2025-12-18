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
  onPress?: () => void; // Tıklama eventi
  onGetAlternative?: () => void;
  onGiveFeedback?: () => void;
}

export default function MealCard({
  mealType,
  timeRange,
  totalCalories,
  items,
  isCompleted = false,
  onPress,
  onGetAlternative,
  onGiveFeedback,
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

      {/* Meal Items - Dinamik yükseklik */}
      {items.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPortion}>{item.portion}</Text>
          </View>
          <Text style={styles.itemCalories}>{item.calories}</Text>
        </View>
      ))}

      {/* Detay için dokun */}
      <Text style={styles.tapHint}>Detaylar için dokun 👆</Text>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        {onGiveFeedback && (
          <TouchableOpacity 
            style={styles.feedbackBtn} 
            onPress={(e) => {
              e.stopPropagation(); // Card'ın onPress'ini engelle
              onGiveFeedback();
            }}
          >
            <Text style={styles.feedbackBtnText}>Give Feedback</Text>
          </TouchableOpacity>
        )}
        {onGetAlternative && (
          <TouchableOpacity 
            style={styles.altBtn} 
            onPress={(e) => {
              e.stopPropagation();
              onGetAlternative();
            }}
          >
            <Text style={styles.altBtnText}>Get an alternative</Text>
          </TouchableOpacity>
        )}
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
  tapHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  feedbackBtn: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  feedbackBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  altBtn: {
    backgroundColor: '#7B61FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
  },
  altBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});