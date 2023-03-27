# electron-app

An Electron application with Vue and TypesSript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

### bug记录
1.抖音爬取头像有问题
2.快手图片获取403，抛出错误{code: -2, msg: '提取图片轮廓报错, 重启浏览器'}，验证还能通过。
3.启动程序时，自动破解验证，不关闭浏览器尝试三次，重启浏览器2次，不行就直接提示用户，是否直接进入，可能会影响体验，进入后再次重启浏览器
4.进入程序后遇到图片加载不出来直接重启浏览次，3次验证不通过也重启浏览器
5.mouse.move: Protocol error (Page.dispatchMouseEvent): ERROR: failed to call method 'Page.dispatchMouseEvent' with parameters {
  "type": "mousemove",
  "button": 0,
  "buttons": 1,
  "x": null,
  "y": null,
  "modifiers": 0
}
Expected "<root>.x" to be |number|; found |object| `null` instead. _dispatch@chrome://juggler/content/protocol/Dispatcher.js:67:15
receiveMessage@chrome://juggler/content/components/Juggler.js:118:20

    at moveSlider$1 (D:\gitup\min-magic-cube\out\preload\index-a5aba8c7.js:89:22)
    at async Object.ksCaptcha (D:\gitup\min-magic-cube\out\preload\index-a5aba8c7.js:181:5)
    at async Page.<anonymous> (D:\gitup\min-magic-cube\out\preload\playwright-ce1c1a6c.js:100:13) '-----0099999'
6.单条和批量弄混的话会一直加载loding
7.浏览器重启后存在问题
