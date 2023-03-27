// 快手网页手机模式，单个、多个作品,下载
// 火狐浏览器验证极验后可以正常浏览页面，谷歌的始终不行
const { firefox } = require('playwright')
import ksCaptcha from './ksCaptcha'
const ksAPi = 'https://v.kuaishou.com'
// 用户主页
const userMainPage = 'https://v.kuaishou.com/N4cXfe'
// 单个作品分享页
const userDetailPage = 'https://v.kuaishou.com/HHB8ye'
const userMainPageListApi = 'https://c.kuaishou.com/rest/wd/feed/profile'
// 用户信息api
const userInfoApi = 'https://c.kuaishou.com/rest/wd/user/profile'

// 单个作品接口
const workDetailPageApi = '/rest/wd/photo/info'

// 视频地址
const videoDetailUrl = 'https://www.kuaishou.com/short-video/'
const redirectVideoDetailUrl = 'https://v.m.chenzhongtech.com/fw/photo/'
// 重定向主页地址
const redirectUserMainUrl = 'https://c.kuaishou.com/fw/user/'
const verifyApi = 'https://captcha.zt.kuaishou.com/rest/zt/captcha/sliding/kSecretApiVerify'

// 重定向地址
const redirectUrl = 'https://captcha.zt.kuaishou.com/mobile/h5/redirect/index.html'

// 单个作品测试页
const testUrl = 'https://v.m.chenzhongtech.com/fw/photo/3xmr8afwx2q4nrk'

// 单个作品,直接获取，没有滑款验证
async function ksSingle(link) {
  return new Promise(async (resolve, reject) => {
    try {
      const page = global.minMagicCubePlaywright.firefoxBrowser.phonePage

        // 接口抓取
        page.on('response', async (response) => {
          if (response.url().indexOf(workDetailPageApi) !== -1) {
            console.log('url:', response.url())
            const data = await response.json()
            if (+data.result !== 1) return
            const info = {
              videoUrl: data.photo.mainMvUrls[0].url,
              title: data.photo.caption,
              headUrl: data.photo.headUrl,
              coverUrl: data.photo.webpCoverUrls[0].url,
              photoId: data.photo.photoId,
              userName: data.photo.userName
            }
            return resolve({ code: 1, data: info })
          }
        })
          await  page.goto(link, { timeout: 5000 })
            console.info(
              '单个作品详情url:',
              page.url(),
              page.url().indexOf(redirectVideoDetailUrl) === -1
            )
            if (page.url().indexOf(redirectVideoDetailUrl) === -1) {
              return reject({ code: -1, msg: '请输入ks单条正确的链接' })
            }
    } catch (error) {
      reject({ code: -1, msg: error.toString() })
    }
  })
}

/**
 * 获取用户所有作品
 * @param {*} reqCount 请求条数
 * @returns
 */
async function ksMultiple(link) {
  return new Promise(async (resolve, reject) => {
    try {
      const page = global.minMagicCubePlaywright.firefoxBrowser.phonePage
      const list = []
      // 发布总数
      let count = 0
      page.on('response', async (response) => {
        const url = response.url()
        // 匹配用户信息接口
        if (url.indexOf(userInfoApi) !== -1) {
          const { result, userProfile, shareInfo } = await response.json()
          const req = await response.request().postDataJSON()
          if (+result === 1) {
            // 匹配分享目标
            if (shareInfo.webShareVerifyData.objectId !== req.eid) {
              count = +userProfile.ownerCount.photo_public
            }
            console.log(shareInfo.webShareVerifyData.objectId, req.eid, count)
          }
        }
        if (url.indexOf(userMainPageListApi) !== -1) {
          const { feeds, result } = await response.json()
          if (+result !== 1) return
          feeds.forEach((data) => {
            const item = {
              photoId: data.photoId,
              shareInfoPhotoId: data.share_info.split('=').pop(),
              videoUrl: null,
              title: data.caption,
              headUrl: data.headUrls[0].url,
              coverUrl: data.coverUrls[0].url,
              userName: data.userName,
              type: 'ks'
            }
            list.push(item)
          })
          if (list.length >= count) {
            return resolve({ code: 1, data: list, typs: 'ks' })
          }
          console.log(list.length)
        }
      })
      const res = await page.goto(link, { timeout: 10000 })
      console.info(await res.status(), await page.url())
      if (page.url().indexOf(redirectUserMainUrl) === -1) {
        return reject({ code: -1, msg: '请输入ks用户的链接' })
      }
    } catch (error) {
      console.log(error)
      return reject({ code: -1, msg: error.toString() })
    }
  })
}

/**
 * 获取ks单个视频链接
 * shareInfoPhotoId: 分享id
 */
async function ksGetSingleVideoSrc(shareInfoPhotoId) {
  return new Promise(async (resolve, reject) => {
    const page = global.minMagicCubePlaywright.firefoxBrowser.phonePage
    // 监听是否有验证
    page.on('request', async (request) => {
      const url = request.url()
      if (url.indexOf(redirectUrl) !== -1) {
        try {
          await ksCaptcha(page, '.slider-shadow', '.bg-img', '.slider-img', 316 / 686, verifyApi)
        } catch (err) {
          return reject(err)
        }
      }
    })
    const res = await ksSingle(`${redirectVideoDetailUrl}${shareInfoPhotoId}`)
    return resolve(res)
  })
}

/**
 *
 * @param {*} list 包含shareInfoPhotoId的数组
 */
async function ksGetAllVideoSrc(list) {
  return new Promise(async (resolve, reject) => {
    try {
      for (const index in list) {
        if (index === list.length) {
          return resolve({ code: 1, data: list })
        }
        const res = await ksSingle(`${redirectVideoDetailUrl}${list[index].shareInfoPhotoId}`)
        if (res.code === 1) {
          list[index].videoUrl = res.videoUrl
        }
      }
    } catch (err) {
      return reject({ code: -1, msg: err.toString() })
    }
  })
}

export default { ksSingle, ksMultiple, ksGetSingleVideoSrc, ksGetAllVideoSrc }
