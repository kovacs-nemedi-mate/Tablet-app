import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const CONFIG_KEY = 'server_api_url';
const DEFAULT_PORT = 3000;

function normalizeServerUrl(value) {
  const trimmed = value?.trim();

  if (!trimmed) {
    throw new Error('Server URL cannot be empty');
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/$/, '');
  }

  if (/^[\w.-]+(?::\d+)?$/i.test(trimmed)) {
    return `http://${trimmed.includes(':') ? trimmed : `${trimmed}:${DEFAULT_PORT}`}`.replace(/\/$/, '');
  }

  return `http://${trimmed}`.replace(/\/$/, '');
}

function getExpoHostUrl() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0]?.trim();

  if (!host) {
    return null;
  }

  return normalizeServerUrl(`${host}:${DEFAULT_PORT}`);
}

const FALLBACK_URL = normalizeServerUrl(process.env.EXPO_PUBLIC_API_URL || getExpoHostUrl() || 'localhost');

// In-memory fallback storage
const memoryStorage = {};

export async function getServerUrl() {
  // Try SecureStore first
  try {
    const stored = await SecureStore.getItemAsync(CONFIG_KEY);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.warn('SecureStore read failed, using fallback:', error.message);
  }

  // Try memory storage
  if (memoryStorage[CONFIG_KEY]) {
    return memoryStorage[CONFIG_KEY];
  }

  return FALLBACK_URL;
}

export async function setServerUrl(url) {
  const trimmedUrl = normalizeServerUrl(url);

  // Try to save to SecureStore
  try {
    await SecureStore.setItemAsync(CONFIG_KEY, trimmedUrl);
  } catch (error) {
    console.warn('SecureStore write failed, using memory storage:', error.message);
  }

  // Always save to memory storage as fallback
  memoryStorage[CONFIG_KEY] = trimmedUrl;
}

export async function resetServerUrl() {
  // Try to remove from SecureStore
  try {
    await SecureStore.deleteItemAsync(CONFIG_KEY);
  } catch (error) {
    console.warn('SecureStore reset failed:', error.message);
  }

  // Clear memory storage
  delete memoryStorage[CONFIG_KEY];
}
