import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface DocumentItemProps {
  title: string;
  progress: number;
  onPress?: () => void;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({ title, progress, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{progress}%</Text>
          <ProgressBar progress={progress} containerStyle={styles.progressBar} />
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000',
    borderStyle: 'dashed',
    padding: 20,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'serif',
    color: '#1A1A1A',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    marginHorizontal: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
    width: 35,
  },
  progressBar: {
    flex: 1,
  },
  moreButton: {
    padding: 4,
  },
});
