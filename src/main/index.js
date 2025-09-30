import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import log from 'electron-log'
import path, { join, resolve } from 'path'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import { db } from './server/drizzle'
import { seed } from './server/seed'
import { startServer } from './server/index'
import { initializeDatabase } from './server/seed'

let mainWindow = null

function createWindow() {
  console.log('====APP STARTED===')
  console.log('Environment ->', process.env.NODE_ENV)
  console.log('Is Dev?: ', is.dev)
  console.log('UserData Path: ', app.getPath('userData'))

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: path.join(__dirname, '../../resources/icon.png')
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  initializeDatabase()
  startServer()
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  // Print handler
  ipcMain.handle('print-content', async (event, htmlContent, options = {}) => {
    console.log('Main: print-content handler called')

    try {
      const printWin = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      await printWin.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
      )
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const printOptions = {
        silent: false,
        printBackground: true,
        pageSize: 'A4',
        margins: {
          marginType: 'default'
        }
      }

      console.log('Opening system print dialog...')

      return new Promise((resolve) => {
        printWin.webContents.print(printOptions, (success, failureReason) => {
          console.log('Print dialog closed. Success:', success)
          if (!success) {
            console.log('Print failure reason:', failureReason)
          }
          setTimeout(() => {
            printWin.close()
          }, 100)
          resolve({ success })
        })
      })
    } catch (error) {
      console.error('Main: Print error:', error)
      return { success: false, error: error.message }
    }
  })

  // PDF Export handler
  ipcMain.handle('export-pdf', async (event, htmlContent, options = {}) => {
    console.log('Main: export-pdf handler called')

    try {
      let savePath
      if (options.filePath) {
        savePath = options.filePath
      } else {
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

      const pdfWin = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      })

      await pdfWin.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
      )
      await new Promise((resolve) => setTimeout(resolve, 500))

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

      const fs = require('fs').promises
      await fs.writeFile(savePath, pdfData)

      pdfWin.close()

      console.log('PDF saved to:', savePath)
      return { success: true, filePath: savePath }
    } catch (error) {
      console.error('Main: PDF export error:', error)
      return { success: false, error: error.message }
    }
  })

  createWindow()
  
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify()
  }, 1000 * 60 * 15)

  autoUpdater.on('update-available', (info) => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Nouvelle Mise à Jour Disponible',
        message: `Nouvelle version (${info.version}) est disponible. Voulez-vous la télécharger?`,
        buttons: ['Télécharger', 'Aprés']
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate()
        }
      })
  })

  autoUpdater.on('download-progress', (progressTrack) => {
    log.info('Progression du téléchargement', progressTrack)
    if (mainWindow) {
      mainWindow.webContents.send('download-progress', progressTrack)
    }
  })

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Mise à jour prete',
        message:
          'Mise à jour téléchargé avec succés et va être installé au prochain redémarrage. Redémarrer maintent?',
        buttons: ['Redémarrer', 'Pas maintenant']
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })

  autoUpdater.on('error', (err) => {
    console.error('Autoupdater error: ', err)
    dialog.showErrorBox(
      'Erreur de Mise à jour',
      'Un erreur est survenu lors de la mise à jour, veuillez réessayer plus tard'
    )
  })


  try {
  const products = await db.query.products.findMany({
    with: {
      invoiceItems: true
    }
  })
  console.log({ products })
} catch (error) {
  console.error('Failed to query products:', error.message)
}

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})