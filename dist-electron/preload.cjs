"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const electronAPI = {
  // Menu events
  onMenuNewNote: (callback) => {
    electron.ipcRenderer.on("menu-new-note", callback);
  },
  onMenuSave: (callback) => {
    electron.ipcRenderer.on("menu-save", callback);
  },
  onMenuExportPDF: (callback) => {
    electron.ipcRenderer.on("menu-export-pdf", callback);
  },
  onMenuExportTXT: (callback) => {
    electron.ipcRenderer.on("menu-export-txt", callback);
  },
  onMenuNewFolder: (callback) => {
    electron.ipcRenderer.on("menu-new-folder", callback);
  },
  // File operations
  saveFile: (filename, content) => {
    return electron.ipcRenderer.invoke("save-file", filename, content);
  },
  showSaveDialog: (options) => {
    return electron.ipcRenderer.invoke("show-save-dialog", options);
  },
  // Google OAuth
  loginWithGoogle: () => {
    return electron.ipcRenderer.invoke("login-with-google");
  },
  // Remove listeners
  removeAllListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", electronAPI);
exports.electronAPI = electronAPI;
