import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { mealCardModalStyles as styles } from '../../styles/screens/MealCardModalStyles';

interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  canChange?: boolean; // For storing if the item can be changed or not (Alternative checking)
  isFollowed?: boolean | null; // For storing if the item is followed or not (Feedback checking)
  isLLM?: boolean | null; // For storing if the item is suggested by LLM
  changedItem?: MealItem | null; // For storing the alternative item if any
}

interface MealDetailModalProps {
  visible: boolean;
  onClose: () => void;
  mealName: string;
  timeRange: string;
  totalCalories: number;
  totalProtein: number;
  totalCarb: number;
  totalFat: number;
  items: MealItem[];
  isCompleted: boolean; // General meal level completion status
  canChange: boolean; // General meal level change permission
}

export default function MealDetailModal({
  visible,
  onClose,
  mealName,
  timeRange,
  totalCalories,
  totalProtein,
  totalCarb,
  totalFat,
  items,
  isCompleted,
  canChange,
}: MealDetailModalProps) {
  
  const changeableItems = items.filter(item => item.canChange);
  const allItemsChangeable = items.length > 0 && changeableItems.length === items.length;
  const someItemsChangeable = changeableItems.length > 0 && changeableItems.length < items.length;
  const noItemsChangeable = changeableItems.length === 0;

const getFeedbackStatus = (
  isFollowed: boolean | null | undefined, 
  isLLM: boolean | null | undefined, 
  changedItem: MealItem | null | undefined
) => {
  // Henüz feedback verilmedi
  if (isFollowed === null || isFollowed === undefined) {
    return { text: '⏳ Pending', color: '#FF9800' };
  }
  
  // Yemek yenildi (takip edildi)
  else if (isFollowed === true) {
    return { text: '✓ Followed', color: '#4CAF50' };
  }
  
  // Yemek yenilmedi ama AI ile değiştirildi
  else if (isFollowed === false && isLLM === true) {
    return { text: '⚠️ Modified with AI', color: '#FF5722' };
  }
  
  // Yemek yenilmedi ama alternatif alındı
  else if (isFollowed === false && (changedItem !== null || changedItem !== undefined) && isLLM === false) {
    return { text: '⚠️ Changed Manually', color: '#9C27B0' };
  }
  
  // Yemek hiç yenilmedi (takip edilmedi)
  else if (isFollowed === false) {
    return { text: '✗ Not Followed', color: '#F44336' };
  }
  
  // Default durum
  return { text: '⏳ Pending', color: '#FF9800' };
};

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{mealName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Time Range */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>{timeRange}</Text>
            </View>

            {/* Total Calories */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Total Calories:</Text>
              <Text style={styles.value}>{totalCalories} kcal</Text>
            </View>

            {/* Total Macros */}
            <View style={styles.totalMacroBox}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{totalProtein}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Carbohydrate</Text>
                <Text style={styles.macroValue}>{totalCarb}g</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Fat</Text>
                <Text style={styles.macroValue}>{totalFat}g</Text>
              </View>
            </View>

            {/* General status of meal */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, isCompleted ? styles.completed : styles.pending]}>
                {isCompleted ? 'Completed' : '⏳ Waiting'}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Meal Items Detail */}
            <Text style={styles.sectionTitle}>Food Details ({items.length} items)</Text>
            {items.map((item, index) => {
              const feedbackStatus = getFeedbackStatus(item.isFollowed, item.isLLM, item.changedItem);
              
              return (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      
                      {/* Alternative badge */}
                      {item.canChange && (
                        <View style={styles.changeableBadge}>
                          <Text style={styles.changeableBadgeText}>🔄</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.itemCalories}>{item.calories} kcal</Text>
                  </View>
                  
                  <Text style={styles.itemPortion}>{item.portion}</Text>
                  
                  {/* Feedback status badge */}
                  <View style={[styles.feedbackBadge, { backgroundColor: feedbackStatus.color + '20' }]}>
                    <Text style={[styles.feedbackBadgeText, { color: feedbackStatus.color }]}>
                      {feedbackStatus.text}
                    </Text>
                  </View>
                  
                  {/* Macro indicators */}
                  <View style={styles.macroRow}>
                    <Text style={styles.macroText}>P: {item.protein}g</Text>
                    <Text style={styles.macroText}>C: {item.carb}g</Text>
                    <Text style={styles.macroText}>F: {item.fat}g</Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.divider} />

            {/* Feedback Durumu */}
            <Text style={styles.sectionTitle}>Feedback Status</Text>
            {isCompleted ? (
              <Text style={styles.feedbackText}>Feedback is given</Text>
            ) : (
              <Text style={styles.warningText}>⚠️ Feedback not given yet</Text>
            )}

            <View style={styles.divider} />

            {/* AI Tavsiye Alanı */}
            <Text style={styles.sectionTitle}>Alternative Status</Text>
            
            {allItemsChangeable ? (
              <View style={styles.aiBox}>
                <Text style={styles.aiText}>
                  💡 You can get alternatives for all foods in this meal. Your dietitian has given permission.
                </Text>
              </View>
            ) : someItemsChangeable ? (
              <View style={styles.aiBox}>
                <Text style={styles.aiText}>
                  💡 You can get alternatives for the following foods:{'\n'}
                  {changeableItems.map((item, idx) => (
                    `• ${item.name}${idx < changeableItems.length - 1 ? '\n' : ''}`
                  )).join('')}
                </Text>
              </View>
            ) : (
              <View style={styles.aiBoxWarning}>
                <Text style={styles.aiTextWarning}>
                  ⚠️ You cannot get alternatives for any foods in this meal. Your dietitian has not given permission.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.feedbackBtn, isCompleted && styles.disabledBtn]}
                disabled={isCompleted}
              >
                <Text style={styles.feedbackBtnText}>
                  {isCompleted ? 'Feedback is given' : 'Give Feedback'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.altBtn, noItemsChangeable && styles.disabledBtn]}
                disabled={noItemsChangeable}
              >
                <Text style={styles.altBtnText}>
                  {noItemsChangeable ? 'No Permission' : 'Get Alternative'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}