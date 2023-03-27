<template>
  <a-tabs v-model:activeKey="activeKey" @change="goToPage">
    <a-tab-pane :key="item.id" v-for="item in tabList">
      <template #tab>
        <span>
          <youtube-outlined v-if="item.id === 1" />
          <home-outlined v-if="item.id === 2" />

          {{ item.lable }}
        </span>
      </template>
    </a-tab-pane>
  </a-tabs>
</template>
<script lang="ts" setup>
import { YoutubeOutlined, HomeOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const { push } = useRouter()
const activeKey = ref(1)
const tabList = ref([
  {
    id: 1,
    lable: '单条视频批量去水印'
  },
  {
    id: 2,
    lable: '多条视频批量去水印'
  }
])

const goToPage = () => {
  switch (activeKey.value) {
    case 1:
      push({ name: 'single' })
      return
    case 2:
      push({ name: 'multiple' })

      return
  }
}
</script>
<style>
.ant-tabs{
  color: #fff;
  position: fixed;
  background: #2f3241;
  z-index: 2;
  width: calc(100% - 40px);
}
</style>
