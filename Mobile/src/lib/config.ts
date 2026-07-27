import Constants from 'expo-constants';

// Dynamically resolve the local machine IP from Expo's debugger host.
// This makes the app work on a physical device connected to the same Wi-Fi.
const debuggerHost = Constants.expoConfig?.hostUri;
export const LOCAL_IP = debuggerHost?.split(':')[0] || '192.168.1.5';

// Fall back to dynamic IP if no EXPO_PUBLIC_API_URL is provided.
const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
const envDetectionUrl = process.env.EXPO_PUBLIC_DETECTION_URL;

export const CONFIG = {
  /** Main Flask backend (auth, history, email). Port 5000. */
  API_URL: envApiUrl && !envApiUrl.includes('localhost')
    ? envApiUrl
    : `http://${LOCAL_IP}:5000`,

  /** AI Pose Detection Flask backend. Port 5001. */
  DETECTION_URL: envDetectionUrl && !envDetectionUrl.includes('localhost')
    ? envDetectionUrl
    : `http://${LOCAL_IP}:5001`,

  /** Base URL for serving static assets from the web app. Port 5173. */
  ASSET_URL: `http://${LOCAL_IP}:5173`,

  /** Supabase project URL — must match the website exactly. */
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://urmnrxvnlnulgqfteahi.supabase.co',
};
