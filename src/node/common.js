const fs = require('fs')
const request = require('request')
const { resolve } = require('path')
const configFilePath = './config.json'
const cachePath = './cache'
// 休眠时间
function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

/**
 *
 * @param {*} url 下载文件地址：图片地址，视频地址
 * @param {*} name 下载文件名称唯一
 * @param {*} type 下载文件类型mp4,png
 * @param {*} folderName 文件夹名称，有就创建，没有就不创建
 */
function downloadFile(url, name, type = 'mp4', folderName) {
  return new Promise((resolve, reject) => {
    name = extractChars(name)
    let downPath = fs.readFileSync(configFilePath, 'utf-8')

    // 文件夹路径
    const folderNamePath = `${downPath}/${folderName}`
    // 是否需要创建文件夹
    if (folderName) {
      // 判断文件夹是否存在
      if (!fs.existsSync(folderNamePath)) {
        fs.mkdirSync(folderNamePath)
      }
      downPath += `/${folderName}/`
    }
    downPath += `/${name}.${type}`
    request({
      url
    }).pipe(
      fs.createWriteStream(downPath).on('close', (err) => {
        if (!err) {
          resolve({ code: 1, msg: '下载成功' })
        } else {
          reject({ code: -1, msg: '下载失败' })
        }
      })
    )
  })
}
function extractChars(str) {
  return (str.match(/[\u4e00-\u9fa5a-zA-Z0-9#]+/g) || []).join('')
}

function regexReplaceFileName(str) {
  if (!str.trim()) return
  // 下载文件名称过滤特殊字符
  const regex = /[\\, \/, :, *, ?, ", <, >, |]/g
  return str.replaceAll(regex, '')
}


export { sleep, downloadFile, configFilePath }
