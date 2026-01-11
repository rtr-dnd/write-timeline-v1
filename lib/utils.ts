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
  const useLocal = store$.settings.useLocalApi.peek();

  if (useLocal) {
    const origin =
      Constants.experienceUrl?.replace('exp://', 'http://') ??
      `http://${Constants.expoConfig?.hostUri ?? 'localhost:8081'}`;
    return origin.concat(path);
  }

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