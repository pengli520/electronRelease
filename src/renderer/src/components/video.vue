<template>
    <a-modal class="modal" :footer="null" v-model:visible="isShowVideo" @cancel="cancel" destroyOnClose title="视频播放">
      <video
        class="video"
        :src="videoSrc"
        controls
        autoplay
      ></video>
    </a-modal>
</template>

<script lang="ts" setup>
import { ref, } from 'vue'
const isShowVideo = ref(false)
const videoSrc = ref('')
const openVideoModal = (src: string) => {
  isShowVideo.value = true
  videoSrc.value = src
}
const cancel = () => {
  isShowVideo.value = false
}
defineExpose({
  openVideoModal
})
</script>
<style>
.ant-modal-body{
  background: #000;
  padding: 0;
}
.video {
  width: 200px;
  height: 100%;
  display: block;
  margin: 0 auto;
}
</style>
