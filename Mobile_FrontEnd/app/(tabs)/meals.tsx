import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import MealCard from '../../components/common/MealCard';
import MealDetailModal from '../../components/common/MealCardModal';
import { mealsStyles } from '../../styles/screens/MealsPageStyles';
import { useMeals } from '../../context/MealsContext';
import { useAuth } from '../../context/AuthContext';

export default function Meals() {
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { dailyMealPlan, loading, error, fetchMealPlan, refreshMealPlan } = useMeals();
  const { user } = useAuth(); // Get logged in user info

  useEffect(() => {
    // Fetch today's meal plan when component mounts
    if (user?.user_id) {
      fetchMealPlan(user.user_id);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMealPlan();
    setRefreshing(false);
  };

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
    // TODO: Implement alternative meal logic
  };

  const handleGiveFeedback = (mealType: string) => {
    console.log(`Give feedback for ${mealType}`);
    // TODO: Implement feedback logic
  };

  // Calculate remaining macros
  const getRemainingMacros = () => {
    if (!dailyMealPlan) return { calories: 0, protein: 0, carb: 0, fat: 0 };
  
    const dailyTarget = {
      calories: dailyMealPlan.dailyTotals.calories,
      protein: dailyMealPlan.dailyTotals.protein,
      carb: dailyMealPlan.dailyTotals.carb,
      fat: dailyMealPlan.dailyTotals.fat
    };

    return { //Rastgele 100 ve 10 var
      calories:dailyTarget.calories - 100, // Feedbacki verilen bir item olunca burayı updatele
      protein:dailyTarget.protein - 10 ,
      carb:dailyTarget.carb - 10,
      fat:dailyTarget.fat - 10   // Feedbacki verilen bir item olunca burayı updatele
    };
  };

  if (loading && !dailyMealPlan) {
    return (
      <View style={[mealsStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (error && !dailyMealPlan) {
    return (
      <View style={[mealsStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
      </View>
    );
  }

  if (!dailyMealPlan) {
    return (
      <View style={[mealsStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16 }}>Meal plan bulunamadı</Text>
      </View>
    );
  }

  const remaining = getRemainingMacros();

  return (
    <View style={mealsStyles.container}>
      {/* Sabit Header */}
      <View style={mealsStyles.macroBox}>
        <Text style={mealsStyles.macroTitle}>
          {remaining.calories} Remaining
        </Text>
        <Text style={mealsStyles.macroSubtitle}>
          {remaining.carb}g Carbs • {remaining.protein}g Protein • {remaining.fat}g Fat
        </Text>
      </View>

      {/* Scrollable Meal Cards */}
      <ScrollView 
        style={mealsStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {dailyMealPlan.meals.map((meal, index) => (
          <MealCard
            key={meal.mealID || index}
            mealType={meal.mealName}
            timeRange={meal.timeRange}
            totalCalories={meal.totalCalories}
            items={meal.items}
            isCompleted={meal.isCompleted}
            onPress={() => handleCardPress(meal)}
            onGetAlternative={() => handleGetAlternative(meal.mealName)}
            onGiveFeedback={() => handleGiveFeedback(meal.mealName)}
          />
        ))}
      </ScrollView>

      {/* Detay Modal */}
      {selectedMeal && (
        <MealDetailModal
          visible={modalVisible}
          onClose={handleCloseModal}
          mealType={selectedMeal.mealName}
          timeRange={selectedMeal.timeRange}
          totalCalories={selectedMeal.totalCalories}
          items={selectedMeal.items}
          isCompleted={selectedMeal.isCompleted}
          canChange={true} // TODO: Get from backend
        />
      )}
    </View>
  );
}