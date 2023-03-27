import { ipcMain, dialog, app } from 'electron'
import { configFilePath } from '../node/common'
const fs = require('fs')
function run() {
  // 监听渲染进程发送的事件
  ipcMain.on('get-single-link', (event, title) => {
    console.log(...arguments, '----', event, title)
  })

  // 用户设置文件夹
  ipcMain.on('set-save-directory-path', (event) => {
    dialog
      .showOpenDialog({
        title: '请选择下载目录',
        properties: ['openFile', 'openDirectory']
      })
      .then((result) => {
        const { canceled, filePaths } = result
        // 是否取消
        if (!canceled) {
          fs.writeFile(configFilePath, filePaths[0], (err) => {
            event.reply('set-save-directory-path', err ? false : true)
            if (err) {
              throw Error(err)
            }
          })
        }
      })
      .catch((err) => {
        event.reply('set-save-directory-path', false)
        throw Error(err)
      })
  })

  //  用户获取文件夹路径
  ipcMain.on('get-save-directory-path', (event) => {
    if (fs.existsSync(configFilePath)) {
      let data = fs.readFileSync(configFilePath, 'utf-8')
      event.reply('get-save-directory-path', data)
    } else {
      event.reply('get-save-directory-path', process.cwd())
    }
  })

  // 打开文价夹
  ipcMain.on('open-directory-path', (_, path) => {
    dialog.showOpenDialogSync({
      title: '目录',
      defaultPath: path,
      properties: []
    })
  })

  // 获取版本号
  ipcMain.on('get-version', (event) => {
    event.reply('get-version', app.getVersion())
  })
}

export default run
