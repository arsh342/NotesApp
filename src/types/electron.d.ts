interface ElectronAPI {
  onMenuNewNote: (callback: () => void) => void;
  onMenuSave: (callback: () => void) => void;
  onMenuExportPDF: (callback: () => void) => void;
  onMenuExportTXT: (callback: () => void) => void;
  onMenuNewFolder: (callback: () => void) => void;
  saveFile: (filename: string, content: string) => Promise<{ success: boolean; path?: string; cancelled?: boolean; error?: string }>;
  showSaveDialog: (options: any) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
