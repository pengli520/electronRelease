// 单个用pc端，有头
// 用户主页用手机端，有极验
import dyCaptcha  from './dyCaptcha'

// 单个作品分享页
const detailPage = 'https://v.douyin.com/BvKWsm5/'

// 详情页
const videoDetailUrl = 'https://www.douyin.com/video/'

// 个人主页
const mainPage = 'https://v.douyin.com/Bcm46M8/'
// 用户重定向主页
const redirectUserMainUrl ="https://www.iesdouyin.com/share/user"
// 个人主页api
const mainPageListApi = 'https://www.iesdouyin.com/web/api/v2/aweme/post/'

// 个人信息
const userInfoApi = 'https://www.iesdouyin.com/web/api/v2/user/info/'
// 极验验证api
const verifyApi = '/captcha/verify'

// 单个作品,pc模式有头才可以,无头需要滑块验证
async function dySingle(link) {
  const page = global.minMagicCubePlaywright.chromiumBrowser.pcPage
  return new Promise(async (resolve, reject) => {
    let id
    try {
      await page.goto(link, { timeout: 15000 })
      if (page.url().indexOf(videoDetailUrl) === -1) {
        return reject({ code: -1, msg: '请输入dy单条正确的链接' })
      }
      id = await page.url().split('/')[5]
      await page.goto(`${videoDetailUrl}${id}`, { timeout: 15000 })
    } catch (error) {
      return reject({ code: -1, msg: error })
    }

    let txt = ''
    try {
      txt = await page.locator('.sc-jKJlTe').innerText({ timeout: 3000 })
    } catch (error) {
      console.log('dySingle 一定时间内没有获取到滑块验证的弹窗dom节点')
    }
    console.info(txt)
    if (txt.indexOf('拼图') !== -1) {
      const res = await dyCaptcha(
        page,
        '#captcha-verify-image',
        '.captcha_verify_img_slide',
        340 / 552,
        verifyApi
      )
      // 有错误直接抛出
      if (res.code === -1) {
        return reject({code: -1, msg: res})
      }
    }
    try {
      const videoUrl = await page.locator('source').first().getAttribute('src')
      const title = await page.locator('.z8_VexPf').innerText()
      const headUrl = await page.locator('.PbpHcHqa').first().getAttribute('src')
      const userName = await page.locator('.yy223mQ8').first().innerText()
      const info = {
        videoUrl,
        title,
        headUrl,
        coverUrl: '',
        photoId: id,
        userName
      }
      return resolve({ code: 1, data: info })
    } catch (error) {
      return reject({ code: -1, msg: error })
    }
  })
}

// 前往个人主页,手机模式
async function dyMultiple(link) {
  return new Promise(async (resolve, reject) => {
    const page = global.minMagicCubePlaywright.chromiumBrowser.phonePage
    if (!link) {
      throw {
        code: -1,
        msg: 'link not empty'
      }
    }
    const deltaY = 1000000000
    let total = 0
    const list = []
    page.on('response', async (response) => {
      // 发布作品列表
      if (response.url().indexOf(mainPageListApi) !== -1) {
        const body = await response.body()
        if (body.length) {
          const { aweme_list } = await response.json()
          aweme_list?.forEach((value) => {
            const item = {
              videoUrl: value.video.play_addr.url_list[0],
              title: value.desc,
              headUrl: value.author.avatar_larger.url_list[0],
              coverUrl: value.video.origin_cover.url_list[0],
              photoId: value.aweme_id,
              userName: value.author.nickname
            }
            list.push(item)
          })
          console.info('获取条数', list.length, aweme_list)
          await page.click('.btn-area')
          await page.mouse.wheel(100, deltaY)
          // 神了，接口返回条数70，数据有72条 https://v.douyin.com/SanEPYa/
          console.log(+total <= list.length, total, list.length)
          if (+total <= list.length) {
            resolve({ data:list, total, type: 'dy' })
          }
        }
      }
    })
    try {
      await page.goto(link, { timeout: 5000 })
      if (page.url().indexOf(redirectUserMainUrl) === -1) {
        return reject({ code: -1, msg: '请输入dy用户主页的链接' })
      }
    } catch (error) {
      return reject({ code: -1, msg: error })
    }
    total = await page.locator('.select-tab-number').innerText()
    let txt = ''
    try {
      txt = await page.locator('.captcha_verify_bar--title').innerText({
        timeout: 5000
      })
    } catch (error) {
      console.log('一定时间内没有获取到滑块验证的弹窗dom节点')
    }
    if (txt.indexOf('验证') !== -1) {
      const res = await dyCaptcha(
        page,
        '#captcha-verify-image',
        '.captcha_verify_img_slide',
        276 / 552,
        verifyApi
      )
      // 有错误直接抛出
      if (res.code === -1) {
        return reject(res)
      }
    }
  })
}

export default {
  dySingle,
  dyMultiple
}
