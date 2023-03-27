<template>
  <div class="footer">
  <a-row :gutter="[6, 16]">
    <a-col :span="18">
      <a-input disabled v-model:value="value" addon-before="保存文件夹" />
    </a-col>
    <a-col :span="3">
      <a-button type="primary" @click="selectDirectoryPath">
        <template #icon>
          <folder-outlined />
        </template>
        选择
      </a-button>
    </a-col>
    <a-col :span="3">
      <a-button type="primary"  @click="open">
        <template #icon>
          <folder-open-outlined />
        </template>
        打开
      </a-button>
    </a-col>
  </a-row>
  </div>

</template>

<script lang="ts" setup>
import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons-vue'
import { ref } from 'vue'

const value = ref('');

const init = () => {
  (window as any).api.getSaveDirectoryPath().then((path) => {
    value.value = path
  })
}
init()

const selectDirectoryPath = async () => {
  await (window as any).api.setSaveDirectoryPath()
  init()
}

const open = () => {
  (window as any).api.openDirectoryPath(value.value)
}
</script>

<style>
.footer {
    position: fixed;
    bottom: 0;
    background-color: #fff;
    border-top: 1px solid #999;
    width: 100%;
    padding: 10px;
    z-index: 1;
}
</style>
