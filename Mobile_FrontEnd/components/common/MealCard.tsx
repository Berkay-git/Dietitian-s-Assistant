import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/screens/MealCardStyles';
import { gramsToExchange } from './ExchangeMap';

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

  const formatTime = (range: string) => {
    if (!range) return "";

    if (range.includes("-")) {
      const [startRaw, endRaw] = range.split("-").map(s => s.trim());
      const start = startRaw.slice(0, 5);
      const end = (endRaw ?? "").slice(0, 5);
      return `${start} - ${end}`;
    }

    return range.slice(0, 5);
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mealTitle}>
          {mealType} ({formatTime(timeRange)})
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
            <Text style={styles.itemPortion}>{gramsToExchange(item.name, item.portion)}</Text>
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
