import { app, BrowserWindow, Menu, shell, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { isDev } from './util.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

// Google OAuth configuration
const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
  authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  redirectUri: 'http://localhost:3000'
};

const createWindow = (): void => {
  // Get the correct path to the assets directory
  const iconPath = isDev 
    ? join(process.cwd(), 'assets', 'icon.png')
    : join(process.resourcesPath, 'assets', 'icon.png');

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // Menu configuration
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-note');
          },
        },
        {
          label: 'New Folder',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            mainWindow.webContents.send('menu-new-folder');
          },
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save');
          },
        },
        { type: 'separator' },
        {
          label: 'Export as PDF',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-export-pdf');
          },
        },
        {
          label: 'Export as TXT',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => {
            mainWindow.webContents.send('menu-export-txt');
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (isDev) {
    console.log('Loading development URL');
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // In production, load from the packaged dist files
    const indexPath = join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
};

// IPC handlers
ipcMain.handle('save-file', async (event, filename: string, content: string) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (filePath) {
      await writeFile(filePath, content);
      return { success: true, path: filePath };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(options);
    return result;
  } catch (error) {
    console.error('Error showing save dialog:', error);
    return { canceled: true };
  }
});

// Google OAuth handler
ipcMain.handle('login-with-google', async () => {
  return new Promise((resolve, reject) => {
    const authWindow = new BrowserWindow({
      width: 500,
      height: 600,
      show: true,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    const scope = 'profile email';
    const authUrl = `${googleOAuthConfig.authorizationUrl}?` +
      `client_id=${googleOAuthConfig.clientId}&` +
      `redirect_uri=${encodeURIComponent(googleOAuthConfig.redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline`;

    authWindow.loadURL(authUrl);

    authWindow.webContents.on('will-redirect', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      
      if (parsedUrl.origin === 'http://localhost:3000') {
        const code = parsedUrl.searchParams.get('code');
        const error = parsedUrl.searchParams.get('error');

        if (error) {
          reject(new Error(error));
          authWindow.close();
          return;
        }

        if (code) {
          // Exchange code for token
          exchangeCodeForToken(code)
            .then(tokenData => {
              resolve(tokenData);
              authWindow.close();
            })
            .catch(err => {
              reject(err);
              authWindow.close();
            });
        }
      }
    });

    authWindow.on('closed', () => {
      reject(new Error('Authentication window was closed'));
    });
  });
});

async function exchangeCodeForToken(code: string) {
  const tokenRequestBody = new URLSearchParams({
    client_id: googleOAuthConfig.clientId,
    client_secret: googleOAuthConfig.clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: googleOAuthConfig.redirectUri
  });

  const response = await fetch(googleOAuthConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: tokenRequestBody
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return await response.json();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
