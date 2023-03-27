import { message } from 'ant-design-vue'

function msg(config) {
  let type = config.type || 'success'

  return message[type](config)
}
function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}
interface WorksAttribute {
  videoUrl: string
  title: string
  headUrl: string
  coverUrl: string
  photoId: string
  userName: string
  downloadStatus?: number | undefined
  percent: number
  type: string
  shareInfoPhotoId?: string
  play: boolean // 播放状态，用于快手异步获取视频url
}

function crawler(link: string, type: string) {
  const arr = link.match(/\.[a-z]+\./g)
  const domain = arr && arr[0]?.replaceAll('.', '') || 0
  if (!domain || !type) {
    msg({ type: 'error', content: '链接格式错误' })
    throw 'domain and type not empty'
  }
  const controller = {
    douyin: {
      single: (window as any).api.dySingle,
      multiple: (window as any).api.dyMultiple
    },
    kuaishou: {
      single: (window as any).api.ksSingle,
      multiple: (window as any).api.ksMultiple
    }
  }
  return controller[domain][type](link)
}

function filterLink(link) {
  const regex = /https?:\/\/[^\s]+/gi;
  const arr = link.match(regex);
  console.log(arr, '---')
  return arr && arr.length === 1 ? arr[0] :arr
}

export { msg, sleep, crawler, filterLink }
export type {WorksAttribute}
