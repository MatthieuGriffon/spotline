<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found-wrapper">
    <h1>404</h1>
    <p>Oups, cette page n’existe pas.</p>
    <button class="btn primary" @click="goHome">Retour à l’accueil</button>
  </div>
</template>

<style scoped lang="scss">
.not-found-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
  padding: 1rem;
  color: white;

  h1 {
    font-size: 5rem;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 0.5rem;
  }
}
</style>