import { app, BrowserWindow, screen, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import fs from 'fs';
import log from 'electron-log';

// Setup error logging
log.transports.file.level = 'info';
log.transports.console.level = 'info';
Object.assign(console, log.functions);

log.info('Application starting...');
log.info('Version:', app.getVersion());
log.info('Platform:', process.platform);
log.info('User Data Path:', app.getPath('userData'));

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  dialog.showErrorBox('Critical Error (Uncaught Exception)', `An unexpected error occurred: ${error.message}\n\nLogs can be found at: ${log.transports.file.getFile().path}`);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let splashWindow;

async function createWindow() {
  // Set user data path for the Express server to locate DB
  process.env.USER_DATA_PATH = app.getPath('userData');

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.maximize();

  // Create splash window
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile('splash.html');

  const isDev = !app.isPackaged;
  const targetUrl = 'http://localhost:3000';

  if (isDev) {
    // In dev mode, the vite server is already started by `npm run dev`
    // We just wait for it to be accessible
    const checkServer = () => {
      const req = http.get(targetUrl, (res) => {
        mainWindow.loadURL(targetUrl);
        mainWindow.once('ready-to-show', () => {
          splashWindow.close();
          mainWindow.show();
        });
      });
      req.on('error', () => {
        setTimeout(checkServer, 500);
      });
    };
    checkServer();
  } else {
    // In production, start the Express server directly within the Electron main process
    try {
      process.env.NODE_ENV = 'production';
      log.info('Loading server.js...');
      // Import the bundled server.js
      await import('./server.js');
      log.info('server.js imported successfully');
      
      let attempts = 0;
      const MAX_ATTEMPTS = 60; // Wait up to 30 seconds

      const checkServer = () => {
        const port = global.SERVER_PORT || 3000;
        const currentTargetUrl = `http://localhost:${port}`;
        
        const req = http.get(currentTargetUrl, (res) => {
          log.info(`Server detected at ${currentTargetUrl}`);
          mainWindow.loadURL(currentTargetUrl);
          mainWindow.once('ready-to-show', () => {
            splashWindow.close();
            mainWindow.show();
          });
          
          mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            log.error(`Main window failed to load: ${errorDescription} (${errorCode})`);
          });
        });
        
        req.on('error', (e) => {
          attempts++;
          if (attempts > MAX_ATTEMPTS) {
            log.error('Server timed out or failed to start.');
            dialog.showErrorBox('Startup Error', `The application server failed to start within 30 seconds. This might be due to a blocked port or missing dependency.\n\nLogs: ${log.transports.file.getFile().path}`);
            app.quit();
            return;
          }
          setTimeout(checkServer, 500);
        });
      };
      
      checkServer();
    } catch (error) {
      log.error("Failed to load server.js", error);
      dialog.showErrorBox('Initialization Error', `Failed to load the backend server: ${error.message}\n\nCheck logs at: ${log.transports.file.getFile().path}`);
      setTimeout(() => app.quit(), 3000);
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
