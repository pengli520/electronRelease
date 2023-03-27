import { autoUpdater, app } from 'electron'
const server = 'https://your-update-server.com'

const url = `${server}/updates/${process.platform}/${app.getVersion()}`
// 设置更新源
autoUpdater.setFeedURL({ url })

// 监听更新事件
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available.', info)
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.', info)
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err)
})


autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded.', info)
})

// 在应用启动时检查更新
app.on('ready', function () {
  autoUpdater.checkForUpdates()
})
