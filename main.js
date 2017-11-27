const electron = require('electron')
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron

let mainWindow
let addWindow

const defaultWidth = 500
const defaultHeight = 600

// Listen for app to be ready
app.on('ready', function () {
  // Create new mainWindow
  mainWindow = new BrowserWindow({
    width: defaultWidth,
    height: defaultHeight
  })

  // Load html into mainWindow
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './windows/mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Quit app when closed
  mainWindow.on('closed', function () {
    app.quit()
  })

  // Build meni from mainMenuTemplate
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

  // Insert menu
  Menu.setApplicationMenu(mainMenu)
})

// Handle add createAddWindow
const createAddWindow = () => {
  addWindow = new BrowserWindow({
    width: defaultWidth,
    height: defaultHeight,
    title: 'Add Key'
  })

  // Load html into mainWindow
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, '/windows/addKey.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Garbarge collection Handle
  addWindow.on('close', function () {
    addWindow = null
  })
}

// Catch item:add
ipcMain.on('item:add', function (e, item) {
  mainWindow.webContents.send('item:add', item)
  addWindow.close()
})

ipcMain.on('form:item:open', function (e, item) {
  createAddWindow()
})

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Key',
        accelerator: process.platform === 'darwin' ? 'Command+N' : 'Ctrl+N',
        click () {
          createAddWindow()
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+W' : 'Ctrl+Q',
        click () {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
    ]
  }
]

// If mac, add empty object to Menu
if (process.platform === 'darwin') {
  mainMenuTemplate.unshift({})
}

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toogle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click (item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
