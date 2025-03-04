declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
  }
  
  export default function withPWA(pwaConfig: PWAConfig): (nextConfig: NextConfig) => NextConfig;
} 