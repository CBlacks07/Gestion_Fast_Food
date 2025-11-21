const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const Store = require('electron-store');

// Configuration
const BACKEND_PORT = 3002;
const FRONTEND_PORT = 3002; // Backend servira aussi le frontend
const isDev = process.env.NODE_ENV === 'development';

// Store pour les paramètres persistants
const store = new Store();

let mainWindow = null;
let backendProcess = null;

// Chemins
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'database.db');
const backendPath = isDev
  ? path.join(__dirname, '../../backend')
  : path.join(process.resourcesPath, 'backend-dist');

console.log('User Data Path:', userDataPath);
console.log('Database Path:', dbPath);
console.log('Backend Path:', backendPath);

/**
 * Crée la fenêtre principale de l'application
 */
function createWindow() {
  // Récupérer les dimensions sauvegardées
  const windowBounds = store.get('windowBounds', {
    width: 1280,
    height: 800
  });

  mainWindow = new BrowserWindow({
    width: windowBounds.width,
    height: windowBounds.height,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Ne pas montrer avant que le contenu soit chargé
    backgroundColor: '#1e293b',
    title: 'Fast Food Management System'
  });

  // Sauvegarder les dimensions à la fermeture
  mainWindow.on('close', () => {
    if (!mainWindow.isMaximized()) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  });

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Ouvrir DevTools en développement
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Charger l'application
  loadApplication();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Démarre le serveur backend
 */
async function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('Démarrage du backend...');

    // Variables d'environnement pour le backend
    const env = {
      ...process.env,
      PORT: BACKEND_PORT.toString(),
      NODE_ENV: 'production',
      DATABASE_URL: `file:${dbPath}`,
      JWT_SECRET: store.get('jwtSecret', generateJWTSecret()),
      IS_ELECTRON: 'true',
      FRONTEND_URL: `http://localhost:${FRONTEND_PORT}`
    };

    // Sauvegarder le JWT secret s'il est nouveau
    if (!store.has('jwtSecret')) {
      store.set('jwtSecret', env.JWT_SECRET);
    }

    // Commande pour lancer le backend
    const backendScript = isDev
      ? path.join(backendPath, 'src/index.ts')
      : path.join(backendPath, 'index.js');

    const nodeCommand = isDev ? 'npx' : 'node';
    const nodeArgs = isDev
      ? ['tsx', backendScript]
      : [backendScript];

    console.log('Lancement:', nodeCommand, nodeArgs.join(' '));

    // Lancer le processus backend
    backendProcess = spawn(nodeCommand, nodeArgs, {
      cwd: backendPath,
      env,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Logger la sortie du backend
    backendProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      console.log('[Backend]', message);

      // Résoudre quand le serveur est prêt
      if (message.includes('Server listening') || message.includes(`listening on port ${BACKEND_PORT}`)) {
        console.log('Backend prêt sur le port', BACKEND_PORT);
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('[Backend Error]', data.toString());
    });

    backendProcess.on('error', (error) => {
      console.error('Erreur de démarrage du backend:', error);
      reject(error);
    });

    backendProcess.on('exit', (code) => {
      console.log(`Backend arrêté avec le code ${code}`);
      if (code !== 0 && code !== null) {
        reject(new Error(`Backend exited with code ${code}`));
      }
    });

    // Timeout de 30 secondes
    setTimeout(() => {
      reject(new Error('Timeout: le backend n\'a pas démarré dans les temps'));
    }, 30000);
  });
}

/**
 * Charge l'application dans la fenêtre
 */
async function loadApplication() {
  try {
    // Attendre que le backend soit prêt
    await waitForBackend();

    // Charger l'URL du frontend (servi par le backend)
    const url = `http://localhost:${BACKEND_PORT}`;
    console.log('Chargement de l\'application:', url);

    await mainWindow.loadURL(url);
  } catch (error) {
    console.error('Erreur lors du chargement:', error);

    // Afficher une page d'erreur
    mainWindow.loadFile(path.join(__dirname, 'error.html'));

    dialog.showErrorBox(
      'Erreur de démarrage',
      `Impossible de démarrer l'application:\n${error.message}`
    );
  }
}

/**
 * Attend que le backend soit accessible
 */
async function waitForBackend(maxAttempts = 30) {
  const http = require('http');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${BACKEND_PORT}/health`, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Status ${res.statusCode}`));
          }
        });

        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });

      console.log('Backend accessible!');
      return;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw new Error('Le backend n\'est pas accessible');
}

/**
 * Génère un secret JWT aléatoire
 */
function generateJWTSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Arrête proprement le backend
 */
function stopBackend() {
  return new Promise((resolve) => {
    if (backendProcess) {
      console.log('Arrêt du backend...');

      backendProcess.on('exit', () => {
        console.log('Backend arrêté');
        backendProcess = null;
        resolve();
      });

      backendProcess.kill('SIGTERM');

      // Force kill après 5 secondes
      setTimeout(() => {
        if (backendProcess) {
          console.log('Force kill du backend');
          backendProcess.kill('SIGKILL');
          backendProcess = null;
          resolve();
        }
      }, 5000);
    } else {
      resolve();
    }
  });
}

/**
 * Initialise la base de données
 */
async function initDatabase() {
  console.log('Initialisation de la base de données...');

  // Créer le dossier si nécessaire
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // La base sera créée automatiquement par Prisma
  console.log('Base de données initialisée');
}

// Événements IPC
ipcMain.handle('get-app-path', () => {
  return {
    userData: userDataPath,
    database: dbPath
  };
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Événements de l'application
app.whenReady().then(async () => {
  try {
    console.log('=================================');
    console.log('Fast Food Management System');
    console.log('Version:', app.getVersion());
    console.log('=================================');

    // Initialiser la base de données
    await initDatabase();

    // Démarrer le backend
    await startBackend();

    // Créer la fenêtre
    createWindow();

  } catch (error) {
    console.error('Erreur fatale au démarrage:', error);
    dialog.showErrorBox(
      'Erreur de démarrage',
      `L'application n'a pas pu démarrer:\n${error.message}`
    );
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  await stopBackend();
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Arrêt propre
app.on('before-quit', async (event) => {
  if (backendProcess) {
    event.preventDefault();
    await stopBackend();
    app.quit();
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Erreur', `Une erreur s'est produite:\n${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
