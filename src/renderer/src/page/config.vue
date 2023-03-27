<template>
  <div class="config">
    <div class="login">
      <img src="@renderer/assets/icon.png" alt="" />
      <a-input v-model:value="sing" placeholder="请输入卡密" />
      <a-button :loading="loading" type="primary" block @click="changeTipFn" :disabled="!sing">{{
        tip
      }}</a-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { msg } from '@renderer/common'

const { push } = useRouter()
const sing = ref('')
const tip = ref('提 交')
const timeAll = ref(0)
const timeStage = ref(1000)
const loading = ref(false)
const changeTipFn = () => {
  try {
    loading.value = true
    const data = (window as any).api.jwtVerify(sing.value.trim())
    console.log(data)
    // 验证是否过期
    const time = data.expireTime
    if (time !== 0 && +new Date(time) < +new Date()) {
      msg({ content: '卡密已过期', type: 'error' })
      loading.value = false
      return tip.value = '卡密已过期'
    }
    tip.value = '验证成功正在登陆'

    let id = setInterval(() => {
      const minMagicCubePlaywrightConfig = (window as any).api.getMinMagicCubePlaywright()
      // 配置获取成功
      if (minMagicCubePlaywrightConfig.dy.captchaStatus.phone) {
        tip.value = '抖音移动端配置获取成功'
      }
      if (minMagicCubePlaywrightConfig.dy.captchaStatus.pc) {
        tip.value = '抖音pc端配置获取成功'
      }
      if (minMagicCubePlaywrightConfig.ks.captchaStatus.phone) {
        tip.value = '快手配置获取成功'
        clearInterval(id)
        push({ name: 'single' })
      }
      if (timeAll.value > 120000) {
        clearInterval(id)
        tip.value = '获取失败，请稍后再试'
        return
      }
      timeAll.value += timeStage.value
    }, timeStage.value)
  } catch (error) {
    loading.value = false
    return msg({ content: '卡密验证失败', type: 'error' })
  }
}

const getToken = () => {
  const token = (window as any).api.jwtGetToken()
  sing.value = token || ''
  console.log('获取token：',token)
}
getToken()
</script>
<style lang="less">
.config {
  position: absolute;
  top: 0px;
  left: 0;
  width: 100%;
  height: 100%;
  background: #2f3241;
  z-index: 2;
  display: flex;
  justify-content: center;
  // align-items: center;
}
.login {
  width: 300px;
  margin: 0 auto;
  margin-top: 150px;
  img {
    width: 30%;
    display: block;
    margin: 0 auto;
    padding-bottom: 10px;
  }
  input {
    margin-bottom: 10px;
  }
}
</style>
