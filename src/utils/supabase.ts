import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl = process.env.EXPO_PUBLIC_API_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_API_ANON_KEY;

// const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
// const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl) {
  throw new Error("Missing Supabase URL. Please define EXPO_PUBLIC_API_URL in your environment variables.");
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing Supabase Anon Key. Please define EXPO_PUBLIC_API_ANON_KEY in your environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
