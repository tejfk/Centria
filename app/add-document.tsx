import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      if (!name) setName(asset.fileName?.split('.')[0] || 'New Image');
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      });
      if (!name) setName(asset.name.split('.')[0]);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !selectedFile) return;

    setLoading(true);
    try {
      // 1. Create a permanent directory for Centria Vault
      const vaultDir = `${FileSystem.documentDirectory}vault/`;
      const dirInfo = await FileSystem.getInfoAsync(vaultDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(vaultDir, { intermediates: true });
      }

      // 2. Copy the file to the local vault folder
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const localPath = `${vaultDir}${fileName}`;
      
      await FileSystem.copyAsync({
        from: selectedFile.uri,
        to: localPath,
      });

      // 3. Save metadata to PowerSync (Centria Offline DB)
      const docId = generateId();
      await db.execute(
        'INSERT INTO documents (id, user_id, name, category, file_path, file_type, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [docId, 'local-user', name.trim(), category, localPath, selectedFile.type, null]
      );

      router.back();
    } catch (error: any) {
      console.error('Storage Error:', error);
      Alert.alert('Save Failed', 'There was an error saving your document to local storage.');
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
