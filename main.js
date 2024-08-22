const electron = require('electron');
const url = require('url');
const path = require('path');
const { exec } = require('child_process');

const{app, BrowserWindow, Menu, ipcMain} = electron;
// This can also be written as :
// const { app, BrowserWindow } = require('electron');

// SET ENV
// process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true, // Enables Node.js integration
            contextIsolation: false // Disables context isolation
        }
    });
    // Load html file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    })); // This means passing the path file://dirname/mainWindow.html to loadUrl
    // This can also be written as :
    // mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Quit app when closed
    mainWindow.on('closed', function(){
    app.quit();
  });

    //Build menu from Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window 
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true, // Enables Node.js integration
            contextIsolation: false // Disables context isolation
        }
    });
    // Load html file into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    })); 
    // Garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    });
}

// Catch item:add
ipcMain.on('item:add', function(e, item){
    //console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create Menu Temaplate
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command + Q' : 'Ctrl + Q',
                // This is used for shortcut. Platform darwin is darwin for Mac.
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Apps',
        submenu: [
            {
                label: 'Paint',
                click() {
                    exec('start mspaint', (err) => {
                      if (err) {
                        console.error('Failed to open Paint:', err);
                      }
                    });
                }
            },
            {
                label: 'Wordpad',
                click() {
                    exec('start wordpad', (err) => {
                      if (err) {
                        console.error('Failed to open WordPad:', err);
                      }
                    });
                }
            },
            {
                label: 'Notepad',
                click() {
                    exec('start notepad', (err) => {
                      if (err) {
                        console.error('Failed to open Notepad:', err);
                      }
                    });
                }
            }
        ]
    }

];

// If we are on a Mac, then there will be a menu item 'Electron'
// Add empty object to menu in this case.

if (process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod

if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label:'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command + I' : 'Ctrl + I',
                click(item, focussedWindow){
                    focussedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}



