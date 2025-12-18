import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface MealItem {
  name: string;
  portion: string;
  calories: number;
}

interface MealDetailModalProps {
  visible: boolean;
  onClose: () => void;
  mealType: string;
  timeRange: string;
  totalCalories: number;
  items: MealItem[];
  isCompleted: boolean;
  canChange: boolean;
}

export default function MealDetailModal({
  visible,
  onClose,
  mealType,
  timeRange,
  totalCalories,
  items,
  isCompleted,
  canChange,
}: MealDetailModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{mealType}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Zaman Aralığı */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Zaman:</Text>
              <Text style={styles.value}>{timeRange}</Text>
            </View>

            {/* Toplam Kalori */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Toplam Kalori:</Text>
              <Text style={styles.value}>{totalCalories} kcal</Text>
            </View>

            {/* Durum */}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Text style={[styles.value, isCompleted ? styles.completed : styles.pending]}>
                {isCompleted ? '✓ Completed' : '? Waiting'}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Meal Items Detay */}
            <Text style={styles.sectionTitle}>Besin Detayları</Text>
            {items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCalories}>{item.calories} kcal</Text>
                </View>
                <Text style={styles.itemPortion}>{item.portion}</Text>
                {/* Daha sonra makro bilgileri eklenecek */}
                <View style={styles.macroRow}>
                  <Text style={styles.macroText}>P: 25g</Text>
                  <Text style={styles.macroText}>C: 30g</Text>
                  <Text style={styles.macroText}>F: 10g</Text>
                </View>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Feedback Durumu */}
            <Text style={styles.sectionTitle}>Feedback Status</Text>
            {isCompleted ? (
              <Text style={styles.feedbackText}>✓ You have given feedback as: "NOT ADHERED" </Text>
            ) : (
              <Text style={styles.warningText}>⚠️ You have not given feedback yet</Text>
            )}

            <View style={styles.divider} />

            {/* AI Tavsiye Alanı */}
            <Text style={styles.sectionTitle}>Alternative Status</Text>
            {canChange ? (
                <View style={styles.aiBox}>
                    <Text style={styles.aiText}>
                    💡 Bu öğünde Sadece "****" besini için alternatif almak için Diyesityeninizin izni bulunmaktadır.
                    </Text>
                </View>
              ): (
                <View style={styles.aiBoxWarning}>
                    <Text style={styles.aiTextWarning}>
                    ⚠️ Bu öğünde hiçbir besin için alternatif alamazsınız. Diyetisyeninizn izni bulunmamaktadır.
                    </Text>
                </View>
              )
              
              }
            

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.feedbackBtn}>
                <Text style={styles.feedbackBtnText}>Feedback Ver</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.altBtn}>
                <Text style={styles.altBtnText}>Alternatif Al</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
    lineHeight: 20,
  },
  aiBoxWarning: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  aiTextWarning: {
    fontSize: 14,
    color: '#000000ff',
    marginBottom: 12,
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
});