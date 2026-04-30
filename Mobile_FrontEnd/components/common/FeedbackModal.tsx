import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { feedbackModalStyles as styles } from '../../styles/screens/FeedbackModalStyles';
import { gramsToExchange, getExchangeInfo } from './ExchangeMap';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<TextInput>(null);
  
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
      setSearchQuery('');
      setDropdownOpen(false);
      if (searchRef.current) searchRef.current.setNativeProps({ text: '' });
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

  const handleItemSelection = (itemId: string, itemName: string) => {
    setSelectedItemID(itemId);
    setSelectedItemName(itemName);
    setSearchQuery(itemName);
    setDropdownOpen(false);
    setPortion('');
    if (searchRef.current) searchRef.current.setNativeProps({ text: itemName });
  };

  const filteredItems = searchQuery.length > 0
    ? availableItems.filter(i => i.itemName.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR')))
    : availableItems;

  // Get exchange info for the currently selected item
  const exchangeInfo = selectedItemName ? getExchangeInfo(selectedItemName) : null;

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
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Convert exchange count to grams if exchange info exists
    const gramsToSend = exchangeInfo
      ? Math.round(portionNum * exchangeInfo.gramsPerUnit)
      : portionNum;

    // Check if item already exists
    const existingItem = changedItemsList.find(i => i.itemID === selectedItemID);
    if (existingItem) {
      Alert.alert('Info', 'This item is already added. Remove it first to add again.');
      return;
    }

    // Add to list (portion stored as grams for backend)
    const newItem: ChangedFoodItem = {
      itemID: selectedItemID,
      itemName: selectedItemName,
      portion: gramsToSend,
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
              <Text style={styles.itemPortion}>{gramsToExchange(item.name, item.portion)}</Text>
              {/* <Text style={styles.itemCalories}>{item.calories} kcal</Text> */}
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
                              {addedItem.itemName} ({gramsToExchange(addedItem.itemName, `${addedItem.portion}g`)})
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

                  {/* Item Search Dropdown */}
                  <Text style={styles.inputLabel}>Select Food Item:</Text>
                  <TextInput
                    ref={searchRef}
                    style={styles.textInput}
                    placeholder="Search item..."
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      setDropdownOpen(true);
                      if (!text) {
                        setSelectedItemID('');
                        setSelectedItemName('');
                      }
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    autoCorrect={false}
                    autoCapitalize="none"
                    spellCheck={false}
                  />
                  {dropdownOpen && filteredItems.length > 0 && (
                    <View style={{
                      maxHeight: 150,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 8,
                      backgroundColor: '#fff',
                      marginBottom: 8,
                    }}>
                      <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                        {filteredItems.map((availableItem) => (
                          <TouchableOpacity
                            key={availableItem.itemID}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                              borderBottomWidth: 1,
                              borderBottomColor: '#F3F4F6',
                              backgroundColor: selectedItemID === availableItem.itemID ? '#EFF6FF' : '#fff',
                            }}
                            onPress={() => handleItemSelection(availableItem.itemID, availableItem.itemName)}
                          >
                            <Text style={{
                              fontSize: 14,
                              color: selectedItemID === availableItem.itemID ? '#007AFF' : '#374151',
                              fontWeight: selectedItemID === availableItem.itemID ? '600' : '400',
                            }}>
                              {availableItem.itemName}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Portion Input */}
                  <Text style={styles.inputLabel}>
                    {exchangeInfo ? `Amount (${exchangeInfo.measure}):` : 'Portion (grams):'}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={exchangeInfo ? `How many ${exchangeInfo.measure}? (e.g. 2)` : 'Firstly, you should select an item!'}
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