import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { documentService } from '@/services/api';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '@/store/useAuthStore';

const { width } = Dimensions.get('window');

export default function ReaderScreen() {
  const router = useRouter();
  const { id, title } = useLocalSearchParams();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBatch, setActiveBatch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('Charlotte');
  const accessToken = useAuthStore((state) => state.accessToken);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (accessToken) {
      fetchContent();
      fetchVoices();
    }
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [id, accessToken]);

  const fetchContent = async () => {
    if (!accessToken) return;
    try {
      const data = await documentService.getDocumentBatches(id as string, accessToken);
      setBatches(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch document content.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVoices = async () => {
    if (!accessToken) return;
    try {
      const data = await documentService.getVoices(accessToken);
      setVoices(data.voices || []);
    } catch (err) {
      console.error('Failed to fetch voices', err);
    }
  };

  const handlePlayAudio = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'Session expired. Please log in again.');
      return;
    }

    if (isPlaying) {
      await soundRef.current?.pauseAsync();
      setIsPlaying(false);
      return;
    }

    const currentBatch = batches[activeBatch];
    if (!currentBatch || !currentBatch.batch_content?.text) {
      Alert.alert('No Content', 'This page has no text to read.');
      return;
    }

    try {
      setLoading(true);
      const textToRead = currentBatch.batch_content.text.substring(0, 500); // Limit for demo
      const response = await documentService.getAudioFromText(textToRead, selectedVoice, accessToken);
      
      if (response.audio_base64) {
        const fileUri = `${FileSystem.cacheDirectory}temp_audio.mp3`;
        await FileSystem.writeAsStringAsync(fileUri, response.audio_base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (soundRef.current) {
          await soundRef.current.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to play audio.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && batches.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Processing document...</Text>
      </View>
    );
  }

  const currentBatch = batches[activeBatch] || {};
  const contentText = currentBatch.batch_content?.text || '';
  const displayContent = contentText.replace(/!\[image\]\(data:image\/png;base64,.*?\)/g, '').trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || currentBatch.batch_title || 'Document'}
        </Text>

        <TouchableOpacity 
          style={[styles.listeningButton, isPlaying && styles.listeningButtonActive]}
          onPress={handlePlayAudio}
        >
          <Ionicons name={isPlaying ? "pause" : "mic-outline"} size={16} color={isPlaying ? "#fff" : "#FF3B30"} />
          <Text style={[styles.listeningText, isPlaying && styles.listeningTextActive]}>
            {isPlaying ? "Playing..." : "Listen"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.pageSelector}>
          <Text style={styles.pageText}>
            {currentBatch.batch_title || `Page ${activeBatch + 1}`}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#666" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <View style={styles.toolbarIcons}>
          <TouchableOpacity style={styles.toolbarIcon}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarIcon}>
            <Ionicons name="expand-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageLabel}>{currentBatch.batch_title || `Page ${activeBatch + 1}`}</Text>
        <Text style={styles.docTitle}>{title || 'Document Content'}</Text>
        
        <Text style={styles.contentText}>
          {displayContent || "Text content will appear here once processed..."}
        </Text>
      </ScrollView>

      {/* Floating Elements */}
      <TouchableOpacity style={styles.chatButton}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#000" />
      </TouchableOpacity>

      <View style={[styles.audioIndicator, isPlaying && styles.audioIndicatorActive]}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/100' }} 
          style={styles.avatar} 
        />
        <View style={styles.waveContainer}>
          <Ionicons name={isPlaying ? "stats-chart" : "play"} size={24} color={Colors.primary} />
        </View>
      </View>

      {/* Voice Selector Mini-UI */}
      {voices.length > 0 && (
        <View style={styles.voiceContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {voices.map((v: any) => (
              <TouchableOpacity 
                key={v.name} 
                style={[styles.voiceChip, selectedVoice === v.name && styles.voiceChipActive]}
                onPress={() => setSelectedVoice(v.name)}
              >
                <Text style={[styles.voiceText, selectedVoice === v.name && styles.voiceTextActive]}>{v.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'serif',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  listeningButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  listeningButtonActive: {
    backgroundColor: Colors.primary,
  },
  listeningText: {
    fontSize: 12,
    color: '#000',
    marginLeft: 4,
    fontWeight: '500',
  },
  listeningTextActive: {
    color: '#fff',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  pageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toolbarIcons: {
    flexDirection: 'row',
  },
  toolbarIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 150,
  },
  pageLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  docTitle: {
    fontSize: 28,
    fontFamily: 'serif',
    textAlign: 'center',
    marginBottom: 32,
    color: '#1A1A1A',
  },
  contentText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
    textAlign: 'justify',
  },
  chatButton: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  audioIndicator: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  audioIndicatorActive: {
    borderColor: Colors.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    opacity: 0.6,
  },
  waveContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  voiceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  voiceChipActive: {
    backgroundColor: Colors.primary,
  },
  voiceText: {
    fontSize: 12,
    color: '#666',
  },
  voiceTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
