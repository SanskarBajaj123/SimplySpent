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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={formData.amount}
                  onChangeText={(value) => handleInputChange('amount', value)}
                  keyboardType="numeric"
                />
              </View>

              {/* Transaction Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      formData.transaction_type === 'EXPENSE' && styles.radioButtonSelected
                    ]}
                    onPress={() => handleInputChange('transaction_type', 'EXPENSE')}
                  >
                    <Text style={[
                      styles.radioButtonText,
                      formData.transaction_type === 'EXPENSE' && styles.radioButtonTextSelected
                    ]}>
                      Expense
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      formData.transaction_type === 'INCOME' && styles.radioButtonSelected
                    ]}
                    onPress={() => handleInputChange('transaction_type', 'INCOME')}
                  >
                    <Text style={[
                      styles.radioButtonText,
                      formData.transaction_type === 'INCOME' && styles.radioButtonTextSelected
                    ]}>
                      Income
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Food, Salary, Transportation"
                  value={formData.category}
                  onChangeText={(value) => handleInputChange('category', value)}
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
                />
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.transaction_date}
                  onChangeText={(value) => handleInputChange('transaction_date', value)}
                />
              </View>
            </ScrollView>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Transaction' : 'Add Transaction')}
                </Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  formContainer: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  radioButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  radioButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  radioButtonTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
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
})
