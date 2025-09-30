import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell, dialog} from 'electron'
import log from 'electron-log'
import path, { join, resolve } from 'path'
import {autoUpdater} from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import { db } from './server/drizzle'
import { seed } from './server/seed'
import { startServer } from './server/index'
import { initializeDatabase } from './server/seed'

// Create the browser window.
  let mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: path.join(__dirname, '../../resources/icon.png') ,
    au
  })

function createWindow() {
  console.log('====APP STARTED===')
  console.log('Environment ->', process.env.NODE_ENV)
  console.log('Is Dev?: ', is.dev)
  console.log('UserData Path: ', app.getPath('userData'))
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()

  })

  mainWindow.on('closed', ()=>{
    mainWindow = null;
    if(process.platform!=='darwin'){
      app.quit();
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  initializeDatabase()
  startServer()
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Better approach - use Electron's native print preview
ipcMain.handle('print-content', async (event, htmlContent, options = {}) => {
  console.log('Main: print-content handler called');
  
  try {
    // Create a hidden window
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Load HTML
    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use print with silent: false to show native print dialog
    // This will show a preview on most systems
    const printOptions = {
      silent: false,  // IMPORTANT: Shows system print dialog with preview
      printBackground: true,
      pageSize: 'A4',
      margins: {
        marginType: 'default'
      }
    };

    console.log('Opening system print dialog...');
    
    // This returns a promise that resolves when print dialog closes
    printWin.webContents.print(printOptions, (success, failureReason) => {
      console.log('Print dialog closed. Success:', success);
      if (!success) {
        console.log('Print failure reason:', failureReason);
      }
      // Close window after printing
      setTimeout(() => {
        printWin.close();
      }, 100);
    });

    return { success: true };
    
  } catch (error) {
    console.error('Main: Print error:', error);
    return { success: false, error: error.message };
  }
});

  createWindow()
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify();
    }, 1000 * 60 * 15);

  autoUpdater.on('update-available', (info)=>{
    dialog.showMessageBox({
      type: "info",
      title: "Nouvelle Mise à Jour Disponible",
      message: `Nouvelle version (${info.version}) est disponible. Voulez-vous la télécharger?`,
      buttons:['Télécharger', 'Aprés']
    }).then(result=>{
      if(result.response===0){
        //Download Clicked aya updati
        autoUpdater.downloadUpdate();
      }
    });
  });

  autoUpdater.on('download-progress', (progressTrack)=>{
    log.info('Progression du téléchargement', progressTrack);
    if(mainWindow){
      mainWindow.webContents.send('download-progress', progressTrack)
    }
  })

  autoUpdater.on('update-downloaded', ()=>{
    dialog.showMessageBox({
      type: 'info',
      title:'Mise à jour prete',
      message:'Mise à jour téléchargé avec succés et va être installé au prochain redémarrage. Redémarrer maintent?',
      buttons:['Redémarrer', 'Pas maintenant']
    }).then(result=>{
      if(result.response===0){
        autoUpdater.quitAndInstall()
      }
    })
  })

  autoUpdater.on('error', (err)=>{
    console.error('Autoupdater error: ', err)
    dialog.showErrorBox('Erreur de Mise à jour','Un erreur est survenu lors de la mise à jour, veuillez réessayer plus tard')
  })

  ///////////////TEST AREA////////////////
  const SEED_ENV = import.meta.env.M_VITE_SEED === 'true'
  if (SEED_ENV) {
    await seed()
  }

  const products = await db.query.products.findMany({
    with: {
      invoiceItems: true
    }
  })
  console.log({ products })
  ///////////////TEST AREA////////////////

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Add after the print-content handler
  ipcMain.handle('export-pdf', async (event, htmlContent, options = {}) => {
    console.log('Main: export-pdf handler called')

    try {
      const { dialog } = require('electron')
      const fs = require('fs').promises
      const path = require('path')

      // Determine save path
      let savePath
      if (options.filePath) {
        savePath = options.filePath
      } else {
        // Show save dialog
        const result = await dialog.showSaveDialog({
          title: 'Enregistrer le PDF',
          defaultPath: options.defaultFileName || 'facture.pdf',
          filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        })

        if (result.canceled) {
          return { success: false, canceled: true }
        }
        savePath = result.filePath
      }

      // Create hidden window for PDF generation
      const pdfWin = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Generate PDF
      const pdfData = await pdfWin.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      })

      // Save PDF
      await fs.writeFile(savePath, pdfData)

      pdfWin.close()

      console.log('PDF saved to:', savePath)
      return { success: true, filePath: savePath }
    } catch (error) {
      console.error('Main: PDF export error:', error)
      return { success: false, error: error.message }
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


