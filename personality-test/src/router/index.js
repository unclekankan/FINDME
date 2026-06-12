import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import TestPage from '../views/TestPage.vue'
import ResultPage from '../views/ResultPage.vue'
import MusicTestPage from '../views/MusicTestPage.vue'
import MusicResultPage from '../views/MusicResultPage.vue'
import PlaylistPage from '../views/PlaylistPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/test', name: 'Test', component: TestPage },
  { path: '/result', name: 'Result', component: ResultPage },
  { path: '/music-test', name: 'MusicTest', component: MusicTestPage },
  { path: '/music-result', name: 'MusicResult', component: MusicResultPage },
  { path: '/playlist', name: 'Playlist', component: PlaylistPage },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
