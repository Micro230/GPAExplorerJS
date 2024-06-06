const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});

//Sends are client to server.
//Ons are server to client
contextBridge.exposeInMainWorld('electronAPI', {
    initClient: (callback) => ipcRenderer.on('initClient', callback),
    saveDatabase: (data) => ipcRenderer.send('saveDatabase', data),
});