import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.oiltrade.app',
  appName: 'OilTrade',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0a0d12',
      showSpinner: false,
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '851289814310-lkbao0feve2hmi438hvitock9r62a4pu.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
