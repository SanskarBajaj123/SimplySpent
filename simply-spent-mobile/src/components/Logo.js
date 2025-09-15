import React from 'react'
import { View } from 'react-native'
import Svg, { G, Path, Circle, Ellipse } from 'react-native-svg'

export default function Logo({ size = 64, style }) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* Blue Background */}
        <rect width="64" height="64" fill="#0066CC" rx="12"/>
        
        {/* Money Bag Body (Yellow/Gold) */}
        <ellipse cx="32" cy="38" rx="18" ry="22" fill="#FFD700"/>
        
        {/* Money Bag Top/Tie (Darker Brown) */}
        <ellipse cx="32" cy="20" rx="12" ry="8" fill="#8B4513"/>
        
        {/* Dollar Sign (Brown) */}
        <path d="M32 26v3M32 50v3M28 30h8c1.5 0 3 1.5 3 3s-1.5 3-3 3h-8c-1.5 0-3-1.5-3-3s1.5-3 3-3h8c1.5 0 3-1.5 3-3s-1.5-3-3-3h-8" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    </View>
  )
}
