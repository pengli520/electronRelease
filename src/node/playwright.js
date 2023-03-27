const { chromium, firefox, devices } = require('playwright')
import dyCaptcha  from './dyCaptcha'
import ksCaptcha from './ksCaptcha'
const iPhone = devices['iPhone 6']

class Playwright {
  constructor() {
    this.chromiumBrowser = {
      browser: null,
      pcContext: null,
      phoneContext: null,
      pcPage: null,
      phonePage: null
    }
    this.firefoxBrowser = {
      browser: null,
      pcContext: null,
      phoneContext: null,
      pcPage: null,
      phonePage: null,
      // 是否通过验证默认为false
      captchaStatus: {
        pc: false,
        phone: false
      }
    }
    this.ks = {
      userMainPage: 'https://v.kuaishou.com/N4cXfe',
      userWorkDetailPage: 'https://v.m.chenzhongtech.com/fw/photo/3xmr8afwx2q4nrk',
      redirectUrl: 'https://captcha.zt.kuaishou.com/mobile/h5/redirect/index.html',
      verifyApi: 'https://captcha.zt.kuaishou.com/rest/zt/captcha/sliding/kSecretApiVerify',
      // 是否通过验证默认为false
      captchaStatus: {
        pc: false,
        phone: false
      }
    }
    this.dy = {
      userMainPage: 'https://v.douyin.com/Sq3Dv38/',
      userWorkDetailPage: 'https://www.douyin.com/video/7209640861351562553',
      verifyApi: '/captcha/verify',
      // 是否通过验证默认为false
      captchaStatus: {
        pc: false,
        phone: false
      }
    }
    this.firefoxBrowserInit()
    this.chromiumBrowserInit()
  }
  // 火狐
  async firefoxBrowserInit() {
    this.firefoxBrowser.browser = await firefox.launch({ headless: !false })
    // this.firefoxBrowser.pcContext = await this.firefoxBrowser.browser.newContext()
    this.firefoxBrowser.phoneContext = await this.firefoxBrowser.browser.newContext({
      userAgent:
        'Mozilla/5.0 (Linux; Android 10; Pixel 2 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Mobile Safari/537.36'
    })
    // this.firefoxBrowser.pcPage = await this.firefoxBrowser.pcContext.newPage()
    this.firefoxBrowser.phonePage = await this.firefoxBrowser.phoneContext.newPage()
    this.ksCaptchaPhoneInit()
  }

  // 谷歌
  async chromiumBrowserInit() {
    this.chromiumBrowser.browser = await chromium.launch({ headless: !false })
    this.chromiumBrowser.pcContext = await this.chromiumBrowser.browser.newContext()
    this.chromiumBrowser.phoneContext = await this.chromiumBrowser.browser.newContext({ ...iPhone })
    this.chromiumBrowser.pcPage = await this.chromiumBrowser.pcContext.newPage()
    this.chromiumBrowser.phonePage = await this.chromiumBrowser.phoneContext.newPage()
    this.dyCaptchaPhoneInit()
    this.dyCaptchaPcInit()
  }

  // 重启火狐浏览器
  async restartFirefoxBrowser() {
    try {
      await this.firefoxBrowser.browser.close()
      await this.firefoxBrowserInit()
      return Promise.resolve({ code: 1, msg: '重启成功' })
    } catch (error) {
      return Promise.reject({ code: -1, msg: '重启失败' })
    }
  }
  // 重启谷歌浏览器
  async restartChromiumBrowser() {
    try {
      await this.chromiumBrowser.browser.close()
      await this.chromiumBrowserInit()
      return Promise.resolve({ code: 1, msg: '重启成功' })
    } catch (error) {
      return Promise.reject({ code: -1, msg: '重启失败' })
    }
  }

  // ks手机模式极验启动破解
  async ksCaptchaPhoneInit() {
    return new Promise((resolve, reject) => {
      const page = this.firefoxBrowser.phonePage
      page.goto(this.ks.userWorkDetailPage)
      page.on('request', async (request) => {
        const url = request.url()
        if (url.indexOf(this.ks.redirectUrl) !== -1) {
          try {
            await ksCaptcha(
              page,
              '.slider-shadow',
              '.bg-img',
              '.slider-img',
              316 / 686,
              this.ks.verifyApi
            )
            resolve({ code: 1, msg: '验证通过' })
            this.ks.captchaStatus.phone = true
          } catch (err) {
            console.log(err, '------ks发生错误，重启浏览器')
            this.restartFirefoxBrowser()
            return reject(err)
          }
        }
      })
    })
  }

  // dy手机模式极验启动破解
  async dyCaptchaPhoneInit() {
    return new Promise(async (resolve, reject) => {
      const page = this.chromiumBrowser.phonePage
      page.goto(this.dy.userMainPage)
      let txt = ''
      try {
        txt = await page.locator('.captcha_verify_bar--title').innerText({ timeout: 15000 })
      } catch (error) {
        console.log('一定时间内没有获取到滑块验证的弹窗dom节点')
      }
      if (txt.indexOf('验证') !== -1) {
        const res = await dyCaptcha(
          page,
          '#captcha-verify-image',
          '.captcha_verify_img_slide',
          276 / 552,
          this.dy.verifyApi
        )
        // 有错误直接抛出
        if (res.code === -1) {
          return reject(res)
        } else {
          resolve(res)
          this.dy.captchaStatus.phone = true
        }
      }
    })
  }

  // dypc模式极验启动破解
  async dyCaptchaPcInit() {
    return new Promise(async (resolve, reject) => {
      const page = this.chromiumBrowser.pcPage
      page.goto(this.dy.userWorkDetailPage)
      let txt = ''
      try {
        txt = await page.locator('.sc-jKJlTe').innerText({ timeout: 15000 })
      } catch (error) {
        console.log('dySingle 一定时间内没有获取到滑块验证的弹窗dom节点')
      }
      if (txt.indexOf('拼图') !== -1) {
        const res = await dyCaptcha(
          page,
          '#captcha-verify-image',
          '.captcha_verify_img_slide',
          340 / 552,
          this.dy.verifyApi
        )
        // 有错误直接抛出
        if (res.code === -1) {
          return reject(res)
        } else {
          resolve(res)
          this.dy.captchaStatus.pc = true
        }
      }
    })
  }
}

global.minMagicCubePlaywright = new Playwright()
