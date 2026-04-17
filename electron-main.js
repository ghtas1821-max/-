import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import { fork } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let splashWindow;
let serverProcess;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Initially hide to show after server is ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'public/icon.png') // Make sure this exists later
  });

  const url = isDev 
    ? 'http://localhost:3000' 
    : `http://localhost:3000`; // The express server will serve the dist

  mainWindow.loadURL(url);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
    }
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) serverProcess.kill();
    app.quit();
  });

  // Hide menu in production
  if (!isDev) {
    mainWindow.setMenuBarVisibility(false);
  }
}

function startServer() {
  // We point to server.ts directly in dev (via tsx) or the compiled JS in prod
  const serverPath = isDev 
    ? path.join(__dirname, 'server.ts')
    : path.join(__dirname, 'server.ts'); // In production we might need a better strategy if we don't compile server.ts to JS

  // Actually, for better-sqlite3 and native modules, running with TSX in development is fine.
  // In production build, we will package the whole thing.
  
  serverProcess = fork(serverPath, [], {
    env: { 
      ...process.env,
      NODE_ENV: isDev ? 'development' : 'production',
      DB_PATH: path.join(app.getPath('userData'), 'mena_business.db')
    },
    execArgv: isDev ? ['--loader', 'tsx'] : [] 
  });

  serverProcess.on('message', (msg) => {
    if (msg === 'server-ready') {
      createMainWindow();
    }
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

app.on('ready', () => {
  createSplashWindow();
  startServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
