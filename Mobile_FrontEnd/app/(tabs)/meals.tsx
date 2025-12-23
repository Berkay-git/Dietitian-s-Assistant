import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import MealCard from '../../components/common/MealCard';
import MealDetailModal from '../../components/common/MealCardModal';
import { mealsStyles } from '../../styles/screens/MealsPageStyles';
import { useMeals } from '../../context/MealsContext';
import { useAuth } from '../../context/AuthContext';
import { calculateDailySummary } from "../../components/common/calculator";
import CalorieSummary from "../../components/common/CalorieSummary";

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

  const rawSummary = calculateDailySummary(
    dailyMealPlan.meals,
    dailyMealPlan.dailyTotals
  );

  const summary = {
    calories: {
      total: Math.round(rawSummary.calories.target),  
      consumed: Math.round(rawSummary.calories.consumed),
      remaining: Math.round(rawSummary.calories.remaining),
    },
    macros: {
      carb: {
        consumed: Math.round(rawSummary.macros.carb.consumed * 10) / 10,
        target: Math.round(rawSummary.macros.carb.target * 10) / 10,
      },
      protein: {
        consumed: Math.round(rawSummary.macros.protein.consumed * 10) / 10,
        target: Math.round(rawSummary.macros.protein.target * 10) / 10,
      },
      fat: {
        consumed: Math.round(rawSummary.macros.fat.consumed * 10) / 10,
        target: Math.round(rawSummary.macros.fat.target * 10) / 10,
      },
    },
  };


  return (
    <View style={mealsStyles.container}>

      {/* Sabit Header */}
      <CalorieSummary
        calories={summary.calories}
        macros={{
          carb: summary.macros.carb,
          protein: summary.macros.protein,
          fat: summary.macros.fat,
        }}
      />

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
          />
        ))}
      </ScrollView>

      {/* Detay Modal */}
      {selectedMeal && (
        <MealDetailModal
          visible={modalVisible}
          onClose={handleCloseModal}
          mealID={selectedMeal.mealID} // Hata olursa sil burayı
          mealName={selectedMeal.mealName}
          timeRange={selectedMeal.timeRange}
          totalCalories={selectedMeal.totalCalories}
          totalProtein={selectedMeal.totalProtein}
          totalCarb={selectedMeal.totalCarb} 
          totalFat={selectedMeal.totalFat} 
          items={selectedMeal.items}
          isCompleted={selectedMeal.isCompleted}
          canChange={selectedMeal.canChange}
        />
      )}
    </View>
  );
}