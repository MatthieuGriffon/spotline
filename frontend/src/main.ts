import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faFish, faMap, faUsers, faSun, faSignInAlt } from '@fortawesome/free-solid-svg-icons'
import 'leaflet/dist/leaflet.css'
import VueSplide from '@splidejs/vue-splide'
import '@splidejs/vue-splide/css/sea-green'
library.add(faUser, faFish, faMap, faUsers, faSun, faSignInAlt)


import App from './App.vue'
import router from './router'
import '@/assets/styles/base.scss';


const app = createApp(App)

app.use( VueSplide );
app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
