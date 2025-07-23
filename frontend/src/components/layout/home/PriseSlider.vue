<script setup lang="ts">
import { Splide, SplideSlide } from '@splidejs/vue-splide'

type Prise = {
  id: string
  imageUrl: string
  espece: string
}

defineProps<{
  prises: Prise[]
}>()

const options = {
  type: 'loop',
  gap: '1rem',
  perPage: 1,
  autoplay: true,
  keyboard: true,

  pagination: true,
  breakpoints: {
    1440: { perPage: 2 }, // correspond à $breakpoint-laptop
    1024: { perPage: 1 }, // correspond à $breakpoint-tablet-lg
    768: { perPage: 1 },  // correspond à $breakpoint-tablet
  },
  speed: 600,
easing: 'ease',
    pauseOnHover: true,
    pauseOnFocus: true,
    resetProgress: false,
    focus: 'center',
    trimSpace: false,
    arrows: true,
};
</script>

<template>
  <div class="prise-slider">
    <Splide v-if="prises.length" :options="options" aria-label="Dernières prises publiées">
      <SplideSlide v-for="prise in prises" :key="prise.id">
  <div class="slide-card">
    <img :src="prise.imageUrl" :alt="`Prise de ${prise.espece}`" />
    <span class="badge">{{ prise.espece }}</span>
  </div>
</SplideSlide>
    </Splide>

    <p v-else class="prise-slider__empty">Aucune prise à afficher pour l'instant.</p>
  </div>
</template>

<style scoped src="../../styles/PriseSlider.scss" lang="scss" />