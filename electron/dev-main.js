const { spawn } = require('child_process');
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // In development, load from the dev server
  // In production, load from the built files
  if (isDev) {
    // Try common development ports
    const devPorts = [5173, 5174, 3000, 8080];
    let portIndex = 0;
    
    const tryLoadPort = () => {
      if (portIndex >= devPorts.length) {
        console.error('Could not find development server on any common port');
        return;
      }
      
      const port = devPorts[portIndex];
      const url = `http://localhost:${port}`;
      
      mainWindow.loadURL(url)
        .catch(() => {
          portIndex++;
          setTimeout(tryLoadPort, 1000);
        });
    };
    
    tryLoadPort();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
