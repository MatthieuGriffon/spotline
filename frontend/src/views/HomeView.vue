<script setup lang="ts">
import PriseSlider from '@/components/layout/home/PriseSlider.vue'
import MiniMap from '@/components/ui/MiniMap.vue'
import TopEspecesCard from '@/components/stats/TopEspecesCard.vue'
import FeatureIntroCard from '@/components/layout/home/FeatureIntroCard.vue'
import EmailSentModal from '@/components/auth/EmailSentModal.vue'

import { ref } from 'vue'

const showEmailSentModal = ref(false)

const lastPrises = [
  { id: '1', imageUrl: '/img/demo1.webp', espece: 'Brochet' },
  { id: '2', imageUrl: '/img/demo2.webp', espece: 'Carpe' },
  { id: '3', imageUrl: '/img/demo3.jpg', espece: 'Truite' },
]

const mockSpots = [
  { id: 's1', lat: 47.22, lng: -1.55, label: 'Loire sauvage' },
  { id: 's2', lat: 47.24, lng: -1.53, label: 'Étang des pêcheurs' },
  { id: 's3', lat: 47.23, lng: -1.56, label: 'Bras caché' },
]

const topEspeces = [
  { id: 'brochet', nom: 'Brochet', count: 5, imageUrl: '/img/demo1.webp', espece: 'Brochet' },
  { id: 'carpe', nom: 'Carpe', count: 3, imageUrl: '/img/demo2.webp', espece: 'Carpe' },
  { id: 'truite', nom: 'Truite', count: 2, imageUrl: '/img/demo3.jpg', espece: 'Truite' },
]
</script>

<template>
  <Layout>
    <div class="hero-wrapper">
      <div class="hero-content">
        <div class="hero-illustration">
           <FeatureIntroCard />
        </div>
        <div class="hero-text-group">
          <div class="hero-presentation">
            <h1>Bienvenue sur Spotline</h1>
            <p>
              Spotline est l’application collaborative pensée pour les passionné·e·s de pêche.  
              Crée ton groupe, partage tes spots sur carte, publie tes prises, et organise des sessions !
            </p>
          </div>

          <div class="hero-presentation-secondary">
            <h2>Dernières prises</h2>
            <PriseSlider :prises="lastPrises" />
          </div>
        </div>
      </div>

      <div class="hero-map-section">
        <div class="hero-bottom">
  <div class="hero-map-preview">
    <h2>Spots partagés récemment</h2>
    <MiniMap :spots="mockSpots" />
    <button class="see-more-btn" role="button" aria-label="Voir tous les spots">Voir tous les spots</button>
  </div>

  <div class="hero-map-side-card">
    <TopEspecesCard :especes="topEspeces" />
  </div>
  </div>
</div>
    </div>
  
<EmailSentModal
  v-if="showEmailSentModal"
  @close="showEmailSentModal = false"
/>
  </Layout>
</template>

<style scoped src="@/views/styles/HomeView.scss" lang="scss" />
