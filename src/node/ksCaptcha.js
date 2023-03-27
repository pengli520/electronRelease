// opencv处理极验的相关函数,去除了canvas和jsdom

import { sleep } from './common.js'

const Jimp = require('jimp')
const cv = require('opencv.js')
// 尝试次数
let count = 3;
// 监听页面请求只执行一次
let status = false
function t(startPoint, endPoint) {
  // 缓动函数
  function easeOutQuad(t) {
    return -t * (t - 2)
  }

  // 计算总距离和总时间
  const distance = Math.sqrt(
    Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)
  )
  const duration = 3000 // 假设在3秒钟内完成

  // 定义轨迹记录数组
  const track = []

  // 生成轨迹记录
  let currentTime = Date.now()
  const n = Math.floor(Math.random() *20) + 40
  for (let i = 0; i < n; i++) {
    // 假设每秒钟生成20个记录，因此总共需要生成60*3=180个记录
    const t = i / 60 // 计算当前时间所占的比例（取值范围为[0,1]）
    const d = easeOutQuad(t) * distance // 根据缓动函数计算当前距离
    const x = startPoint.x + (endPoint.x - startPoint.x) * (d / distance) // 根据比例计算当前点的坐标
    const y = startPoint.y + (endPoint.y - startPoint.y) * (d / distance)

    // 计算当前点和上一个点之间的时间间隔
    const interval = i > 0 ? Date.now() - currentTime : 0

    // 将当前点记录到轨迹记录数组中
    track.push({
      x: x,
      y: y,
      time: currentTime + interval
    })

    // 更新当前时间
    currentTime += interval
  }

  // 打印轨迹记录
  console.log(track)

  return track
}

/**
 *
 * @param {*} page 当前页面
 * @param {*} selector css选择器
 * @param {*} distance 移动距离
 */
// 选择滑块并移动
async function moveSlider(page, selector, distance = 0) {
  const iframe = await page.frameLocator('iframe')
  console.info('开始移动滑块', '移动距离：', distance)
  let { x, y } = await iframe.locator(selector).boundingBox()
  const tolerance = 2
  x = x + tolerance
  y = y + tolerance
  // 滑块前面有点距离
  const frontDistance = 6
  console.info('滑块的x初始坐标', x)

  await page.mouse.move(200, 20)
  await page.mouse.move(x, y)
  await page.mouse.down()
  const list = t({ x, y }, { x: x + distance, y })
  for (let index in list) {
    const { x, y } = list[index]
    await sleep(10)
    await page.mouse.move(x, y)
  }
  for (let i = 1; i < frontDistance; i++) {
    await page.mouse.move(x + distance - i, y + 3, { steps: 3 })
  }
  await sleep(200)
  await page.mouse.up()
  return true
}

/**
 * 提取图片轮廓
 * @param {*} imgUrl
 * @param {*} name
 * @returns
 */

async function extractCanny(imgUrl, name) {
  if (!imgUrl || !name) {
    throw { code: -1, msg: '不存在图片 路径或名称' }
  }
  try {
    const image = await Jimp.read(imgUrl)
    const src = cv.matFromImageData(image.bitmap)
    console.info(`正在提取${name}轮廓`, '图片大小：', src.size())
    const { width, height } = src.size()
    let dst = new cv.Mat()
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0)
    cv.Canny(src, dst, 400, 900, 3, false)

    src.delete()
    // dst.delete();
    return dst
  } catch (error) {
    console.log('提取图片轮廓报错', error)
    throw { code: -2, msg: '提取图片轮廓报错, 重启浏览器' }
  }
}

/**
 * 模板匹配
 * @param {*} src 图片源
 * @param {*} templ 图片模板
 * @param {*} name 导出标注图片名称
 * @returns 移动距离
 */
function templateMatching(src, templ, proportion, name) {
  if (!src || !templ) {
    throw { code: -1, msg: '不存在图片 路径或名称' }
  }
  let dst = new cv.Mat()
  let mask = new cv.Mat()
  cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF, mask)
  let result = cv.minMaxLoc(dst, mask)
  let maxPoint = result.maxLoc
  let color = new cv.Scalar(255, 0, 0, 255)
  let point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows)
  cv.rectangle(src, maxPoint, point, color, 2, cv.LINE_8, 0)

  src.delete()
  dst.delete()
  mask.delete()
  console.info(`模板匹配完成 maxPoint:`, maxPoint)
  const x = maxPoint.x * proportion

  return Number(x)
}

// 监听极验接口返回参数
async function verifyListen(
  page,
  sliderBtn,
  imageUrlSelector,
  imageSlideUrlSelector,
  proportion,
  verifyApi
) {
  return new Promise((resolve, reject) => {
    if (status) return
    status = true
    page.on('response', async (response) => {
        if (response.url().indexOf(verifyApi) !== -1) {
          const res = await response.json()
          console.info('极验验证状态：', res)

          if (+res.result === 1) {
            return resolve({ code: 1, msg: '验证成功' })
          } else {
            await sleep(2000)
            if (count <= 0) {
              reject({ code: -2, msg: '已经超出最大重试次数，请重启浏览器' })
              count = 3
              return
            } else {
              count--
              return await ksCaptcha(
                page,
                sliderBtn,
                imageUrlSelector,
                imageSlideUrlSelector,
                proportion,
                verifyApi
              )
            }
          }
        }
    })
  })
}

/**
 * 极验,默认数据为抖音pc端
 * @param {*} page
 * @param {*} sliderBtn 滑动按钮
 * @param {*} imageUrlSelector 原图
 * @param {*} imageSlideUrlSelector 模板图
 * @param {*} proportion div图width 与原始图width的比例
 * @param {*} verifyApi 极验接口
 *
 * @returns
 */
async function ksCaptcha(
  page,
  sliderBtn,
  imageUrlSelector,
  imageSlideUrlSelector,
  proportion = 320 / 552,
  verifyApi
) {
    try {
      if (
        !page ||
        !sliderBtn ||
        !imageUrlSelector ||
        !imageSlideUrlSelector ||
        !proportion ||
        !verifyApi
      ) {
        throw { code: -1, msg: '缺少参数' }
      }
      const iframe = await page.frameLocator('iframe')
      const imageUrl = await iframe.locator(imageUrlSelector).getAttribute('src')
      const imageSlideUrl = await iframe.locator(imageSlideUrlSelector).getAttribute('src')
      console.info('imageUrl:', imageUrl, 'imageSlideUrl:', imageSlideUrl)

      const srcDst = await extractCanny(imageUrl, 'imageUrl')
      const templateDst = await extractCanny(imageSlideUrl, 'imageSlideUrl')
      const x = templateMatching(srcDst, templateDst, proportion, 'test')
      await moveSlider(page, sliderBtn, x)
      return await verifyListen(
        page,
        sliderBtn,
        imageUrlSelector,
        imageSlideUrlSelector,
        proportion,
        verifyApi
      )
    } catch (error) {
      console.log(error)
      throw error
    }
}

export default ksCaptcha
