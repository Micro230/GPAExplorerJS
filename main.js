const { app, BrowserWindow, ipcMain } = require('electron')
const FileSystem = require('fs');
const path = require('path');
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const IMGData = require('./imgdata');

async function createWindow() {
    const contextMenuModule = await import('electron-context-menu');
    const contextMenu = contextMenuModule.default;

    const mainWindow = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    mainWindow.loadFile('index.html');
    mainWindow.setMenu(null)
    //Dev tools
    //mainWindow.webContents.openDevTools();
    
    var data = [];
    function ServerLoadDatabase() {
        const databaseDir = path.join(__dirname, 'database');
        const isImage = (fileName) => {
            const ext = path.extname(fileName).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext);
        };
        
        FileSystem.readdir(databaseDir, (err, folders) => {
            if (err) {
                console.error(`Unable to scan database directory: ${err}`);
                return;
            }
    
            folders.forEach((folder) => {
                const folderPath = path.join(databaseDir, folder);
                FileSystem.stat(folderPath, (err, stats) => {
                    if (err) {
                        console.error(`Unable to stat folder: ${err}`);
                        return;
                    }
    
                    if (stats.isDirectory()) {
                        FileSystem.readdir(folderPath, (err, files) => {
                            if (err) {
                                console.error(`Unable to read folder: ${err}`);
                                return;
                            }
    
                            //const imageFiles = files.filter((file) => isImage(file)); Just the file name
                            for(const index in files) {
                                const file = files[index];
                                if(!file.endsWith(".json")) {//Filter out JSONs since they will be grabbed separately.
                                    const filePath = path.relative(databaseDir, path.join(folderPath, file)).replace(/\\/g, '/');
                                    const jsonPath = path.join(folderPath, file) + ".json";
                                    if (FileSystem.existsSync(jsonPath)) {
                                        FileSystem.readFile(jsonPath, (err, d) => {
                                            //console.log(JSON.parse(d));
                                            let formatted = JSON.parse(d);
                                            const date = new Date(formatted.photoTakenTime.formatted);
                                            const month = monthNames[date.getMonth()];
                                            const day = date.getDate();
                                            const year = date.getFullYear();
                                            const hours = date.getHours();
                                            const minutes = date.getMinutes();
                                            const seconds = date.getSeconds();
                                            const time = `${hours}:${minutes}:${seconds}`;
                                            data.push(new IMGData(file, filePath, day, month, year, time, !isImage(file)));
                                        });
                                    }
                                    else {
                                        data.push(new IMGData(file, filePath, -1, -1, -1, -1, !isImage(file)))
                                    }
                                }
                            }
                            /*const imageFiles = files.filter((file) => isImage(file)).map(file => path.relative(databaseDir, path.join(folderPath, file)).replace(/\\/g, '/'));
                            const fldr = folderPath.split("\\");
                            data.push([fldr[fldr.length-1], imageFiles]);*/
                        });
                    }
                });
            });
        });
    }
    ServerLoadDatabase();

    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.send('initClient', data);
    });

    contextMenu({
        showSaveImageAs: false,
        showCopyImage: false,
        showSelectAll: false,
        showInspectElement: false,
        showCopyLink: false,
        showSearchWithGoogle: false,
        prepend: (defaultActions, parameters, browserWindow) => [
            {
                label: 'Send To Recycle Bin',
                visible: parameters.mediaType === 'image',
                click: () => {
                    
                }
            },
            {
                label: 'Rename: ' + (parameters.srcURL.split("/")[parameters.srcURL.split("/").length-1]).replaceAll("%20", " "),
                visible: parameters.mediaType === 'image',
                click: () => {
                    
                }
            }
        ]
    });
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})