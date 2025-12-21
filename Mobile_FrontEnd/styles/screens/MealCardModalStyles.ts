import { StyleSheet } from 'react-native';

export const mealCardModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeBtn: {
    fontSize: 28,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    color: '#666',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  completed: {
    color: '#4CAF50',
  },
  pending: {
    color: '#FF9800',
  },
  totalMacroBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
    marginVertical: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B61FF',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  itemCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B61FF',
  },
  itemPortion: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroText: {
    fontSize: 12,
    color: '#888',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  feedbackText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  warningText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  aiBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  aiText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  aiBoxWarning: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  aiTextWarning: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  feedbackBtn: {
    flex: 1,
    backgroundColor: '#FFA500',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  feedbackBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  altBtn: {
    flex: 1,
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  altBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },

  changeableBadge: {
    marginLeft: 8,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeableBadgeText: {
    fontSize: 12,
  },
  feedbackBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  feedbackBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  itemActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  itemFeedbackBtn: {
    flex: 1,
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  itemFeedbackBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  itemAlternativeBtn: {
    flex: 1,
    backgroundColor: '#7B61FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  itemAlternativeBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  llmContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F4F6FF",
    borderRadius: 10,
  },

  llmLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  llmLoadingText: {
    fontSize: 12,
    color: "#555",
  },

  llmResultCard: {
    marginTop: 5,
  },

  llmTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C63FF",
    marginBottom: 4,
  },

  llmItemName: {
    fontSize: 14,
    fontWeight: "600",
  },

  llmPortion: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },

});