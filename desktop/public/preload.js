const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Dialogs
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Menu events
  onNewPrescription: (callback) => ipcRenderer.on('menu-new-prescription', callback),
  onNewPatient: (callback) => ipcRenderer.on('menu-new-patient', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  
  // Store data (simple in-memory storage for desktop app)
  store: {
    get: (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.error('Error storing data:', e);
      }
    },
    remove: (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error removing data:', e);
      }
    }
  },
  
  // Network status
  isOnline: () => navigator.onLine,
  onOnline: (callback) => window.addEventListener('online', callback),
  onOffline: (callback) => window.addEventListener('offline', callback),
  
  // App lifecycle
  onAppClose: (callback) => {
    window.addEventListener('beforeunload', callback);
  }
});

// Set up error handling
window.addEventListener('error', (event) => {
  console.error('Renderer process error:', event.error);
});

// Set up unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});