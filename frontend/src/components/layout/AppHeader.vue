<script setup lang="ts">
import { ref, onMounted } from 'vue'

const temperature = ref<string | null>(null)
const city = ref<string | null>(null)
const iconCode = ref<string | null>(null)
const description = ref<string | null>(null)
const weatherEmoji = ref<string>('')
defineEmits(['auth-requested'])
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const getWeatherEmoji = (icon: string): string => {
  const map: Record<string, string> = {
    '01d': '☀️', '01n': '🌙',
    '02d': '🌤️', '02n': '🌤️',
    '03d': '⛅', '03n': '⛅',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌦️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  }
  return map[icon] ?? '❔'
}

const fetchWeather = async (lat: number, lon: number) => {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}&lang=fr`
    )
    const data = await res.json()
    if (res.ok && data.main) {
      temperature.value = `${Math.round(data.main.temp)}°C`
      city.value = data.name
      iconCode.value = data.weather?.[0]?.icon ?? null
      description.value = data.weather?.[0]?.description ?? null
      weatherEmoji.value = getWeatherEmoji(iconCode.value ?? '')
    }
  } catch (err) {
    console.error('Erreur météo', err)
  }
}

onMounted(() => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      err => console.warn('Géoloc refusée', err),
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }
})
</script>
<template>
  <header class="header">
    <div class="header-logo">
      <img src="@/assets/logos/spotline_logo_34x64.png" alt="Logo Spotline" class="logo" />
    </div>
    
    <div class="header-center">
      <div class="title">Spotline</div>
      <div class="weather-placeholder" v-if="temperature && city">
        <div class="main-info">
          {{ weatherEmoji }} {{ temperature }} – {{ city }}
        </div>
        <div class="description" v-if="description">
          {{ description }}
        </div>
      </div>
    </div>

    <div class="header-action">
      <button class="auth-button" @click="$emit('auth-requested')">
  <font-awesome-icon icon="sign-in-alt" /> Connexion
</button>
    </div>
  </header>
</template>

<style scoped src="../styles/AppHeader.scss" lang="scss" />
