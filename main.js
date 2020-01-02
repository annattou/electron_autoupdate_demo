'use strict';

// 使用するモジュールとアプリケーションレベルで保持しておきたい変数(メインウィンドウ)を定義しています。
const { app, BrowserWindow, ipcMain } = require('electron');
//自動アップデート用
const { autoUpdater } = require('electron-updater');
const path = require('path')

//
let mainWindow;

//アプリケーションがキックされて、モジュールが読み込まれて用意ができたら(ready状態になったら)
//この関数が呼ばれます。
function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });

     //メインウィンドウにロードするHTMLファイルです。
    //こうやってGUIを構築していきます。
    //何故だか↓だと動かない。。。
    //electronバージョンが問題だった
    mainWindow.loadFile('index.html');

    //これだったら動いた。この書き方は上位互換があった、けど多分古い
    //mainWindow.loadURL('file://' + __dirname + '/index.html');

    //基本はChromeブラウザなので、デベロッパーツールが使えます。
    //ただ、通常のようにブラウザ画面の右クリックでは表示させることができません。
    //この行のコメントを外すことで、アプリの起動時に同時にデベロッパーツールを表示させることができます。
    //mainWindow.webContents.openDevTools()

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

//Electronの初期化が終わったら呼ばれる関数を定義します。
app.on('ready', () => {
    createWindow();
    //アップデートがないかチェックする
    autoUpdater.checkForUpdatesAndNotify();
});

// 全部のウィンドウが閉じられたときに呼ばれる関数です。WinやLinuxでは全部のウィンドウが閉じるとアプリも終了しますが、
//Macの場合はトレイなどに残ってしまうので、明示的にQuitを呼んでいます。
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

//非同期通信
ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

//event listener that will install the new version if the user selects “Restart”
ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

//自動更新
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
//自動更新
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

