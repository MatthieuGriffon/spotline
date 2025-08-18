import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBannerStore = defineStore('banner', () => {
  const recentJoin = ref<{ groupName: string; ts: number } | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null

  function setRecentJoin(groupName: string) {
    console.log('>>> setRecentJoin appelé avec :', groupName)
    if (timer) clearTimeout(timer)
    recentJoin.value = { groupName, ts: Date.now() }
    timer = setTimeout(() => {
      recentJoin.value = null
      timer = null
    }, 5000)
  }

  function clearRecentJoin() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    recentJoin.value = null
  }

  return { recentJoin, setRecentJoin, clearRecentJoin }
})
