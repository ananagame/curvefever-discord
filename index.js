'use strict';

/* eslint-disable no-console */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const DiscordRPC = require('discord-rpc');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 340,
    height: 380
  });

  mainWindow.maximize()
  mainWindow.loadURL('http://curvefever.pro');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// don't change the client id if you want this example to work
const clientId = '485881415993524224';

// only needed for discord allowing spectate, join, ask to join
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();
let link, roomName

async function setActivity() {
  if (!rpc || !mainWindow) {
    return;
  }

  const boops = await mainWindow.webContents.executeJavaScript(`
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

  if (boops === null) {
    rpc.setActivity({
      details: 'Browsing',
      state: 'In the main menu',
      startTimestamp,
      largeImageKey: 'curve-fever-pro',
      largeImageText: 'Curve Fever Pro'
    })

    return
  }

  if (boops['type'] === 'Custom room' && boops['current'] === 'In queue') {
    link = await mainWindow.webContents.executeJavaScript(`(function(){return document.getElementById('roomLink').value})()`)
    roomName = await mainWindow.webContents.executeJavaScript(`document.getElementsByClassName('room-invite-friends__header')[0].getElementsByTagName('div')[0].getElementsByTagName('span')[1].innerHTML`)

    rpc.setActivity({
      details: boops['type'] + ', ' + boops['current'],
      state: roomName,
      startTimestamp,
      largeImageKey: 'curve-fever-pro',
      largeImageText: link
    })

    return
  }

  rpc.setActivity({
    details: boops['type'],
    state: boops['current'],
    startTimestamp,
    largeImageKey: 'curve-fever-pro',
    largeImageText: 'Curve Fever Pro'
  })
}

rpc.on('ready', () => {
  setActivity();

  // activity can only be set every 15 seconds
  setInterval(() => {
    setActivity();
  }, 1000);
});

rpc.login({ clientId }).catch(console.error);