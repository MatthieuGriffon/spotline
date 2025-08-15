<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  // Ici on ne fait rien, le guard gère tout
  // On redirige vers home si on arrive ici sans token
  if (!route.params.token) {
    router.replace('/')
  }
})
</script>

<template>
  <div class="invite-wrapper">
    <h1>Traitement de l’invitation...</h1>
    <p>Merci de patienter, nous vous redirigeons automatiquement.</p>
  </div>
</template>
