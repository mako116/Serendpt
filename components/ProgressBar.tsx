import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  containerStyle?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  height = 8,
  containerStyle 
}) => {
  return (
    <View style={[styles.container, { height }, containerStyle]}>
      <View 
        style={[
          styles.fill, 
          { width: `${Math.min(Math.max(progress, 0), 100)}%` }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
});
