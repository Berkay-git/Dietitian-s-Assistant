import { StyleSheet } from 'react-native';

export const settingsStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  logoutBtn: {
    backgroundColor: '#ffebee',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef5350',
    marginTop: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  logoutText: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: '600',
  },
});