<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import L from 'leaflet'

type Spot = {
  id: string
  lat: number
  lng: number
  label?: string
}

const props = defineProps<{
  spots: Spot[]
  zoom?: number
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null

onMounted(() => {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: [props.spots[0]?.lat || 47.2, props.spots[0]?.lng || -1.55],
    zoom: props.zoom || 10,
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map)

  props.spots.forEach((spot) => {
    L.marker([spot.lat, spot.lng])
      .addTo(map!)
      .bindTooltip(spot.label || 'Spot')
  })
})

watch(() => props.spots, (newSpots) => {
  if (map && newSpots.length) {
    map.setView([newSpots[0].lat, newSpots[0].lng], props.zoom || 10)
  }
})
</script>

<template>
  <div ref="mapContainer" class="mini-map"></div>
</template>

<style scoped lang="scss">
.mini-map {
  width: 100%;
  aspect-ratio: 4 / 3; // 💡 rapport large classique (peut ajuster 16/9 ou carré)
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  @include respond(md) {
    aspect-ratio: 3 / 2;
  }

  @include respond(4k) {
    aspect-ratio: 16 / 9;
  }
}
</style>
