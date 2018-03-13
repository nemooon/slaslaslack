'use strict';

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('ready', function () {

    var size = electron.screen.getPrimaryDisplay().size;

    var debug = true
    , debug = false;

    if (debug) {
        // ブラウザ(Chromium)の起動, 初期画面のロード
        mainWindow = new BrowserWindow({
            left  : 0,
            top   : 0,
            width : 800,
            height: 500,
            show  : true
        });
    } else {
        // ブラウザ(Chromium)の起動, 初期画面のロード
        mainWindow = new BrowserWindow({
            left       : 0,
            top        : 0,
            width      : size.width,   // 最大サイズで表示する
            height     : size.height, // 最大サイズで表示する
            frame      : false,      // ウィンドウフレームを非表示に
            show       : true,
            transparent: true, // 背景を透明に
            resizable  : false,
            type       : 'desktop'
        });

        // 透明な部分のマウスのクリックを検知させない
        mainWindow.setIgnoreMouseEvents(true);

        mainWindow.maximize();
    }

    mainWindow.loadURL('file://' + __dirname + '/view/index.html?home=' + app.getPath('home'));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});