"use strict";const{chromium:i,firefox:e,devices:s}=require("playwright");class r{constructor(){this.chromiumBrowser={browser:null,context:null},this.firefoxBrowser={browser:null},this.firefoxBrowserInit()}async firefoxBrowserInit(){this.firefoxBrowser.browser=await e.launch({headless:!1}),this.firefoxBrowser.context=await this.firefoxBrowser.browser.newContext({userAgent:"Mozilla/5.0 (Linux; Android 10; Pixel 2 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Mobile Safari/537.36"}),this.firefoxBrowser.phonePage=await this.firefoxBrowser.context.newPage(),this.firefoxBrowser.phonePage.goto("https://v.douyin.com/S4G1P1x/")}}global.minMagicCubePlaywright=new r;console.log("xxxxxxxx",global.minMagicCubePlaywright);