import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { feedbackModalStyles as styles } from '../../styles/screens/FeedbackModalStyles';

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

interface ChangedFoodItem {
  itemID: string;
  itemName: string;
  portion: number;
}

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  item: MealItem;
  mealName: string;
  availableItems: { itemID: string; itemName: string }[];
  onSubmitFeedback: (feedback: {
    itemID: string;
    isFollowed: boolean;
    changedItems?: ChangedFoodItem[] | null;
    isLLM: boolean;
  }) => void;
}

export default function FeedbackModal({
  visible,
  onClose,
  item,
  mealName,
  availableItems,
  onSubmitFeedback,
}: FeedbackModalProps) {
  const [isFollowed, setIsFollowed] = useState<boolean | null>(null);
  const [showChangeSection, setShowChangeSection] = useState(false);
  
  // For adding items
  const [selectedItemID, setSelectedItemID] = useState<string>('');
  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [portion, setPortion] = useState<string>('');
  
  // List of changed items
  const [changedItemsList, setChangedItemsList] = useState<ChangedFoodItem[]>([]);

  useEffect(() => {
    if (visible) {
      setIsFollowed(null);
      setShowChangeSection(false);
      setSelectedItemID('');
      setSelectedItemName('');
      setPortion('');
      setChangedItemsList([]);
    }
  }, [visible]);

  const handleFollowedPress = (followed: boolean) => {
    setIsFollowed(followed);
    
    if (!followed) {
      setShowChangeSection(true);
    } else {
      setShowChangeSection(false);
      setSelectedItemID('');
      setSelectedItemName('');
      setPortion('');
      setChangedItemsList([]);
    }
  };

  const handleItemSelection = (itemId: string) => {
    setSelectedItemID(itemId);
    const selectedItem = availableItems.find(i => i.itemID === itemId);
    if (selectedItem) {
      setSelectedItemName(selectedItem.itemName);
    }
  };

  const handleAddItem = () => {
    if (!selectedItemID || !selectedItemName) {
      Alert.alert('Error', 'Please select a food item');
      return;
    }

    if (!portion.trim()) {
      Alert.alert('Error', 'Please enter portion amount');
      return;
    }

    const portionNum = parseFloat(portion);
    if (isNaN(portionNum) || portionNum <= 0) {
      Alert.alert('Error', 'Please enter a valid portion amount (grams)');
      return;
    }

    // Check if item already exists
    const existingItem = changedItemsList.find(i => i.itemID === selectedItemID);
    if (existingItem) {
      Alert.alert('Info', 'This item is already added. Remove it first to add again.');
      return;
    }

    // Add to list
    const newItem: ChangedFoodItem = {
      itemID: selectedItemID,
      itemName: selectedItemName,
      portion: portionNum,
    };

    setChangedItemsList([...changedItemsList, newItem]);
    
    // Reset fields
    setSelectedItemID('');
    setSelectedItemName('');
    setPortion('');
  };

  const handleRemoveItem = (itemID: string) => {
    setChangedItemsList(changedItemsList.filter(i => i.itemID !== itemID));
  };

  const handlePortionChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    setPortion(numericText);
  };

  const handleSubmit = () => {
    if (isFollowed === null) {
      Alert.alert('Error', 'Please select if you followed the meal plan or not');
      return;
    }

    // If followed, submit directly
    if (isFollowed) {
      onSubmitFeedback({
        itemID: item.itemID!,
        isFollowed: true,
        isLLM: false,
      });
      onClose();
      return;
    }

    // If not followed and no items added, submit with null
    if (!isFollowed && changedItemsList.length === 0) {
      onSubmitFeedback({
        itemID: item.itemID!,
        isFollowed: false,
        changedItems: null,
        isLLM: false,
      });
      onClose();
      return;
    }

    // If not followed and items added, submit with list
    if (!isFollowed && changedItemsList.length > 0) {
      onSubmitFeedback({
        itemID: item.itemID!,
        isFollowed: false,
        changedItems: changedItemsList,
        isLLM: false,
      });
      onClose();
      return;
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
          <View style={styles.header}>
            <Text style={styles.title}>Give Feedback</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.mealInfoBox}>
              <Text style={styles.mealName}>{mealName}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPortion}>{item.portion}</Text>
              <Text style={styles.itemCalories}>{item.calories} kcal</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.questionText}>
              Did you follow this food item in your meal plan?
            </Text>

            <View style={styles.yesNoContainer}>
              <TouchableOpacity
                style={[
                  styles.yesNoBtn,
                  isFollowed === true && styles.yesBtn,
                ]}
                onPress={() => handleFollowedPress(true)}
              >
                <Text
                  style={[
                    styles.yesNoText,
                    isFollowed === true && styles.yesText,
                  ]}
                >
                  ✓ Yes, I followed
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.yesNoBtn,
                  isFollowed === false && styles.noBtn,
                ]}
                onPress={() => handleFollowedPress(false)}
              >
                <Text
                  style={[
                    styles.yesNoText,
                    isFollowed === false && styles.noText,
                  ]}
                >
                  ✗ No, I didn't
                </Text>
              </TouchableOpacity>
            </View>

            {/* Change Section */}
            {showChangeSection && (
              <>
                <View style={styles.divider} />
                
                <View style={styles.changeSection}>
                  <Text style={styles.changeSectionTitle}>
                    What did you eat instead?
                  </Text>
                  <Text style={styles.changeSectionSubtitle}>
                    * Leave empty if you didn't eat anything.
                  </Text>

                  <Text style={styles.changeSectionSubtitle}>
                    * You can add multiple items.
                  </Text>
                  
                  {/* Added Items List */}
                  {changedItemsList.length > 0 && (
                    <View style={styles.addedItemsContainer}>
                      <Text style={styles.addedItemsLabel}>Added Items:</Text>
                      <View style={styles.chipContainer}>
                        {changedItemsList.map((addedItem) => (
                          <View key={addedItem.itemID} style={styles.chip}>
                            <Text style={styles.chipText}>
                              {addedItem.itemName} ({addedItem.portion}g)
                            </Text>
                            <TouchableOpacity 
                              onPress={() => handleRemoveItem(addedItem.itemID)}
                              style={styles.chipRemove}
                            >
                              <Text style={styles.chipRemoveText}>✕</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Item Dropdown */}
                  <Text style={styles.inputLabel}>Select Food Item:</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedItemID}
                      onValueChange={handleItemSelection}
                      style={styles.picker}
                    >
                      <Picker.Item label="-- Select an item --" value="" />
                      {availableItems.map((availableItem) => (
                        <Picker.Item
                          key={availableItem.itemID}
                          label={availableItem.itemName}
                          value={availableItem.itemID}
                        />
                      ))}
                    </Picker>
                  </View>

                  {/* Portion Input */}
                  <Text style={styles.inputLabel}>Portion (grams):</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter amount in grams (e.g. 150)"
                    keyboardType="decimal-pad"
                    value={portion}
                    onChangeText={handlePortionChange}
                  />

                  {/* Add Button */}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddItem}
                  >
                    <Text style={styles.addButtonText}>+ Add Item</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                isFollowed === null && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isFollowed === null}
            >
              <Text style={styles.submitBtnText}>Submit Feedback</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}