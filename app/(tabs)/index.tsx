import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { DocumentItem } from '@/components/DocumentItem';
import { Button } from '@/components/Button';
import * as DocumentPicker from 'expo-document-picker';
import { documentService } from '@/services/api';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';

const { width } = Dimensions.get('window');

const DOCUMENTS = [
  { id: '1', title: 'The Green Mile', progress: 30 },
  { id: '2', title: 'The Shawsha...', progress: 35 },
  { id: '3', title: 'Forrest Gump', progress: 40 },
];

export default function DashboardScreen() {
  const [activeFilter, setActiveFilter] = useState('Website');
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState(DOCUMENTS);
  const accessToken = useAuthStore((state) => state.accessToken);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      });

      if (!result.canceled) {
        setLoading(true);
        if (!accessToken) {
          Alert.alert('Error', 'No access token found. Please log in again.');
          return;
        }
        const response = await documentService.uploadDocument(result.assets[0].uri, accessToken);
        
        if (response.document_id) {
          const newDoc = {
            id: response.document_id,
            title: response.document_title || result.assets[0].name,
            progress: 0
          };
          
          setDocuments(prev => [newDoc, ...prev]);

          router.push({
            pathname: `/reader/${response.document_id}`,
            params: { title: newDoc.title }
          });
        } else {
          alert('Upload failed: No document ID returned.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileCircle}>
          <Text style={styles.profileInitial}>S</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="create-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.welcomeText}>Welcome back, Sobby</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'Website' && styles.filterChipActive]}
            onPress={() => setActiveFilter('Website')}
          >
            <Ionicons name="globe-outline" size={18} color={activeFilter === 'Website' ? '#000' : '#666'} />
            <Text style={[styles.filterText, activeFilter === 'Website' && styles.filterTextActive]}>Website</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'Fanfiction' && styles.filterChipActive]}
            onPress={() => setActiveFilter('Fanfiction')}
          >
            <Ionicons name="flash-outline" size={18} color={activeFilter === 'Fanfiction' ? '#000' : '#666'} />
            <Text style={[styles.filterText, activeFilter === 'Fanfiction' && styles.filterTextActive]}>Fanfiction</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.documentList}>
          {documents.map((doc) => (
            <DocumentItem 
              key={doc.id} 
              title={doc.title} 
              progress={doc.progress} 
              onPress={() => router.push({
                pathname: `/reader/${doc.id}`,
                params: { title: doc.title }
              })}
            />
          ))}
        </View>

        <View style={styles.uploadSection}>
          <Button 
            title="Upload a new doc" 
            variant="primary" 
            onPress={handleUpload}
            loading={loading}
            style={styles.uploadButton}
          />
          <Text style={styles.supportText}>Supported formats: PDF, DOC, DOCX, TXT</Text>
          <Text style={styles.supportText}>(Max 50MB)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: 'serif',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 32,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginHorizontal: 8,
  },
  filterChipActive: {
    borderColor: '#F0F0F0',
    backgroundColor: '#fff',
    // In the screenshot, the active chip has a subtle border, not very distinct
  },
  filterText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  filterTextActive: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  documentList: {
    marginBottom: 40,
  },
  uploadSection: {
    alignItems: 'center',
  },
  uploadButton: {
    width: '80%',
    marginBottom: 16,
  },
  supportText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});
