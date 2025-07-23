<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import { ref, type Ref, watch } from 'vue'
const showAuthModal = ref(false)

watch(showAuthModal, value => {
  document.body.style.overflow = value ? 'hidden' : ''
})

</script>


<template>
  <div id="app">
    <AppHeader @auth-requested="showAuthModal = true" />

    <router-view />

    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
  </div>
</template>




