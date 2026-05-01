import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Uploads a file to Supabase Storage
 * @param bucket Bucket name
 * @param path Remote path inside the bucket
 * @param base64 Base64 string of the file
 * @param contentType MIME type of the file
 */
import { decode } from 'base64-arraybuffer';

export const uploadFile = async (bucket: string, path: string, base64: string, contentType: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, decode(base64), {
      contentType,
      upsert: true
    });
  
  if (error) throw error;
  return data;
};
