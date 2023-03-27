<template>
  <a-textarea v-model:value="link" placeholder="用户主页链接" :rows="2" autoSize allowClear />
  <a-button type="primary" @click="getList" :loading="loading" :disabled="!link.length" style="marginTop:10px">
    <template #icon><SearchOutlined /></template>
    一键提取
  </a-button>
  <List ref="listRef" :list="list" :total="total"  @clearList="clearList"/>
</template>
<script lang="ts" setup>
import { SearchOutlined } from '@ant-design/icons-vue'
import List from '@renderer/components/list.vue'
import { WorksAttribute, crawler, msg, filterLink } from '@renderer/common'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { currentRoute } = useRouter()
const loading = ref(false)
const listRef: any = ref(null)
const link = ref(true ? 'https://v.kuaishou.com/N4cXfe' : 'https://v.douyin.com/Sq3Dv38/')
const list = ref<WorksAttribute[]>([])
const total = ref(0)

const clearList = () => {
  list.value = []
}

const getList = async () => {
  const type: any = currentRoute.value.name
  const url = filterLink(link.value);
  if (!url) {
    return msg({ type: 'error', content: '链接格式错误' })
  }
  loading.value = true
  try {
    crawler(filterLink(link.value), type)
    .then(
      (res) => {
        list.value.push(...res.data)
        total.value = res.total
        console.log('渲染层：', list)
      },
      (err) => {
        console.log('渲染层：', err)
        msg({content:err?.msg.toString() || '网络异常', type: 'error'})
      }
    )
    .finally(() => {
      loading.value = false
    })
  } catch (error) {
    loading.value = false
  }

}
</script>
<style>
  .ant-input-affix-wrapper-textarea-with-clear-btn {
    margin-top: 65px;
  }
</style>
