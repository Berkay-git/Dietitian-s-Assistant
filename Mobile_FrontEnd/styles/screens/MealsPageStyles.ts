import { StyleSheet } from 'react-native';

export const mealsStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa',
  },
  macroBox: {
    backgroundColor: '#3A4F5E',
    padding: 24,
    borderRadius: 16,
    margin: 16,
    marginBottom: 8,
    alignItems: 'center',
    // Sabit yükseklik
  },
  macroTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  macroSubtitle: {
    color: '#ccc',
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});