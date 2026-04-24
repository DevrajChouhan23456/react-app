import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PATH = '/api';
const DEFAULT_PORT = 3001;

let warnedAboutInvalidApiUrl = false;

function stripQuotes(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function hasHttpProtocol(value: string) {
  return /^https?:\/\//i.test(value);
}

function hasExpoProtocol(value: string) {
  return /^exp(s)?:\/\//i.test(value);
}

function normalizeBaseUrl(value: string) {
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.endsWith(API_PATH) ? trimmed : `${trimmed}${API_PATH}`;
}

function getHostname(candidate?: string | null) {
  if (!candidate) return null;

  try {
    return new URL(candidate).hostname;
  } catch {
    try {
      return new URL(`http://${candidate}`).hostname;
    } catch {
      return null;
    }
  }
}

function getExpoDevHost() {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
    Constants.experienceUrl,
  ];

  for (const candidate of candidates) {
    const hostname = getHostname(candidate);
    if (hostname) return hostname;
  }

  return null;
}

function getFallbackHost() {
  const expoHost = getExpoDevHost();

  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    return expoHost;
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export function getApiBaseUrl() {
  const configuredUrl = stripQuotes(process.env.EXPO_PUBLIC_API_URL ?? '');

  if (configuredUrl) {
    if (hasHttpProtocol(configuredUrl)) {
      return normalizeBaseUrl(configuredUrl);
    }

    if ((hasExpoProtocol(configuredUrl) || configuredUrl.includes(':')) && !warnedAboutInvalidApiUrl) {
      warnedAboutInvalidApiUrl = true;
      console.warn(
        `[api] Ignoring EXPO_PUBLIC_API_URL="${configuredUrl}". ` +
          'Use an http(s) backend URL such as http://192.168.1.10:3001/api.'
      );
    }
  }

  return `http://${getFallbackHost()}:${DEFAULT_PORT}${API_PATH}`;
}

export function getApiSetupHint() {
  return (
    `Backend not reachable at ${getApiBaseUrl()}. ` +
    'Start the local payments server on port 3001, or set EXPO_PUBLIC_API_URL ' +
    'to a reachable http(s) backend URL.'
  );
}
