import AsyncStorage from '@react-native-async-storage/async-storage';

const storageListeners = new Map<string, Set<(value: unknown) => void>>();

export async function readStorage<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`Unable to read storage key: ${key}`, error);
    return fallback;
  }
}

export async function writeStorage<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    notifyStorageListeners(key, value);
  } catch (error) {
    console.warn(`Unable to write storage key: ${key}`, error);
  }
}

export async function writeStorageStrict<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  notifyStorageListeners(key, value);
}

export function subscribeStorage<T>(key: string, listener: (value: T) => void): () => void {
  const listeners = storageListeners.get(key) ?? new Set<(value: unknown) => void>();
  const typedListener = listener as (value: unknown) => void;
  listeners.add(typedListener);
  storageListeners.set(key, listeners);

  return () => {
    listeners.delete(typedListener);
    if (listeners.size === 0) storageListeners.delete(key);
  };
}

function notifyStorageListeners<T>(key: string, value: T): void {
  storageListeners.get(key)?.forEach((listener) => listener(value));
}
