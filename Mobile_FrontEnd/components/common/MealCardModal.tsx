import { Modal, View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { mealCardModalStyles as styles } from '../../styles/screens/MealCardModalStyles';
import FeedbackModal from './FeedbackModal';
import { useItems } from "@/context/ItemContext";
import { MealItem, useMeals } from '@/context/MealsContext';

interface MealDetailModalProps {
  visible: boolean;
  onClose: () => void;
  mealName: string;
  mealID: string;
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
  mealID,
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

  const [expandedItemID, setExpandedItemID] = useState<string | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmResult, setLlmResult] = useState<any | null>(null);

  const [aiTryCount, setAiTryCount] = useState<Record<string, number>>({});
  const [acceptedAIItems, setAcceptedAIItems] = useState<Record<string, {
    originalName: string;
    aiItem: {
      name: string;
      portion: string;
      calories: number;
      protein: number;
      carb: number;
      fat: number;
    };
  }>>({});

  const { items: availableItems, loading } = useItems();
  const { refreshMealPlan } = useMeals(); // ✅ MealsContext'ten refresh fonksiyonunu al

  const mockLLMAlternative = {
    name: "Cottage Cheese",
    portion: "180g",
    calories: 120,
    protein: 18,
    carb: 6,
    fat: 3,
  };

  const getFeedbackStatus = (
    isFollowed: boolean | null | undefined, 
    isLLM: boolean | null | undefined, 
    changedItem: string | null
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
    
    else if (isFollowed === false && changedItem != null && isLLM === false) {
      return { text: '⚠️ Changed Manually', color: '#9C27B0' };
    }
    
    else if (isFollowed === false) {
      return { text: '✗ Not Followed', color: '#F44336' };
    }
    
    return { text: '⏳ Pending', color: '#FF9800' };
  };

  const handleGetAlternative = (item: MealItem) => {
    const currentTry = aiTryCount[item.itemID!] || 0;
    if (currentTry >= 3) {
      Alert.alert(
        "Limit reached",
        "You can request AI alternative maximum 3 times."
      );
      return;
    }
    if (expandedItemID === item.itemID) {
      setExpandedItemID(null);
      setLlmResult(null);
      return;
    }

    setAiTryCount(prev => ({
      ...prev,
      [item.itemID!]: currentTry + 1,
    }));

    setExpandedItemID(item.itemID!);
    setLlmLoading(true);
    setLlmResult(null);

    // Fake LLM API call delay
    setTimeout(() => {
      setLlmResult(mockLLMAlternative);
      setLlmLoading(false);
    }, 1500);
  };

  const handleAcceptAI = (item: MealItem) => {
    if (!llmResult) return;

    setAcceptedAIItems(prev => ({
      ...prev,
      [item.itemID!]: {
        originalName: item.name,
        aiItem: llmResult,
      },
    }));

    setExpandedItemID(null);
    setLlmResult(null);
  };

  const handleCancelAI = () => {
    setExpandedItemID(null);
    setLlmResult(null);
  };

  const handleRegenerateAI = (item: MealItem) => {
    const currentTry = aiTryCount[item.itemID!] || 0;

    if (currentTry >= 3) {
      Alert.alert(
        "Limit reached",
        "You can request AI alternative maximum 3 times."
      );
      return;
    }

    setAiTryCount(prev => ({
      ...prev,
      [item.itemID!]: currentTry + 1,
    }));

    setLlmLoading(true);
    setLlmResult(null);

    setTimeout(() => {
      setLlmResult({
        ...mockLLMAlternative,
        calories: mockLLMAlternative.calories + Math.floor(Math.random() * 30),
      });
      setLlmLoading(false);
    }, 1200);
  };

  const handleItemFeedbackPress = (item: MealItem) => {
    if (item.isFollowed !== null && item.isFollowed !== undefined) {
      Alert.alert('Info', 'Feedback has already been given for this item');
      return;
    }
    setSelectedFeedbackItem(item);
    setFeedbackModalVisible(true);
  };

  const handleSubmitFeedback = async (feedback: {
    itemID: string;
    isFollowed: boolean;
    changedItems?: Array<{
      itemName: string;
      portion: number;
    }> | null;
  }) => {
    try {
      // Format changed_item as: "Name - portionG, Name2 - portionG" (Database format)
      let changed_item_string = null;
      
      if (feedback.changedItems && feedback.changedItems.length > 0) {
        changed_item_string = feedback.changedItems
          .map(item => `${item.itemName} - ${item.portion}g`)
          .join(', ');
      }
      
      const feedbackData = {
        client_id: selectedFeedbackItem?.clientID,
        meal_id: selectedFeedbackItem?.mealID,
        item_id: feedback.itemID,
        is_followed: feedback.isFollowed,
        changed_item: changed_item_string
      };
      
      console.log('Sending feedback to backend:', feedbackData);

      const response = await fetch('http://10.0.2.2:5000/api/dietitian/client_feedback', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Feedback saved successfully:', result);
        
        // ✅ Feedback başarılı olduktan sonra meal plan'ı yeniden yükle
        await refreshMealPlan();
        
        Alert.alert('Success', 'Feedback saved successfully!');
        
        setFeedbackModalVisible(false);
        setSelectedFeedbackItem(null);
        
        onClose();
      } else {
        console.error('Error response:', result);
        Alert.alert('Error', result.error || 'Failed to save feedback');
      }
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to connect to server');
    }
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
              
              // ✅ Parse changedItem string: "name,portion,calories,protein,carb,fat;name2,..."
              const changedItems: Array<{
                name: string;
                portion: string;
                calories: number;
                protein: number;
                carb: number;
                fat: number;
              }> = [];
              
              if (item.changedItem) {
                const itemsArray = item.changedItem.split(';');
                itemsArray.forEach((itemStr: string) => {
                  const parts = itemStr.split(',');
                  if (parts.length === 6) {
                    changedItems.push({
                      name: parts[0].trim(),
                      portion: `${parts[1].trim()}g`,
                      calories: parseFloat(parts[2]),
                      protein: parseFloat(parts[3]),
                      carb: parseFloat(parts[4]),
                      fat: parseFloat(parts[5])
                    });
                  }
                });
              }
              
              const hasChangedItem = changedItems.length > 0;

              const acceptedAI = acceptedAIItems[item.itemID!];
              const displayedItem = acceptedAI
                ? {
                    ...item,
                    name: acceptedAI.aiItem.name,
                    portion: acceptedAI.aiItem.portion,
                    calories: acceptedAI.aiItem.calories,
                    protein: acceptedAI.aiItem.protein,
                    carb: acceptedAI.aiItem.carb,
                    fat: acceptedAI.aiItem.fat,
                  }
                : item;
              
              return (
                <View key={index} style={styles.itemCard}>
                  {/* ✅ Eski item (üstü çizili) */}
                  {hasChangedItem && (
                    <View style={{ opacity: 0.5, marginBottom: 8 }}>
                      <View style={styles.itemHeader}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={[styles.itemName, { textDecorationLine: 'line-through' }]}>
                            {item.name}
                          </Text>
                        </View>
                        <Text style={[styles.itemCalories, { textDecorationLine: 'line-through' }]}>
                          {item.calories} kcal
                        </Text>
                      </View>
                      
                      <Text style={[styles.itemPortion, { textDecorationLine: 'line-through' }]}>
                        {item.portion}
                      </Text>
                      
                      <View style={styles.macroRow}>
                        <Text style={[styles.macroText, { textDecorationLine: 'line-through' }]}>
                          P: {item.protein}g
                        </Text>
                        <Text style={[styles.macroText, { textDecorationLine: 'line-through' }]}>
                          C: {item.carb}g
                        </Text>
                        <Text style={[styles.macroText, { textDecorationLine: 'line-through' }]}>
                          F: {item.fat}g
                        </Text>
                      </View>
                    </View>
                  )}

                  {/*  Changed new itmes*/}
                  {hasChangedItem ? (
                    changedItems.map((changedItem, idx) => (
                      <View key={`changed-${idx}`} style={{ marginBottom: idx < changedItems.length - 1 ? 8 : 0 }}>
                        <View style={styles.itemHeader}>
                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Text style={[styles.itemName, { color: '#4CAF50', fontWeight: 'bold' }]}>
                              ✓ {changedItem.name}
                            </Text>
                            {item.canChange && (
                              <View style={styles.changeableBadge}>
                                <Text style={styles.changeableBadgeText}>🔄</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.itemCalories, { color: '#4CAF50' }]}>
                            {changedItem.calories} kcal
                          </Text>
                        </View>
                        
                        <Text style={[styles.itemPortion, { color: '#4CAF50' }]}>
                          {changedItem.portion}
                        </Text>
                        
                        <View style={styles.macroRow}>
                          <Text style={[styles.macroText, { color: '#4CAF50' }]}>
                            P: {changedItem.protein}g
                          </Text>
                          <Text style={[styles.macroText, { color: '#4CAF50' }]}>
                            C: {changedItem.carb}g
                          </Text>
                          <Text style={[styles.macroText, { color: '#4CAF50' }]}>
                            F: {changedItem.fat}g
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <>
                      <View style={styles.itemHeader}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                          {acceptedAI ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text style={[styles.itemName, { color: '#E53935', marginRight: 6 }]}>
                                {acceptedAI.originalName}
                              </Text>
                              <Text style={[styles.itemName, { color: '#2E7D32' }]}>
                                {displayedItem.name}
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.itemName}>{item.name}</Text>
                          )}
                          
                          {item.canChange && (
                            <View style={styles.changeableBadge}>
                              <Text style={styles.changeableBadgeText}>🔄</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.itemCalories}>{displayedItem.calories} kcal</Text>
                      </View>
                      
                      <Text style={styles.itemPortion}>{displayedItem.portion}</Text>
                      
                      <View style={styles.macroRow}>
                        <Text style={styles.macroText}>P: {displayedItem.protein}g</Text>
                        <Text style={styles.macroText}>C: {displayedItem.carb}g</Text>
                        <Text style={styles.macroText}>F: {displayedItem.fat}g</Text>
                      </View>
                    </>
                  )}
                  
                  <View style={[styles.feedbackBadge, { backgroundColor: feedbackStatus.color + '20' }]}>
                    <Text style={[styles.feedbackBadgeText, { color: feedbackStatus.color }]}>
                      {feedbackStatus.text}
                    </Text>
                  </View>

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
                          onPress={() => handleGetAlternative(item)} 
                        >
                          <Text style={styles.itemAlternativeBtnText}>Get Alternative</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {expandedItemID === item.itemID && (
                    <View style={styles.llmContainer}>
                      {llmLoading ? (
                        <View style={styles.llmLoading}>
                          <ActivityIndicator size="small" color="#6C63FF" />
                          <Text style={styles.llmLoadingText}>
                            AI is generating alternative...
                          </Text>
                        </View>
                      ) : llmResult && (
                        <View style={styles.llmResultCard}>
                          <Text style={styles.llmTitle}>Alternative Suggestion</Text>
                          <Text style={styles.llmItemName}>{llmResult.name}</Text>
                          <Text style={styles.llmPortion}>
                            {llmResult.portion} · {llmResult.calories} kcal
                          </Text>
                          <View style={styles.macroRow}>
                            <Text>P: {llmResult.protein}g</Text>
                            <Text>C: {llmResult.carb}g</Text>
                            <Text>F: {llmResult.fat}g</Text>
                          </View>
                          <View style={{ flexDirection: "row", marginTop: 12, justifyContent: 'space-between', gap: 10 }}>
                            <TouchableOpacity
                              style={[styles.itemAlternativeBtn, {flex: 1}]}
                              onPress={() => handleRegenerateAI(item)}
                            >
                              <Text style={styles.itemAlternativeBtnText}>
                                Generate({3 - (aiTryCount[item.itemID!] || 0)})
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.itemFeedbackBtn, { flex: 1 }]}
                              onPress={() => handleAcceptAI(item)}
                            >
                              <Text style={styles.itemFeedbackBtnText}>Accept</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.itemAlternativeBtn, { flex: 1 }]}
                              onPress={handleCancelAI}
                            >
                              <Text style={styles.itemAlternativeBtnText}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Feedback Status</Text>
            {isCompleted ? (
              <Text style={styles.feedbackText}>✓ Feedback is given</Text>
            ) : (
              <Text style={styles.warningText}>⚠️ Feedback not given yet</Text>
            )}

            <View style={styles.divider} />

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
          </ScrollView>
        </View>
      </View>

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