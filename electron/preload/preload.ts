import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  // Menu events
  onMenuNewNote: (callback: () => void) => {
    ipcRenderer.on('menu-new-note', callback);
  },
  onMenuSave: (callback: () => void) => {
    ipcRenderer.on('menu-save', callback);
  },
  onMenuExportPDF: (callback: () => void) => {
    ipcRenderer.on('menu-export-pdf', callback);
  },
  onMenuExportTXT: (callback: () => void) => {
    ipcRenderer.on('menu-export-txt', callback);
  },
  onMenuNewFolder: (callback: () => void) => {
    ipcRenderer.on('menu-new-folder', callback);
  },
  
  // File operations
  saveFile: (filename: string, content: string) => {
    return ipcRenderer.invoke('save-file', filename, content);
  },
  
  showSaveDialog: (options: any) => {
    return ipcRenderer.invoke('show-save-dialog', options);
  },
  
  // Google OAuth
  loginWithGoogle: () => {
    return ipcRenderer.invoke('login-with-google');
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
