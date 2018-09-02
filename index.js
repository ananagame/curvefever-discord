const {app, BrowserWindow} = require('electron')

var mainWindow = null;

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden',
    backgroundColor: '#000',
    useContentSize: false,
    autoHideMenuBar: true,
    resizable: true,
    center: true,
    frame: true,
    alwaysOnTop: false,
    title: 'Curve Fever Pro',
    icon: __dirname + '/icon.ico',
    webPreferences: {
      nodeIntegration: false,
      plugins: true,
    },
  });
  mainWindow.maximize()
  mainWindow.loadURL('http://curvefever.pro/');
});