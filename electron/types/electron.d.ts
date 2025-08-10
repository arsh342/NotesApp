export interface ElectronAPI {
  onMenuNewNote: (callback: () => void) => void;
  onMenuSave: (callback: () => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
