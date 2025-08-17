import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function MetricsScreen({ route }) {
  const { user } = route.params

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Metrics</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
      <Text style={styles.description}>
        This screen will display charts and analytics for your financial data.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
})
