import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { supabase } from '../supabaseClient'

export default function TransactionModal({ isVisible, onClose, onTransactionAdded, onTransactionUpdated, user, transaction = null }) {
  const [formData, setFormData] = useState({
    amount: '',
    transaction_type: 'EXPENSE',
    category: '',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  // Fixed category options
  const categoryOptions = {
    EXPENSE: [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Healthcare',
      'Utilities',
      'Rent/Mortgage',
      'Insurance',
      'Education',
      'Travel',
      'Subscriptions',
      'Other'
    ],
    INCOME: [
      'Salary',
      'Freelance',
      'Investment',
      'Business',
      'Gift',
      'Refund',
      'Bonus',
      'Other'
    ]
  }

  // Reset form when modal opens/closes or when transaction changes
  useEffect(() => {
    if (transaction) {
      // Editing existing transaction
      setFormData({
        amount: transaction.amount.toString(),
        transaction_type: transaction.transaction_type,
        category: transaction.category,
        notes: transaction.notes || '',
        transaction_date: transaction.transaction_date.split('T')[0]
      })
    } else {
      // Adding new transaction
      setFormData({
        amount: '',
        transaction_type: 'EXPENSE',
        category: '',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0]
      })
    }
  }, [transaction, isVisible])

  const handleSubmit = async () => {
    if (!formData.amount || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields')
      return
    }

    if (parseFloat(formData.amount) <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0')
      return
    }

    setLoading(true)

    try {
      if (transaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update({
            amount: parseFloat(formData.amount),
            transaction_type: formData.transaction_type,
            category: formData.category,
            notes: formData.notes || null,
            transaction_date: new Date(formData.transaction_date).toISOString()
          })
          .eq('id', transaction.id)

        if (error) throw error

        onTransactionUpdated()
      } else {
        // Add new transaction
        const { error } = await supabase
          .from('transactions')
          .insert([
            {
              user_id: user.id,
              amount: parseFloat(formData.amount),
              transaction_type: formData.transaction_type,
              category: formData.category,
              notes: formData.notes || null,
              transaction_date: new Date(formData.transaction_date).toISOString()
            }
          ])

        if (error) throw error

        onTransactionAdded()
      }

      // Reset form
      setFormData({
        amount: '',
        transaction_type: 'EXPENSE',
        category: '',
        notes: '',
        transaction_date: new Date().toISOString().split('T')[0]
      })

    } catch (error) {
      console.error('Error saving transaction:', error)
      Alert.alert('Error', 'Failed to save transaction: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear category when switching transaction type
    if (field === 'transaction_type') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        category: ''
      }))
    }
  }

  const selectCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      category
    }))
    setShowCategoryPicker(false)
  }

  const isEditing = !!transaction

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <Text style={styles.modalTitle}>
                  {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isEditing ? 'Update your transaction details' : 'Track your income or expense'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount <Text style={styles.required}>*</Text></Text>
                <View style={styles.amountContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    value={formData.amount}
                    onChangeText={(value) => handleInputChange('amount', value)}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Transaction Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type <Text style={styles.required}>*</Text></Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.transaction_type === 'EXPENSE' && styles.typeButtonActive
                    ]}
                    onPress={() => handleInputChange('transaction_type', 'EXPENSE')}
                  >
                    <Text style={styles.typeIcon}>💸</Text>
                    <Text style={[
                      styles.typeText,
                      formData.transaction_type === 'EXPENSE' && styles.typeTextActive
                    ]}>
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      formData.transaction_type === 'INCOME' && styles.typeButtonActive
                    ]}
                    onPress={() => handleInputChange('transaction_type', 'INCOME')}
                  >
                    <Text style={styles.typeIcon}>💰</Text>
                    <Text style={[
                      styles.typeText,
                      formData.transaction_type === 'INCOME' && styles.typeTextActive
                    ]}>
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity
                  style={styles.categoryButton}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    !formData.category && styles.categoryButtonPlaceholder
                  ]}>
                    {formData.category || 'Select a category'}
                  </Text>
                  <Text style={styles.categoryButtonIcon}>▼</Text>
                </TouchableOpacity>

                {/* Category Picker */}
                {showCategoryPicker && (
                  <View style={styles.categoryPicker}>
                    <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                      {categoryOptions[formData.transaction_type].map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={styles.categoryOption}
                          onPress={() => selectCategory(category)}
                        >
                          <Text style={styles.categoryOptionText}>{category}</Text>
                          {formData.category === category && (
                            <Text style={styles.categoryOptionCheck}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.transaction_date}
                  onChangeText={(value) => handleInputChange('transaction_date', value)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add any additional notes..."
                  value={formData.notes}
                  onChangeText={(value) => handleInputChange('notes', value)}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>●</Text>
                    <Text style={styles.submitButtonText}>
                      {isEditing ? 'Updating...' : 'Adding...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Update Transaction' : 'Add Transaction'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  formContainer: {
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#6B7280',
    marginRight: 8,
    fontWeight: '600',
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
    color: '#111827',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  typeButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  typeTextActive: {
    color: '#2563EB',
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  categoryButtonPlaceholder: {
    color: '#9CA3AF',
  },
  categoryButtonIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryPicker: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: 'white',
    maxHeight: 200,
  },
  categoryList: {
    padding: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  categoryOptionCheck: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    marginRight: 8,
    animationName: 'spin',
  },
})
