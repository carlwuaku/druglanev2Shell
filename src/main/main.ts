/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { spawn } from 'child_process';
import {
  ACTIVATION_RESULT,
  CALL_ACTIVATION,
  GET_SERVER_URL,
  SERVER_URL_RECEIVED,
} from '../renderer/utils/stringKeys';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
const serverUrl: string = 'http://127.0.0.1:5100';

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

// ipcMain.on(CALL_ACTIVATION, async (event, key) => {
//   try {
//     let data = await verifyLicenseKey(key);
//     mainWindow?.webContents?.send(ACTIVATION_RESULT, {
//       data: data.data,
//       error: false,
//       message: '',
//     });
//   } catch (error) {
//     mainWindow?.webContents?.send(ACTIVATION_RESULT, {
//       data: null,
//       error: true,
//       message: error,
//     });
//   }
// });

function sendServerUrl() {
  mainWindow?.webContents?.send(
    SERVER_URL_RECEIVED,
    { data: serverUrl, time: new Date().toLocaleString() },
    serverUrl
  );
}

// ipcMain.on(GET_APP_DETAILS, getAppDetails);
// ipcMain.on(GET_SERVER_STATE, () => {
//   sendServerState(serverState);
// });

// ipcMain.on(RESTART_SERVER, async (event, data) => {
//   await spawnServer();
// });

// ipcMain.on(RESTART_APPLICATION, async (event, data) => {
//   restartApp();
// });

ipcMain.on(GET_SERVER_URL, sendServerUrl);

// ipcMain.on(GET_PREFERENCE, (event, data: { key: string }) => {
//   let value = store.get(data.key, defaultOptions[data.key]);
//   event.reply(PREFERENCE_RECEIVED, { name: data.key, value: value });
// });

// ipcMain.on(GET_PREFERENCES, (event) => {
//   store.openInEditor();
// });

// ipcMain.on(SET_PREFERENCE, (event, data: { key: string; value: any }) => {
//   try {
//     savePreference(data.key, data.value);
//     event.reply(PREFERENCE_SET, {
//       success: true,
//       message: 'Setting saved successfully',
//     });
//   } catch (error) {
//     event.reply(PREFERENCE_SET, { success: false, message: error });
//   }
// });

// ipcMain.on(SET_ADMIN_PASSWORD, (event, data: { password: string }) => {});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    const nestServer = spawn('node', [
      path.join(__dirname, '../server/main.js'),
    ]);

    nestServer.stdout.on('data', (data) => {
      console.log(`Nest.js Server: ${data}`);
    });

    nestServer.stderr.on('data', (data) => {
      console.error(`Nest.js Server Error: ${data}`);
    });
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
