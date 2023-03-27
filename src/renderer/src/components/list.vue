<template>
  <a-row :gutter="[16, 16]" justify="space-between" align="middle" style="padding: 20px 0">
    <a-col :span="6" flex> 当前总条数：{{ list.length }} </a-col>
    <!-- <a-col :span="4" flex v-show="total"> 用户总条数：{{ total }} </a-col> -->
    <a-col flex>
      <a-button type="primary" danger @click="emit('clearList')" v-show="list.length">
        <template #icon>
          <close-circle-outlined />
        </template>
        清空列表</a-button
      >
      <a-button
        style="marginLeft: 10px"
        type="primary"
        @click="downloadAll"
        :disabled="!list.length"
        :loading="downloadAllLoading"
      >
        <template #icon>
          <cloud-download-outlined />
        </template>
        下载所有</a-button
      >
    </a-col>
  </a-row>

  <a-list
    :dataSource="list"
    rowKey="photoId"
    itemLayout="vertical"
    :loadMore="loadMore"
    :locale="{ emptyText: '暂无数据' }"
    :grid="{ gutter: 16, column: 4 }"
  >
    <template #renderItem="{ item }">
      <a-list-item>
        <a-card hoverable>
          <template #cover>
            <a-image :src="item.coverUrl" :fallback="item.headUrl">
              <template #previewMask>
                <div>
                  <eye-outlined />
                  预览
                </div>
              </template></a-image
            >
          </template>
          <template #actions>
            <play-circle-outlined v-if="!item.play" @click="paly(item)" />
            <sync-outlined spin v-else />
            <download-outlined v-if="!item.downloadStatus" @click="download(item)" />
            <a-progress
              v-else-if="item.downloadStatus === 1"
              type="circle"
              :percent="item.percent"
              :width="16"
            />
            <a-tooltip title="点击重试" color="#87d068" v-else-if="item.downloadStatus === 2">
              <close-circle-outlined style="color: brown" @click="download(item)" />
            </a-tooltip>
          </template>
          <a-card-meta :title="item.userName">
            <template #avatar>
              <a-avatar :src="item.headUrl" />
            </template>
            <template #description>
              <a-tooltip>
                <template #title>{{ item.title }}</template>
                {{ item.title }}
              </a-tooltip>
            </template>
          </a-card-meta>
        </a-card>
      </a-list-item>
    </template>
  </a-list>

  <Video ref="videoRef" />
</template>

<script lang="ts" setup>
import {
  PlayCircleOutlined,
  DownloadOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
  EyeOutlined,
  SyncOutlined
} from '@ant-design/icons-vue'
import { ref, PropType } from 'vue'
import Video from '@renderer/components/video.vue'
import { WorksAttribute, msg } from '@renderer/common'
const emit = defineEmits(['clearList'])

const props = defineProps({
  list: {
    type: [] as PropType<WorksAttribute[]>,
    default: []
  },
  total: {
    default: 0
  }
})

const palyOrdownload = ref(false)

const downloadAllLoading = ref(false)

const videoRef: any = ref(null)
const loadMore = ref({
  hasMore: false
})
// const hide =
//   type === 'play' ? msg({ type: 'loading', content: '正在努力加载', duration: 0 }) : undefined
const ksGetSingleVideoSrc = async (item: WorksAttribute, type: string) => {
  return new Promise<WorksAttribute>(async (resolve, reject) => {
    item.play = type === 'play' ? true : false
    try {
      const res = await (window as any).api.ksGetSingleVideoSrc(item.shareInfoPhotoId)
      return resolve(res.data)
    } catch (error) {
      msg({ content: 'ks视频地址获取失败', type: 'error' })
      item.downloadStatus = 2
      reject()
    } finally {
      item.play = false
      palyOrdownload.value = false
    }
  })
}

const paly = async (item: WorksAttribute) => {
  // 单独处理快手
  if (item.type === 'ks') {
    if (palyOrdownload.value) {
      msg({ content: '正在获取数据，请稍后', type: 'error' })
      return
    }
    palyOrdownload.value = true
    const { videoUrl } = await ksGetSingleVideoSrc(item, 'play')
    item.videoUrl = videoUrl
  }

  const url = item.videoUrl.indexOf('https:') === -1 ? 'https:' + item.videoUrl : item.videoUrl
  videoRef.value.openVideoModal(url)
}

const downloadAll = async () => {
  downloadAllLoading.value = true
  try {
    for (let item of props.list) {
      await download(item)
    }
  } finally {
    downloadAllLoading.value = false
  }
}

// downloadStatus: 0|undefined:下载按钮 1：下载中 2：失败
const addProgress = (item: WorksAttribute) => {
  return new Promise(async (resolve) => {
      const fn = () => {
        item.downloadStatus = 1
        item.percent = 3
        let id = setInterval(() => {
          if (item.percent > 90) {
            clearInterval(id)
          }
          item.percent += 5
        }, 500)
      }
      if (item.type === 'ks') {
        if (palyOrdownload.value) {
          msg({ content: '正在获取数据，请稍后', type: 'error' })
          return false
        }
        palyOrdownload.value = true
        fn()
        const { videoUrl } = await ksGetSingleVideoSrc(item, 'download')
        if (videoUrl) {
          item.videoUrl = videoUrl
        }
      } else {
        fn()
      }
      return resolve(false)
  })
}

const download = async (item: WorksAttribute) => {
  await addProgress(item)
  const url = item.videoUrl.indexOf('https:') === -1 ? 'https:' + item.videoUrl : item.videoUrl
  ;(window as any).api.downloadFile(url, item.title + item.photoId, 'mp4', item.userName).then(
    () => {
      item.percent = 100
      msg({ content: '下载成功' })
    },
    (error) => {
      msg({ content: error?.msg || '下载失败', type: 'error' })
      item.downloadStatus = 2
    }
  )
}
</script>
<style>
.ant-card-meta-description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ant-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ant-image {
  position: relative;
  display: inline-block;
  height: 150px;
}
.ant-progress {
  position: relative;
  top: -3px;
}
</style>
