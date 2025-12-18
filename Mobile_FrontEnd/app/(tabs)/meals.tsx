import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import MealCard from '../../components/common/MealCard';
import MealDetailModal from '../../components/common/MealCardModal';
import { mealsStyles } from '../../styles/screens/MealsPageStyles';

export default function Meals() {

  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock data - 6 öğün örneği (athlete için)
  const mealsData = [
    {
      mealType: 'Breakfast',
      timeRange: '08:00 - 10:00',
      totalCalories: 552,
      isCompleted: true,
      items: [
        { name: 'Basmati Rice', portion: 'Ece Basmati Rice, 152 grams', calories: 552 },
      ],
    },
    {
      mealType: 'Morning Snack',
      timeRange: '11:00 - 11:15',
      totalCalories: 654,
      isCompleted: false,
      items: [
        { name: 'Chicken Breast', portion: '100 grams', calories: 350 },
        { name: 'Almonds', portion: '30 grams', calories: 304 },
      ],
    },
    {
      mealType: 'Lunch',
      timeRange: '12:30 - 13:30',
      totalCalories: 752,
      isCompleted: false,
      items: [
        { name: 'Grilled Salmon', portion: '150 grams', calories: 280 },
        { name: 'Quinoa', portion: '200 grams', calories: 222 },
        { name: 'Broccoli', portion: '150 grams', calories: 50 },
        { name: 'Olive Oil', portion: '1 tbsp', calories: 200 },
      ],
    },
    {
      mealType: 'Afternoon Snack',
      timeRange: '15:30 - 16:00',
      totalCalories: 300,
      isCompleted: false,
      items: [
        { name: 'Greek Yogurt', portion: '200g', calories: 200 },
        { name: 'Honey', portion: '1 tbsp', calories: 100 },
      ],
    },
    {
      mealType: 'Dinner',
      timeRange: '19:00 - 20:00',
      totalCalories: 650,
      isCompleted: false,
      items: [
        { name: 'Chicken Thigh', portion: '200 grams', calories: 400 },
        { name: 'Sweet Potato', portion: '150 grams', calories: 150 },
        { name: 'Green Salad', portion: '100 grams', calories: 100 },
      ],
    },
    {
      mealType: 'Evening Snack',
      timeRange: '21:30 - 22:00',
      totalCalories: 250,
      isCompleted: false,
      items: [
        { name: 'Protein Shake', portion: '250ml', calories: 250 },
      ],
    },
  ];

const handleCardPress = (meal: any) => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedMeal(null);
  };

  const handleGetAlternative = (mealType: string) => {
    console.log(`Get alternative for ${mealType}`);
  };

  const handleGiveFeedback = (mealType: string) => {
    console.log(`Give feedback for ${mealType}`);
  };

  return (
    <View style={mealsStyles.container}>
      {/* Sabit Header */}
      <View style={mealsStyles.macroBox}>
        <Text style={mealsStyles.macroTitle}>1600 Remaining</Text>
        <Text style={mealsStyles.macroSubtitle}>Carbs • Protein • Fat</Text>
      </View>

      {/* Scrollable Meal Cards */}
      <ScrollView 
        style={mealsStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {mealsData.map((meal, index) => (
          <MealCard
            key={index}
            mealType={meal.mealType}
            timeRange={meal.timeRange}
            totalCalories={meal.totalCalories}
            items={meal.items}
            isCompleted={meal.isCompleted}
            onPress={() => handleCardPress(meal)}
            onGetAlternative={() => handleGetAlternative(meal.mealType)}
            onGiveFeedback={() => handleGiveFeedback(meal.mealType)}
          />
        ))}
      </ScrollView>

      {/* Detay Modal */}
      {selectedMeal && (
        <MealDetailModal
          visible={modalVisible}
          onClose={handleCloseModal}
          mealType={selectedMeal.mealType}
          timeRange={selectedMeal.timeRange}
          totalCalories={selectedMeal.totalCalories}
          items={selectedMeal.items}
          isCompleted={selectedMeal.isCompleted}
          canChange={selectedMeal.canChange}
        />
      )}
    </View>
  );
}