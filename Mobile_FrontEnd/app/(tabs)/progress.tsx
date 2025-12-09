import { View, Text, StyleSheet } from 'react-native';

export default function Progress() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <Text>Weight, body fat, adherence charts will be here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});
