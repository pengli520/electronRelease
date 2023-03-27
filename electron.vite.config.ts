import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import electron from 'vite-plugin-electron'
export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      Components({
        resolvers: [AntDesignVueResolver()]
      })
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      electron({
        entry: './src/main/index.ts'
      })
    ]
  }
})
