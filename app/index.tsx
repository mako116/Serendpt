import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Illustration Placeholder */}
        <View style={styles.illustrationContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="filter-outline" size={40} color="#000" />
          </View>
          <Text style={styles.title}>Your reading companion</Text>
          
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#000" />
              <Text style={styles.featureText}>reads aloud to you</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#000" />
              <Text style={styles.featureText}>answers any question</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <Button 
              title="Login" 
              variant="primary" 
              onPress={() => router.push('/login')} 
              style={styles.halfButton}
            />
            <Button 
              title="Sign up" 
              variant="secondary" 
              onPress={() => router.push('/signup')} 
              style={styles.halfButton}
            />
          </View>
          
          <Button 
            title="Login/Sign up with google" 
            variant="dark" 
            onPress={() => {}} 
            icon={<Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 10 }} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    // Add border/shadow if needed to match the wave logo
  },
  title: {
    fontSize: 36,
    fontWeight: '400',
    fontFamily: 'serif', // Headings use serif
    textAlign: 'center',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  features: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#1A1A1A',
  },
  footer: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  halfButton: {
    width: '48%',
  },
});
