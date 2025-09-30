import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Print API
  print: async (htmlContent, options = {}) => {
    return await ipcRenderer.invoke('print-content', htmlContent, options)
  },
  
  // PDF Export API
  exportPDF: async (htmlContent, options = {}) => {
    return await ipcRenderer.invoke('export-pdf', htmlContent, options)
  },
 
  // Check if running in Electron
  isElectron: true
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}