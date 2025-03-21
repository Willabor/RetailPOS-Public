/************************************************************
 * main.js - Electron Main Process
 * ----------------------------------------------------------
 * Responsible for creating the main application window 
 * and handling overall app lifecycle events (e.g., when the 
 * app is ready, when windows are closed).
 ************************************************************/

const { app, BrowserWindow } = require('electron');
const path = require('path');

/*
  createWindow()
  ----------------------------
  1) Creates a new BrowserWindow instance to display 
     your front-end (index.html) in an Electron environment.
  2) Also sets the window size, webPreferences, etc.
*/
function createWindow() {
  // 1) Configure the BrowserWindow
  const mainWindow = new BrowserWindow({
    width: 1200,           // Initial window width
    height: 800,           // Initial window height
    webPreferences: {
      // Allows the renderer (index.html, etc.) to access Node.js APIs (like 'require', 'fs', etc.).
      nodeIntegration: true,

      // By default, Electron isolates scripts from Node. 
      // 'false' is simpler but less secure. 
      // For production, consider 'true' plus a preload script.
      contextIsolation: false,
    },
  });

  // 2) Load the index.html from your project:
  //    path.join(__dirname, '../../index.html') 
  //    means __dirname is "src/main", so we go two folders up to the project root.
  mainWindow.loadFile(path.join(__dirname, '../../index.html'));
}

/*
  app.whenReady()
  ----------------------------
  Invoked once Electron is fully initialized.
  We call createWindow() here to show our interface. 
*/
app.whenReady().then(() => {
  createWindow();

  /*
    On macOS, apps typically remain active even without 
    open windows. The 'activate' event fires when a user 
    clicks the dock icon and there are no open windows, 
    so we recreate one here if needed.
  */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/*
  app.on('window-all-closed')
  ----------------------------
  On Windows and Linux, it's typical to quit the app 
  when all windows are closed. On macOS, you might 
  keep running without any open windows.
*/
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
