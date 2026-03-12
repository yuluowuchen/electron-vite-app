console.log('--- main.ts starting ---')
import App from './App.vue'
console.log('App.vue imported')
import { createApp } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter } from './router'               // Router
import language from './locales'                    // 国际化
console.log('Imports done')
import '@styles/core/tailwind.css'                  // tailwind
import '@styles/index.scss'                         // 样式
import '@utils/sys/console.ts'                      // 控制台输出内容
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'
console.log('Styles and utils imported')

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

console.log('Creating app...')
const app = createApp(App)
console.log('Initializing store...')
initStore(app)
console.log('Initializing router...')
initRouter(app)
console.log('Setting up directives...')
setupGlobDirectives(app)
console.log('Setting up error handle...')
setupErrorHandle(app)

app.use(language)
console.log('Mounting app...')
app.mount('#app')
console.log('--- main.ts finished ---')