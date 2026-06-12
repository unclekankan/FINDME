import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import TestPage from '../views/TestPage.vue'
import ResultPage from '../views/ResultPage.vue'
import MusicTestPage from '../views/MusicTestPage.vue'
import MusicResultPage from '../views/MusicResultPage.vue'
import PlaylistPage from '../views/PlaylistPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import ComparePage from '../views/ComparePage.vue'
import IQEQPage from '../views/IQEQPage.vue'
import IQEQResultPage from '../views/IQEQResultPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/test', name: 'Test', component: TestPage },
  { path: '/result', name: 'Result', component: ResultPage },
  { path: '/music-test', name: 'MusicTest', component: MusicTestPage },
  { path: '/music-result', name: 'MusicResult', component: MusicResultPage },
  { path: '/playlist', name: 'Playlist', component: PlaylistPage },
  { path: '/profile', name: 'Profile', component: ProfilePage },
  { path: '/compare', name: 'Compare', component: ComparePage },
  { path: '/iqeq', name: 'IQEQ', component: IQEQPage },
  { path: '/iqeq-result', name: 'IQEQResult', component: IQEQResultPage },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
