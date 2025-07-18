<script setup lang="ts">
import { ref, onMounted } from 'vue'

const temperature = ref<string | null>(null)
const city = ref<string | null>(null)
const iconCode = ref<string | null>(null)
const description = ref<string | null>(null)
const weatherEmoji = ref<string>('')

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
      <button class="auth-button">
        <font-awesome-icon icon="sign-in-alt" /> Connexion
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  z-index: var(--z-header); // 100
  position: relative;
  background-color: var(--color-primary);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  height: 6rem;
  gap: var(--space-md);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.header-logo {
  flex-shrink: 0;

  .logo {
    height: 4rem;
    width: auto;
  }
}

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  font-size: var(--font-sm);
  gap: 0.15rem;
  

  .title {
    font-size: var(--font-lg);
    font-weight: bold;
    text-shadow: 0 0.0625rem 0.0625rem rgba(0, 0, 0, 0.15);
  }

  .weather-placeholder {
    font-size: var(--font-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    opacity: 0.9;

    .main-info {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      line-height: 1.1;
    }

    .description {
      font-size: var(--font-xs);
      opacity: 0.8;
      line-height: 1;
    }
  }
}

.header-action {
  flex-shrink: 0;
}

.auth-button {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  text-shadow: 0 0.0625rem 0.0625rem rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
  }

  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 0.125rem;
  }
}
/* Responsive adjustments */
@media (max-width: 480px) {
  .header {
    border-bottom-left-radius: 2rem;
    border-bottom-right-radius: 2rem;
  }
}
</style>
