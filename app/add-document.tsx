import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../context/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CategoryChip } from '../components/ui/CategoryChip';
import { colors, typography, spacing } from '../utils/theme';
import { generateId, getCategoryIcon } from '../utils/helpers';
import { db } from '../utils/powersync';
import { uploadFile } from '../utils/supabase';

const docCategories = [
  { key: 'id', label: 'ID' },
  { key: 'receipt', label: 'Receipt' },
  { key: 'contract', label: 'Contract' },
  { key: 'other', label: 'Other' },
] as const;

export default function AddDocument() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; type: string } | null>(null);

  console.log('Centria AddDoc State:', { hasName: !!name, hasFile: !!selectedFile, fileUri: selectedFile?.uri });

  const pickImage = async () => {
    try {
      (global as any).isPickingFile = true;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        
        // Limit image size to 5MB
        const info = await FileSystem.getInfoAsync(asset.uri);
        if (info.exists && info.size && info.size > 5 * 1024 * 1024) {
          Alert.alert('File too large', 'Please select an image smaller than 5MB to save space.');
          return;
        }

        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });
        const defaultName = asset.fileName || `Image_${Date.now()}`;
        if (!name) setName(defaultName.split('.')[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => {
        (global as any).isPickingFile = false;
      }, 1000);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });

    if (!result.canceled) {
      const asset = result.assets[0];

      // Limit document size to 5MB
      if (asset.size && asset.size > 5 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select a file smaller than 5MB.');
        return;
      }

      setSelectedFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      });
      if (!name) setName(asset.name.split('.')[0]);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !selectedFile) {
      console.log('Centria Vault: Cannot save - missing name or file', { name, hasFile: !!selectedFile });
      return;
    }

    console.log('Centria Vault: Starting save process...', { name, category, uri: selectedFile.uri });
    setLoading(true);
    try {
      // 1. Create a permanent directory for Centria Vault
      const vaultDir = `${FileSystem.documentDirectory}vault/`;
      const dirInfo = await FileSystem.getInfoAsync(vaultDir);
      console.log('Centria Vault: Directory check:', dirInfo);
      
      if (!dirInfo.exists) {
        console.log('Centria Vault: Creating vault directory...');
        await FileSystem.makeDirectoryAsync(vaultDir, { intermediates: true });
      }

      // 2. Copy/Download the file to the local vault folder
      const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
      const localPath = vaultDir + fileName;
      console.log('Centria Vault: Destination path:', localPath);
      
      if (selectedFile.uri.startsWith('http')) {
        console.log('Centria Vault: Downloading remote test file...');
        await FileSystem.downloadAsync(selectedFile.uri, localPath);
      } else {
        console.log('Centria Vault: Copying local file...');
        await FileSystem.copyAsync({
          from: selectedFile.uri,
          to: localPath,
        });
      }
      console.log('Centria Vault: File storage successful.');

      // 3. Save metadata to Sovereign DB
      const docId = generateId();
      console.log('Centria Vault: Executing DB insert...', { docId, localPath });
      
      const { db } = require('../utils/powersync');
      if (!db) throw new Error('Database (db) is null or undefined!');

      await db.execute(
        'INSERT INTO documents (id, user_id, name, category, file_path, file_type, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [docId, 'local-user', name.trim(), category, localPath, selectedFile.type, null]
      );

      console.log('Centria Vault: Database insert successful.');
      Alert.alert('Success', 'Document saved to Vault.');
      router.back();
    } catch (error: any) {
      console.error('Centria Vault SAVE ERROR:', error);
      Alert.alert('Save Failed', `Technical Error: ${error.message || error.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Document</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Input label="Document Name" value={name} onChangeText={setName} placeholder="Driver's License, Lease..." />
          
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {docCategories.map(cat => (
                <CategoryChip key={cat.key} label={cat.label} icon={getCategoryIcon(cat.key)} selected={category === cat.key} onPress={() => setCategory(cat.key)} />
              ))}
            </ScrollView>
          </View>

          {selectedFile ? (
            <View style={styles.selectedFileBox}>
              <View style={styles.fileInfo}>
                <Ionicons name={selectedFile.type.includes('image') ? 'image-outline' : 'document-text-outline'} size={24} color={colors.accent} />
                <View>
                  <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>{selectedFile.type}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedFile(null)}>
                <Ionicons name="trash-outline" size={20} color={colors.negative} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadRow}>
              <TouchableOpacity style={[styles.uploadArea, { flex: 1 }]} onPress={pickImage} activeOpacity={0.6}>
                <Ionicons name="camera-outline" size={28} color={colors.text.tertiary} />
                <Text style={styles.uploadText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.uploadArea, { flex: 1 }]} onPress={pickDocument} activeOpacity={0.6}>
                <Ionicons name="document-attach-outline" size={28} color={colors.text.tertiary} />
                <Text style={styles.uploadText}>File</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.uploadArea, { flex: 1, backgroundColor: colors.accent + '20' }]} 
                onPress={() => {
                  setSelectedFile({ uri: 'https://via.placeholder.com/150', name: 'test_file.png', type: 'image/png' });
                  setName('Test Vault Doc');
                }}
              >
                <Ionicons name="flask-outline" size={28} color={colors.accent} />
                <Text style={[styles.uploadText, { color: colors.accent }]}>Test File</Text>
              </TouchableOpacity>
            </View>
          )}

          <Button 
            title={loading ? "Uploading..." : "Save to Vault"} 
            onPress={handleSave} 
            disabled={!name.trim() || !selectedFile || loading} 
            icon={loading ? <ActivityIndicator size="small" color="#fff" /> : undefined}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bg.card, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { gap: spacing.sm },
  uploadRow: { flexDirection: 'row', gap: spacing.md },
  uploadArea: {
    alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.xl, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    backgroundColor: colors.bg.elevated,
  },
  uploadText: { ...typography.body, color: colors.text.secondary, fontFamily: 'Inter_500Medium' },
  selectedFileBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md, borderRadius: 12, backgroundColor: colors.bg.card,
    borderWidth: 1, borderColor: colors.border,
  },
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  fileName: { ...typography.body, color: colors.text.primary, fontFamily: 'Inter_600SemiBold' },
  fileSize: { ...typography.caption, color: colors.text.tertiary },
});
