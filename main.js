const electron = require('electron');
const { app } = electron;
const { BrowserWindow } = electron;
path = require('path');
const url = require('url');
const ipc = electron.ipcMain;

let window;

const createWindow = () => {
    window = new BrowserWindow({
        backgroundColor: '#000000',
        width: 330,
        height: 451,
        webPreferences: {
            nodeIntegration: true
        },
        show: false
    });
    window.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true
    }));
    window.on('closed', () => {
        window = null;
    });
    window.once('ready-to-show', () => {
        window.show();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (window === null) {
        createWindow();
    }
});


// listen for resize
ipc.on('resize', (e, x, y) => {
    window.setSize(x, y, true);
});