const { app, BrowserWindow } = require('electron')
const { Client } = require('discord-rpc')

const windowParameters = {
    backgroundColor: '#000',
    useContentSize: false,
    autoHideMenuBar: true,
    resizable: true,
    center: true,
    frame: true,
    alwaysOnTop: false,
    title: 'Curve Fever Pro',
    webPreferences: {
      nodeIntegration: false,
      plugins: true,
    }
  },
  clientId = '485881415993524224',
  startTimestamp = new Date(),
  rpc = new Client({ transport: 'ipc' })

let mainWindow, link, roomName

app.on('ready', () => {
  mainWindow = new BrowserWindow(windowParameters)
  mainWindow.maximize()
  mainWindow.loadURL('http://curvefever.pro')
  mainWindow.on('closed', () => {
    mainWindow = null
  })
})

app.on('window-all-closed', () => {
  app.quit()
})

async function setActivity() {
  if (!rpc || !mainWindow) {
    return;
  }

  const infos = await mainWindow.webContents.executeJavaScript(`
  (function() {
    if (document.getElementsByClassName('room-invite-friends').length > 0) {
      return {'type': 'Custom room', 'current': 'In queue'}
    } else if (document.getElementsByClassName('room-invite-friends').length == 0 &&
      document.getElementsByClassName('room-players').length > 0) {
      return {'type': 'Quick play', 'current': 'In queue'}
    } else if (window.location.pathname.includes('/m/')) {
      return {'type': 'Custom room', 'current': 'Playing'}
    } else if (document.getElementsByClassName('c-user__right') == 0) {
      return {'type': 'Quick play', 'current': 'Playing'}
    }
  })()`);

  if (infos === null) {
    rpc.setActivity({
      details: 'Browsing',
      state: 'In the main menu',
      startTimestamp,
      largeImageKey: 'curve-fever-pro',
      largeImageText: 'Curve Fever Pro'
    })

    return
  }

  if (infos['type'] === 'Custom room' && infos['current'] === 'In queue') {
    link = await mainWindow.webContents.executeJavaScript(`(function(){return document.getElementById('roomLink').value})()`)
    roomName = await mainWindow.webContents.executeJavaScript(`document
    .getElementsByClassName('room-invite-friends__header')[0]
    .getElementsByTagName('div')[0]
    .getElementsByTagName('span')[1].innerHTML`)

    rpc.setActivity({
      details: infos['type'] + ', ' + infos['current'],
      state: 'Room: ' + roomName,
      startTimestamp,
      largeImageKey: 'curve-fever-pro',
      largeImageText: link
    })

    return
  }

  rpc.setActivity({
    details: infos['type'],
    state: infos['current'],
    startTimestamp,
    largeImageKey: 'curve-fever-pro',
    largeImageText: 'Curve Fever Pro'
  })
}

rpc.on('ready', () => {
  setActivity()

  // activity can only be set every 5 seconds
  setInterval(() => {
    setActivity()
  }, 5E2);
});

rpc.login({ clientId }).catch(console.error)