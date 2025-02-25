const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const fs = require('fs');

// Versão simples do electron-is-dev
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Caminho para o arquivo de dados
const userDataPath = app.getPath('userData');
const storeFile = path.join(userDataPath, 'store.json');

// Funções para gerenciar os dados
function saveData(key, data) {
  const storeData = loadData();
  storeData[key] = data;
  fs.writeFileSync(storeFile, JSON.stringify(storeData, null, 2));
}

function loadData() {
  try {
    if (fs.existsSync(storeFile)) {
      const data = fs.readFileSync(storeFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  }
  return {};
}

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // Carrega o arquivo HTML da aplicação
  mainWindow.loadFile('index.html');

  // Abre o DevTools automaticamente se estiver em desenvolvimento
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Impede que a janela seja fechada, apenas minimiza para a bandeja
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      return false;
    }
    return true;
  });
}

// Quando a aplicação estiver pronta, cria a janela
app.whenReady().then(() => {
  createWindow();
  
  // Cria o ícone na bandeja do sistema (system tray)
  tray = new Tray(path.join(__dirname, 'assets', 'icon-small.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Abrir Kanban', 
      click: () => {
        mainWindow.show();
      }
    },
    { 
      label: 'Sair', 
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Kanban Board');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
});

// Fecha o aplicativo quando todas as janelas forem fechadas (macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Comunicação IPC para salvar o tema
ipcMain.on('save-theme', (event, isDarkMode) => {
  const storeData = loadData();
  storeData.theme = { darkMode: isDarkMode };
  saveData('theme', isDarkMode);
});

// Comunicação IPC para carregar o tema
ipcMain.handle('load-theme', async () => {
  const data = loadData();
  return data.theme || { darkMode: false };
});

// Comunicação IPC para salvar dados
ipcMain.on('save-board', (event, boardData) => {
  saveData('boardData', boardData);
});

// Comunicação IPC para carregar dados
ipcMain.handle('load-board', async () => {
  const data = loadData();
  return data.boardData || {
    columns: {
      'column-1': {
        id: 'column-1',
        title: 'Backlog',
        taskIds: []
      },
      'column-2': {
        id: 'column-2',
        title: 'Em Andamento',
        taskIds: []
      },
      'column-3': {
        id: 'column-3',
        title: 'Concluído',
        taskIds: []
      }
    },
    columnOrder: ['column-1', 'column-2', 'column-3'],
    tasks: {}
  };
});