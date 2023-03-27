<script setup lang="ts">
import Tabs from '@renderer/components/tabs.vue'
import Footer from '@renderer/components/footer.vue'
import { ref } from 'vue'

const hide = ref(false)
const id = setTimeout(() => {
  hide.value = true
  clearTimeout(id)
}, 5000)
const getVersion = async () => {
  document.title = '小魔方 v' + await (window as any).api.getVersion()
}
getVersion()
</script>

<template>
  <div class="app" v-show="hide">
    <Tabs />
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <Footer style="margin-left: -20px;"/>
  </div>
</template>

<style lang="less">
@import './assets/css/styles.less';
.app {
  padding: 0 20px;
  padding-bottom: 80px;
}
</style>
