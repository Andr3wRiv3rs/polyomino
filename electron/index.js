process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true

const { app, BrowserWindow } = require('electron')
const path = require('path')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, 
      devTools: process.env.NODE_ENV === 'development',
    },
  })

  mainWindow.setMenuBarVisibility(false)

  if (process.env.NODE_ENV !== 'development') mainWindow.loadFile('index.html')
  
  else {
    mainWindow.loadURL('http://localhost:53874')
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
