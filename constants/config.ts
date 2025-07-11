// constants/config.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
    return (
        process.env.EXPO_PUBLIC_API_URL ||
        Constants.expoConfig?.extra?.apiUrl ||
        'http://localhost:8000'
    );
};

export const colors = {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12',
    success: '#27ae60',
    dark: '#2c3e50',
    light: '#ecf0f1',
    white: '#ffffff',
    black: '#000000',
    gray: '#95a5a6',
};

export const borderRadius = {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: 'bold' as const,
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold' as const,
    },
    h3: {
        fontSize: 18,
        fontWeight: 'bold' as const,
    },
    body: {
        fontSize: 16,
    },
    caption: {
        fontSize: 12,
    },
};

export const API_CONFIG = {
    //   API_URL: getApiUrl(),
    API_URL: Platform.select({
        ios: 'http://localhost:8000',
        android: 'http://192.168.1.24:8000'
    }),
    timeout: 10000,
    maxRetries: 3,
    defaultLimit: 20,
};