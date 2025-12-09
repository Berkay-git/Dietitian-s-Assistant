import { View, Text, StyleSheet } from 'react-native';

export default function Health() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Health Overview</Text>
      <Text>Body measurements, activity status, health summary</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});
