import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import viteCompression from 'vite-plugin-compression'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import { loadEnv } from 'vite'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return defineConfig({
    main: {
      plugins: [externalizeDepsPlugin()]
    },
    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      define: {
        __APP_VERSION__: JSON.stringify(env.VITE_VERSION || '0.0.0')
      },
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@': resolve('src/renderer/src'),
          '@views': resolve('src/renderer/src/views'),
          '@imgs': resolve('src/renderer/src/assets/images'),
          '@icons': resolve('src/renderer/src/assets/icons'),
          '@utils': resolve('src/renderer/src/utils'),
          '@stores': resolve('src/renderer/src/store'),
          '@styles': resolve('src/renderer/src/assets/styles')
        }
      },
      plugins: [
        vue(),
        tailwindcss(),
        // 自动按需导入 API
        AutoImport({
          imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
          dts: 'src/renderer/src/types/import/auto-imports.d.ts',
          resolvers: [ElementPlusResolver()],
          eslintrc: {
            enabled: true,
            filepath: './src/renderer/.auto-import.json',
            globalsPropValue: true
          }
        }),
        // 自动按需导入组件
        Components({
          dts: 'src/renderer/src/types/import/components.d.ts',
          resolvers: [ElementPlusResolver()]
        }),
        // 按需定制主题配置
        ElementPlus({
          useSource: true
        }),
        // 压缩
        (viteCompression({
          verbose: false,
          disable: false,
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 10240,
          deleteOriginFile: false
        }) as any),
        (vueDevTools() as any)
      ] as any[],
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `
            @use "@styles/core/el-light.scss" as *; 
            @use "@styles/core/mixin.scss" as *;
          `
          }
        }
      },
      server: {
        proxy: {
          '/api': {
            target: env.VITE_API_PROXY_URL || 'https://m1.apifoxmock.com/m1/6400575-6097373-default',
            changeOrigin: true
          }
        }
      }
    }
  })
}
