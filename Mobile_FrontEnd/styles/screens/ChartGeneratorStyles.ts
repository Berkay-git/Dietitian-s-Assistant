import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  emptyContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptySubText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  toggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
  },
  navBtnDisabled: {
    backgroundColor: '#F3F4F6',
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navBtnTextDisabled: {
    color: '#D1D5DB',
  },
  pageInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});
