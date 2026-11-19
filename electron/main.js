const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path   = require('path');
const http   = require('http');
const fs     = require('fs');

const isDev = !app.isPackaged;

let mainWindow   = null;
let splashWindow = null;
let javaProcess  = null;

// ── Paths ───────────────────────────────────────────────────────────────────

const JAR = isDev
  ? path.join(__dirname, '..', 'backend', 'target', 'pointage-backend.jar')
  : path.join(process.resourcesPath, 'backend.jar');

const FRONTEND = isDev
  ? null   // Vite dev server handles this
  : path.join(process.resourcesPath, 'app', 'index.html');

// Writable user-data directory for the H2 database file
// Mac:     ~/Library/Application Support/all-menuiserie/data/
// Windows: %APPDATA%\all-menuiserie\data\
const DATA_DIR = path.join(app.getPath('userData'), 'data');

// ── Java ────────────────────────────────────────────────────────────────────

function resolveJava() {
  // 1. Try a JRE bundled alongside the app (place it at resources/jre/)
  const bundled = path.join(
    app.isPackaged ? process.resourcesPath : path.join(__dirname, 'jre'),
    'bin',
    process.platform === 'win32' ? 'java.exe' : 'java'
  );
  if (fs.existsSync(bundled)) return bundled;
  // 2. Fall back to system Java (must be on PATH)
  return 'java';
}

// ── Backend ─────────────────────────────────────────────────────────────────

function startBackend() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Pass the user-data path so H2 stores its file in a writable location.
  // Backslashes on Windows must be forward-slashed inside the JDBC URL.
  const dbFile = path.join(DATA_DIR, 'pointage').replace(/\\/g, '/');
  const dbUrl  = `jdbc:h2:file:${dbFile};MODE=MySQL;AUTO_SERVER=FALSE`;

  javaProcess = spawn(resolveJava(), [
    '-jar', JAR,
    '--spring.profiles.active=prod',
    `--spring.datasource.url=${dbUrl}`,
  ], {
    windowsHide: true,   // no console window on Windows
    stdio: 'pipe',
  });

  // Pipe Spring Boot output to Electron's console (visible in DevTools)
  javaProcess.stdout?.on('data', d => process.stdout.write(`[backend] ${d}`));
  javaProcess.stderr?.on('data', d => process.stderr.write(`[backend] ${d}`));

  javaProcess.on('error', err => {
    dialog.showErrorBox(
      'Java introuvable',
      `Impossible de lancer Java :\n${err.message}\n\nJava 17 doit être installé et accessible.`
    );
    app.quit();
  });
}

// Poll localhost:8080 until Spring Boot is ready (up to ~60 s)
function waitForBackend(maxTries = 60) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const attempt = () => {
      const req = http.get('http://localhost:8080/api/employes', res => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (++tries >= maxTries) return reject(new Error('timeout'));
        setTimeout(attempt, 1000);
      });
      req.setTimeout(800, () => req.destroy());
    };
    attempt();
  });
}

// ── Windows ─────────────────────────────────────────────────────────────────

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 440, height: 280,
    frame: false, resizable: false, center: true,
    alwaysOnTop: true,
    backgroundColor: '#0d2137',
    webPreferences: { nodeIntegration: false },
  });

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;background:#0d2137;display:flex;align-items:center;
  justify-content:center;height:100vh;font-family:'Segoe UI',Arial,sans-serif;
  flex-direction:column;gap:14px;color:white;user-select:none;">
  <div style="font-size:30px;font-weight:700;letter-spacing:3px;color:#4a9eca">
    ALL MENUISERIE
  </div>
  <div style="font-size:12px;color:#94abbe;letter-spacing:1px">
    Démarrage en cours…
  </div>
  <div style="width:240px;height:4px;background:#1a3a5c;border-radius:2px;
    margin-top:6px;overflow:hidden">
    <div style="height:100%;width:40%;background:#4a9eca;border-radius:2px;
      animation:s 1.4s ease-in-out infinite"></div>
  </div>
  <style>
    @keyframes s { 0%{transform:translateX(-100%)} 100%{transform:translateX(500%)} }
  </style>
</body>
</html>`;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function createMain() {
  mainWindow = new BrowserWindow({
    width: 1366, height: 820,
    minWidth: 960, minHeight: 640,
    title: 'ALL Menuiserie — Pointage',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(FRONTEND);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    splashWindow?.close();
    splashWindow = null;
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  createSplash();

  if (!isDev) {
    startBackend();
    try {
      await waitForBackend();
    } catch {
      dialog.showErrorBox(
        'Erreur de démarrage',
        'Le serveur interne n\'a pas répondu après 60 secondes.\n' +
        'Vérifiez que le port 8080 est libre et que Java est installé.'
      );
      app.quit();
      return;
    }
  }

  createMain();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMain();
});

app.on('will-quit', () => {
  if (javaProcess) {
    javaProcess.kill();
    javaProcess = null;
  }
});
