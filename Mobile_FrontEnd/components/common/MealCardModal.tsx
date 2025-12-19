import { Modal, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { mealCardModalStyles as styles } from '../../styles/screens/MealCardModalStyles';
import FeedbackModal from './FeedbackModal';

interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carb: number;
  fat: number;
  canChange?: boolean;
  isFollowed?: boolean | null;
  isLLM?: boolean | null;
  changedItem?: {
    itemID: string;
    itemName: string;
    portion: number;
  } | null;
  itemID?: string;
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
  isCompleted: boolean;
  canChange: boolean;
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
  
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<MealItem | null>(null);
  
  const changeableItems = items.filter(item => item.canChange);
  const allItemsChangeable = items.length > 0 && changeableItems.length === items.length;
  const someItemsChangeable = changeableItems.length > 0 && changeableItems.length < items.length;
  const noItemsChangeable = changeableItems.length === 0;

  // Mock data - Backend'den gelecek
  const availableItems = [
    { itemID: '1', itemName: 'Grilled Chicken' },
    { itemID: '2', itemName: 'Brown Rice' },
    { itemID: '3', itemName: 'Steamed Broccoli' },
    { itemID: '4', itemName: 'Greek Yogurt' },
    { itemID: '5', itemName: 'Mixed Nuts' },
  ];

  const getFeedbackStatus = (
    isFollowed: boolean | null | undefined, 
    isLLM: boolean | null | undefined, 
    changedItem: MealItem['changedItem']
  ) => {
    if (isFollowed === null || isFollowed === undefined) {
      return { text: '⏳ Pending', color: '#FF9800' };
    }
    
    else if (isFollowed === true) {
      return { text: '✓ Followed', color: '#4CAF50' };
    }
    
    else if (isFollowed === false && canChange && changedItem != null  && isLLM === true) {
      return { text: '⚠️ Modified with AI', color: '#FF5722' };
    }
    
    else if (isFollowed === false && canChange && changedItem != null && isLLM === false) {
      return { text: '⚠️ Changed Manually', color: '#9C27B0' };
    }
    
    else if (isFollowed === false) {
      return { text: '✗ Not Followed', color: '#F44336' };
    }
    
    return { text: '⏳ Pending', color: '#FF9800' };
  };

  const handleItemFeedbackPress = (item: MealItem) => {
    if (item.isFollowed !== null && item.isFollowed !== undefined) {
      Alert.alert('Info', 'Feedback has already been given for this item');
      return;
    }
    setSelectedFeedbackItem(item);
    setFeedbackModalVisible(true);
  };

  const handleSubmitFeedback = (feedback: {
    itemID: string;
    isFollowed: boolean;
    changedItems?: Array<{
      itemID: string;
      itemName: string;
      portion: number;
    }> | null;
    isLLM: boolean;
  }) => {
    console.log('Feedback submitted:', feedback);
    // TODO: Call backend API
    Alert.alert('Success', 'Feedback saved successfully!');
    
    setFeedbackModalVisible(false);
    setSelectedFeedbackItem(null);
  };

  // FeedbackModal render
  {selectedFeedbackItem && (
    <FeedbackModal
      visible={feedbackModalVisible}
      onClose={() => {
        setFeedbackModalVisible(false);
        setSelectedFeedbackItem(null);
      }}
      item={selectedFeedbackItem}
      mealName={mealName}
      availableItems={availableItems}
      onSubmitFeedback={handleSubmitFeedback}
    />
  )}

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

                  {/* Individual Item Action Buttons - Feedback verilmemişse göster */}
                  {(item.isFollowed === null || item.isFollowed === undefined) && (
                    <View style={styles.itemActionButtons}>
                      <TouchableOpacity
                        style={styles.itemFeedbackBtn}
                        onPress={() => handleItemFeedbackPress(item)}
                      >
                        <Text style={styles.itemFeedbackBtnText}>Give Feedback</Text>
                      </TouchableOpacity>
                      
                      {item.canChange && (
                        <TouchableOpacity
                          style={styles.itemAlternativeBtn}
                          onPress={() => {
                            // TODO: Handle get alternative
                            Alert.alert('Info', 'Get Alternative functionality coming soon');
                          }}
                        >
                          <Text style={styles.itemAlternativeBtnText}>Get Alternative</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            <View style={styles.divider} />

            {/* Feedback Durumu */}
            <Text style={styles.sectionTitle}>Feedback Status</Text>
            {isCompleted ? (
              <Text style={styles.feedbackText}>✓ Feedback is given</Text>
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

            {/* ❌ ALT BUTONLAR KALDIRILDI */}

          </ScrollView>
        </View>
      </View>

      {/* Feedback Modal */}
      {selectedFeedbackItem && (
        <FeedbackModal
          visible={feedbackModalVisible}
          onClose={() => {
            setFeedbackModalVisible(false);
            setSelectedFeedbackItem(null);
          }}
          item={selectedFeedbackItem}
          mealName={mealName}
          availableItems={availableItems}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}
    </Modal>
  );
}