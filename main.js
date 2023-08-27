const { app, BrowserWindow} = require('electron')
let win;
const remoteMain = require('@electron/remote/main');
remoteMain.initialize();



const createWindow = () => {


   win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
  },
    width: 800,
    height: 600
  })

  win.loadFile('ui/index.html')
}

app.whenReady().then(() => {
  createWindow()
  
  remoteMain.enable(win.webContents)
})



