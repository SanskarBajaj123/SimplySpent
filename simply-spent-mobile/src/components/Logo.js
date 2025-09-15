import React from 'react'
import { View, Image } from 'react-native'

export default function Logo({ size = 64, style }) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image 
        source={require('../../assets/logo.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  )
}
