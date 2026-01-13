import { store$ } from "@/lib/state/store";
import { clsx, type ClassValue } from "clsx";
import Constants from 'expo-constants';
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  // Check user setting first
  const apiMode = store$.settings.apiMode.peek();

  if (apiMode === 'local_vercel') {
    // Try to derive the host IP from Expo config (works for LAN IP and Emulators)
    if (Constants.expoConfig?.hostUri) {
      const host = Constants.expoConfig.hostUri.split(':')[0];
      return `http://${host}:3000${path}`;
    }
    return `http://localhost:3000${path}`;
  }

  if (apiMode === 'local_expo') {
    const origin =
      Constants.experienceUrl?.replace('exp://', 'http://') ??
      `http://${Constants.expoConfig?.hostUri ?? 'localhost:8081'}`;
    return origin.concat(path);
  }

  // Production mode
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
  }

  if (process.env.NODE_ENV === 'development') {
    const origin =
      Constants.experienceUrl?.replace('exp://', 'http://') ??
      `http://${Constants.expoConfig?.hostUri ?? 'localhost:8081'}`;

    return origin.concat(path);
  }

  throw new Error(
    'EXPO_PUBLIC_API_BASE_URL environment variable is not defined',
  );
};