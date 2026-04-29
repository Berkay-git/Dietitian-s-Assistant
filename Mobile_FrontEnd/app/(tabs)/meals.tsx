import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import MealCard from '../../components/common/MealCard';
import MealDetailModal from '../../components/common/MealCardModal';
import { mealsStyles } from '../../styles/screens/MealsPageStyles';
import { useMeals } from '../../context/MealsContext';
import { useAuth } from '../../context/AuthContext';
import ProgressSummary from "../../components/common/ProgressSummary";

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
      <View style={[mealsStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ color: '#EF4444', fontSize: 16, marginBottom: 16, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 }}
          onPress={() => { if (user?.user_id) fetchMealPlan(user.user_id); }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dailyMealPlan) {
    return (
      <View style={[mealsStyles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 6, textAlign: 'center' }}>No plans found for this date</Text>
        <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 18, textAlign: 'center' }}>Your dietitian may not have created a plan yet.</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 }}
          onPress={() => { if (user?.user_id) fetchMealPlan(user.user_id); }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={mealsStyles.container}>

      {/* Feedback Progress Bar */}
      <ProgressSummary meals={dailyMealPlan.meals} />

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