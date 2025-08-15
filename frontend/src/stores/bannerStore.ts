import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBannerStore = defineStore('banner', () => {
  const recentJoin = ref<{ groupName: string; ts: number } | null>(null)

  function setRecentJoin(groupName: string) {
    recentJoin.value = { groupName, ts: Date.now() }
  }

  function clearRecentJoin() {
    recentJoin.value = null
  }

  return { recentJoin, setRecentJoin, clearRecentJoin }
})
