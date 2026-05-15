import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uutgcrmtmxwnehkcnhvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dGdjcm10bXh3bmVoa2NuaHZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTIwOTksImV4cCI6MjA5MzcyODA5OX0.T_TKjmzL8PTzIeK3sesXE47A83y41XCwxsOzmYu2X3c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
