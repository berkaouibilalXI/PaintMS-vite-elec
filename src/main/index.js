import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import log from 'electron-log'
import path, { join } from 'path'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import { initializeDatabase } from './server/seed.js'
import { startServer } from './server/index.js'
import { db } from './server/drizzle/index.js'
import fs from "fs/promises"

// Configure electron-log
log.transports.file.level = 'info'
autoUpdater.logger = log

let mainWindow = null

function createWindow() {
  console.log('====APP STARTED===')
  console.log('Environment ->', process.env.NODE_ENV)
  console.log('Is Dev?: ', is.dev)
  console.log('UserData Path: ', app.getPath('userData'))
  console.log('App Version:', app.getVersion())

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

// Setup auto-updater
function setupAutoUpdater() {
  // Skip in development
  if (is.dev) {
    log.info('Skipping auto-updater in development mode')
    return
  }

  log.info('Setting up auto-updater...')
  log.info('Current version:', app.getVersion())

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...')
    console.log('Checking for updates...')
  })

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info.version)
    console.log('Update available:', info.version)

    dialog
      .showMessageBox({
        type: 'info',
        title: 'Nouvelle Mise à Jour Disponible',
        message: `Nouvelle version (${info.version}) est disponible. Voulez-vous la télécharger?`,
        buttons: ['Télécharger', 'Après']
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate()
        }
      })
  })

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available. Current version is', info.version)
    console.log('No updates available. Current version:', info.version)
  })

  autoUpdater.on('download-progress', (progressTrack) => {
    log.info('Download progress:', progressTrack.percent)
    console.log('Download progress:', progressTrack.percent + '%')

    if (mainWindow) {
      mainWindow.webContents.send('download-progress', progressTrack)
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info.version)
    console.log('Update downloaded:', info.version)

    dialog
      .showMessageBox({
        type: 'info',
        title: 'Mise à jour prête',
        message: `Mise à jour téléchargée avec succès et va être installée au prochain redémarrage. Redémarrer maintenant?`,
        buttons: ['Redémarrer', 'Pas maintenant']
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall()
          autoUpdater.autoRunAppAfterInstall()
        }
      })
  })

  autoUpdater.on('error', (err) => {
    log.error('Auto-updater error:', err)
    console.error('Auto-updater error:', err)

    dialog.showErrorBox(
      'Erreur de Mise à jour',
      `Une erreur est survenue lors de la mise à jour: ${err.message}`
    )
  })

  // Check for updates immediately
  setTimeout(() => {
    log.info('Triggering initial update check...')
    autoUpdater.checkForUpdates()
  }, 3000) // Wait 3 seconds after app starts

  // Check every 15 minutes
  setInterval(
    () => {
      log.info('Periodic update check...')
      autoUpdater.checkForUpdates()
    },
    1000 * 60 * 15
  )
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

      await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const printOptions = {
        silent: false,
        printBackground: true,
        pageSize: 'A4',
        margins: {
          marginType: 'default'
        }
      }

      return new Promise((resolve) => {
        printWin.webContents.print(printOptions, (success, failureReason) => {
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

      await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
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

  // Setup auto-updater AFTER window is created
  setupAutoUpdater()

  // Test database query
  try {
    const products = await db.query.products.findMany({
      with: {
        invoiceItems: true
      }
    })
    console.log('Products loaded:', products.length)
  } catch (error) {
    console.error('Failed to query products:', error.message)
  }

  ipcMain.handle('backup-database', async (event) => {
    try {
      const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

      // Get database path (same logic as your drizzle/index.js)
      let dbPath
      if (isDev) {
        dbPath = path.join(process.cwd(), 'local.db')
      } else {
        const userDataPath = app.getPath('userData')
        dbPath = path.join(userDataPath, 'paintms.db')
      }

      console.log('Attempting to backup database from:', dbPath)

      // Check if database exists
      try {
        await fs.access(dbPath)
      } catch {
        return { success: false, error: 'Base de données introuvable' }
      }

      // Show save dialog
      const result = await dialog.showSaveDialog({
        title: 'Sauvegarder la base de données',
        defaultPath: `paintms-backup-${new Date().toISOString().split('T')[0]}.db`,
        filters: [
          { name: 'Database Files', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled) {
        return { success: false, canceled: true }
      }

      // Copy database file
      await fs.copyFile(dbPath, result.filePath)

      log.info('Database backed up to:', result.filePath)
      return { success: true, path: result.filePath }
    } catch (error) {
      log.error('Backup error:', error)
      return { success: false, error: error.message }
    }
  })

  // Database restore handler
  ipcMain.handle('restore-database', async (event) => {
    try {
      // Show warning dialog
      const confirmResult = await dialog.showMessageBox({
        type: 'warning',
        title: 'Restaurer la base de données',
        message: 'Cette action va remplacer votre base de données actuelle.',
        detail: 'Toutes les données non sauvegardées seront perdues. Voulez-vous continuer?',
        buttons: ['Annuler', 'Continuer'],
        defaultId: 0,
        cancelId: 0
      })

      if (confirmResult.response === 0) {
        return { success: false, canceled: true }
      }

      // Show open dialog
      const result = await dialog.showOpenDialog({
        title: 'Sélectionner une sauvegarde',
        filters: [
          { name: 'Database Files', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      })

      if (result.canceled) {
        return { success: false, canceled: true }
      }

      const backupPath = result.filePaths[0]
      const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

      // Target database path
      let dbPath
      if (isDev) {
        dbPath = path.join(process.cwd(), 'local.db')
      } else {
        const userDataPath = app.getPath('userData')
        dbPath = path.join(userDataPath, 'paintms.db')
      }

      // Create backup of current database before restore
      const currentBackupPath = dbPath + '.before-restore'
      await fs.copyFile(dbPath, currentBackupPath)

      // Restore the backup
      await fs.copyFile(backupPath, dbPath)

      log.info('Database restored from:', backupPath)
      log.info('Previous database backed up to:', currentBackupPath)

      // Show restart prompt
      const restartResult = await dialog.showMessageBox({
        type: 'info',
        title: 'Restauration réussie',
        message: 'Base de données restaurée avec succès!',
        detail: "L'application doit redémarrer pour appliquer les changements.",
        buttons: ['Redémarrer maintenant', 'Plus tard'],
        defaultId: 0
      })

      if (restartResult.response === 0) {
        app.relaunch()
        app.quit()
      }

      return { success: true, path: backupPath }
    } catch (error) {
      log.error('Restore error:', error)
      return { success: false, error: error.message }
    }
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
