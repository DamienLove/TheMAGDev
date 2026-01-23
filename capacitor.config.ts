import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.themag.dev',
  appName: 'TheMAGDev',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
