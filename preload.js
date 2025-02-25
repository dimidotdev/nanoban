const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Funções do quadro
  exportBoard: () => ipcRenderer.invoke('export-board'),
  importBoard: () => ipcRenderer.invoke('import-board'),
  resetBoard: () => ipcRenderer.invoke('reset-board'),
  saveBoardData: (data) => ipcRenderer.invoke('save-board-data', data),
  loadBoardData: () => ipcRenderer.invoke('load-board-data'),
  
  // APIs do sistema
  getCurrentDateTime: () => ipcRenderer.invoke('get-current-datetime'),
  getCurrentUser: () => ipcRenderer.invoke('get-current-user'),
  
  // APIs da janela
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // APIs de tema
  saveTheme: (isDarkMode) => ipcRenderer.invoke('save-theme', isDarkMode),
  loadTheme: () => ipcRenderer.invoke('load-theme')
});