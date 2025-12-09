import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Meals() {
  return (
    <ScrollView style={styles.container}>
      
      {/* Günlük Makro Alanı */}
      <View style={styles.macroBox}>
        <Text style={styles.macroTitle}>1600 Remaining</Text>
        <Text>Carbs • Protein • Fat</Text>
      </View>

      {/* Breakfast */}
      <View style={styles.mealCard}>
        <Text style={styles.mealTitle}>Breakfast (08:00 - 10:00)</Text>
        <Text>Basmati Rice - 152g</Text>
        <Text>Calories: 552</Text>
        <Text style={styles.altBtn}>Get an alternative</Text>
      </View>

      {/* Snack */}
      <View style={styles.mealCard}>
        <Text style={styles.mealTitle}>Snack (11:00 - 11:15)</Text>
        <Text>Chicken Breast - 100g</Text>
        <Text>Calories: 654</Text>
        <Text style={styles.altBtn}>Get an alternative</Text>
      </View>

      {/* Lunch */}
      <View style={styles.mealCard}>
        <Text style={styles.mealTitle}>Lunch (12:30 - 13:30)</Text>
        <Text>Basmati Rice - 152g</Text>
        <Text>Calories: 552</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  macroBox: {
    backgroundColor: '#3A4F5E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  macroTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mealCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  mealTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  altBtn: {
    marginTop: 10,
    color: '#7B61FF',
    fontWeight: '600',
  },
});
