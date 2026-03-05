// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.britiumexpress.app', // <--- This is your unique App ID
  appName: 'BEDA',
  webDir: 'dist',
  bundledWebRuntime: false
};

export default config;