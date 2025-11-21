const { contextBridge, ipcRenderer } = require('electron');

// Exposer des APIs sécurisées au renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Obtenir les chemins de l'application
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // Obtenir la version de l'application
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Indicateur qu'on est dans Electron
  isElectron: true,

  // Platform info
  platform: process.platform
});

// Log au démarrage
console.log('Preload script chargé');
console.log('Platform:', process.platform);
