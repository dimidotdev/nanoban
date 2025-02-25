const { app, BrowserWindow, ipcMain, Menu, Tray, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Caminho para o arquivo de dados
const userDataPath = app.getPath('userData');
const storeFile = path.join(userDataPath, 'store.json');
const getDataPath = () => path.join(app.getPath('userData'), 'board-data.json');

// Dados iniciais do quadro
const initialBoardData = {
  tasks: {},
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
  columnOrder: ['column-1', 'column-2', 'column-3']
};

let mainWindow;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    // Removendo o frame padrão
    frame: false,
    // Adicionando transparência (opcional, para bordas arredondadas)
    transparent: false,
    // Tornando a janela arrastável (opcional)
    titleBarStyle: 'hidden'
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' https://unpkg.com https://cdn.jsdelivr.net; " +
          "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net; " +
          "style-src 'self' 'unsafe-inline';"
        ]
      }
    });
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

const loadData = () => {
  try {
    if (fs.existsSync(storeFile)) {
      const data = fs.readFileSync(storeFile, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return {};
  }
};

const saveData = (key, value) => {
  try {
    const data = loadData();
    data[key] = value;
    fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
};

// Quando a aplicação estiver pronta, cria a janela
app.whenReady().then(() => {
  createWindow();
  
  // Cria o ícone na bandeja do sistema (system tray)
  tray = new Tray(path.join(__dirname, 'assets', 'icon-small.png'));
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Abrir Nanoban', 
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
  
  tray.setToolTip('Nanoban');
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
ipcMain.handle('save-theme', async (_, isDarkMode) => {
  try {
    saveData('theme', { darkMode: isDarkMode });
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar tema:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-theme', async () => {
  try {
    const data = loadData();
    return data.theme || { darkMode: false };
  } catch (error) {
    console.error('Erro ao carregar tema:', error);
    return { darkMode: false };
  }
});

// Comunicação IPC para salvar dados
ipcMain.on('save-board', (event, boardData) => {
  saveBoardData('boardData', boardData);
});

ipcMain.handle('get-current-datetime', () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace('T', ' ');
});

ipcMain.handle('get-current-user', () => {
  return process.env.USERNAME || process.env.USER || 'Usuário';
});

// Comunicação IPC para carregar dados
ipcMain.handle('load-board', async () => {
  return loadBoardData().boardData || {
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

// Handler para salvar dados
ipcMain.handle('save-board-data', async (_, data) => {
  try {
    const dataPath = getDataPath();
    await fsPromises.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return { success: false, error: error.message };
  }
});

// Handler para carregar dados
ipcMain.handle('load-board-data', async () => {
  try {
    const dataPath = getDataPath();
    
    if (!fs.existsSync(dataPath)) {
      // Se o arquivo não existir, retorna os dados iniciais
      await fsPromises.writeFile(dataPath, JSON.stringify(initialBoardData, null, 2), 'utf8');
      return initialBoardData;
    }

    const data = await fsPromises.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return initialBoardData;
  }
});

// Handler para exportar dados
ipcMain.handle('export-board', async () => {
  try {
    const data = await fsPromises.readFile(getDataPath(), 'utf8');
    
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Exportar Dados do Nanoban',
      defaultPath: `nanoban-backup-${new Date().toISOString().slice(0,10)}.json`,
      filters: [{ name: 'Arquivos JSON', extensions: ['json'] }]
    });

    if (canceled || !filePath) {
      return { success: false, message: 'Operação cancelada' };
    }

    await fsPromises.writeFile(filePath, data, 'utf8');
    return { success: true, message: 'Dados exportados com sucesso' };
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    return { success: false, message: `Erro ao exportar dados: ${error.message}` };
  }
});

// Handler para importar dados
ipcMain.handle('import-board', async () => {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Importar Dados do Nanoban',
      filters: [{ name: 'Arquivos JSON', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) {
      return { success: false, message: 'Operação cancelada' };
    }

    const jsonData = await fsPromises.readFile(filePaths[0], 'utf8');
    const data = JSON.parse(jsonData);

    // Validar estrutura dos dados
    if (!data.columns || !data.tasks || !data.columnOrder) {
      return { success: false, message: 'Arquivo inválido' };
    }

    await fsPromises.writeFile(getDataPath(), jsonData, 'utf8');
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return { success: false, message: `Erro ao importar dados: ${error.message}` };
  }
});

// Handler para resetar dados
ipcMain.handle('reset-board', async () => {
  try {
    await fsPromises.writeFile(
      getDataPath(),
      JSON.stringify(initialBoardData, null, 2),
      'utf8'
    );
    return { success: true, data: initialBoardData };
  } catch (error) {
    console.error('Erro ao resetar dados:', error);
    return { success: false, message: `Erro ao resetar dados: ${error.message}` };
  }
});

// Handlers para controle da janela
ipcMain.handle('window-minimize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.handle('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});