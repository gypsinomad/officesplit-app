import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gypsinomad.officesplit',
  appName: 'OfficeSplit',
  webDir: 'dist',
  plugins: {
    SplashScreen: { launchShowDuration: 2000, backgroundColor: '#1e40af' },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    StatusBar: { style: 'Dark', backgroundColor: '#1e40af' },
  },
};

export default config;
