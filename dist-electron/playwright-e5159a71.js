"use strict";const{chromium:s,firefox:r,devices:i}=require("playwright");class e{constructor(){this.chromiumBrowser={browser:null,context:null},this.firefoxBrowser={browser:null},this.firefoxBrowserInit()}async firefoxBrowserInit(){this.firefoxBrowser.browser=await r.launch({headless:!1}),this.firefoxBrowser.context=await this.firefoxBrowser.browser.newContext({}),this.firefoxBrowser.phonePage=await this.firefoxBrowser.context.newPage(),this.firefoxBrowser.phonePage.goto("https://v.douyin.com/S4G1P1x/")}}global.minMagicCubePlaywright=new e;
