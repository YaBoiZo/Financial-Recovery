const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

function createWindow() {
    const win = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 960,
        minHeight: 640,
        title: 'Financial Recovery',
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 20, y: 20 },
        backgroundColor: '#0f1117',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        show: false,
    })

    if (app.isPackaged) {
        win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
    } else {
        win.loadURL('http://localhost:5173')
    }

    win.once('ready-to-show', () => win.show())

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
    })
}

function buildMenu() {
    const template = [
        {
            label: 'Financial Recovery',
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' }, { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
            ],
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' }, { role: 'forceReload' },
                { type: 'separator' },
                { role: 'togglefullscreen' },
            ],
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' }, { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' },
            ],
        },
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
    buildMenu()
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
