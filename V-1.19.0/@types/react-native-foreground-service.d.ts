// types/react-native-foreground-service.d.ts
declare module 'react-native-foreground-service' {
    export interface ForegroundServiceConfig {
      id: number;
      title: string;
      text: string;
      icon: string;
      // Add more properties as needed
    }
  
    export class ForegroundService {
      static start(config: ForegroundServiceConfig): void;
      static stop(): void;
      static onTagDiscovered(callback: (tag: any) => void): void;
      // Add more methods as needed
    }
  }
  