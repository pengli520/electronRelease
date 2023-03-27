import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ks, dy, downloadFile, jwt } from '../node/index'
// Custom APIs for renderer
const api = {
  jwtVerify: (token) => jwt.jwtVerify(token),
  jwtGetToken: () => jwt.jwtGetToken(),
  getMinMagicCubePlaywright: () => {
    return {
      ks: global.minMagicCubePlaywright.ks,
      dy: global.minMagicCubePlaywright.dy,
      restartFirefoxBrowser: global.minMagicCubePlaywright.restartFirefoxBrowser,
      restartChromiumBrowser: global.minMagicCubePlaywright.restartChromiumBrowser
    }
  },
  ksSingle: (link) => ks.ksSingle(link),
  ksMultiple: (link) => ks.ksMultiple(link),
  ksGetSingleVideoSrc: (shareInfoPhotoId) => ks.ksGetSingleVideoSrc(shareInfoPhotoId),
  ksGetAllVideoSrc: (list) => ks.ksGetAllVideoSrc(list),
  dySingle: (link) => dy.dySingle(link),
  dyMultiple: (link) => dy.dyMultiple(link),
  downloadFile: (url, name, type, folderName) => downloadFile(url, name, type, folderName),
  setSaveDirectoryPath: () => {
    return new Promise<void>((resolve, reject) => {
      ipcRenderer.send('set-save-directory-path')
      ipcRenderer.on('set-save-directory-path', (_, status) => {
        status ? resolve() : reject()
      })
    })
  },
  getSaveDirectoryPath: () => {
    return new Promise<void>((resolve) => {
      ipcRenderer.send('get-save-directory-path')
      ipcRenderer.on('get-save-directory-path', (_, path) => {
        resolve(path)
      })
    })
  },
  openDirectoryPath: (path) => {
    ipcRenderer.send('open-directory-path', path)
  },
  getVersion: () => {
    return new Promise<void>((resolve) => {
      ipcRenderer.send('get-version')
      ipcRenderer.on('get-version', (_, version) => {
        resolve(version)
      })
    })
  }
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
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
