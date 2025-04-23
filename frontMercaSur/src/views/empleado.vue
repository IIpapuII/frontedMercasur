<script setup>
import { ref, onMounted } from 'vue'
import  Empleado from '../components/crearempleado.vue'

// Coordenadas permitidas y rango máximo en metros
const LAT_OBJETIVO = 7.8772222222222
const LNG_OBJETIVO = -72.624722222222
const DISTANCIA_MAXIMA = 500 // metros

// Estados
const ubicacionActiva = ref(false)
const cargandoUbicacion = ref(true)
const errorUbicacion = ref('')
const dentroZona = ref(false)
const latitud = ref(null)
const longitud = ref(null)

// Función para calcular distancia entre dos puntos en la Tierra
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // en metros
}

const solicitarUbicacion = () => {
  cargandoUbicacion.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latitud.value = pos.coords.latitude
      longitud.value = pos.coords.longitude
      ubicacionActiva.value = true
      cargandoUbicacion.value = false

      const distancia = calcularDistancia(
        latitud.value,
        longitud.value,
        LAT_OBJETIVO,
        LNG_OBJETIVO
      )

      if (distancia <= DISTANCIA_MAXIMA) {
        dentroZona.value = true
      } else {
        dentroZona.value = false
        errorUbicacion.value = 'Debes estar dentro de la zona autorizada para continuar.'
      }
    },
    (err) => {
      ubicacionActiva.value = false
      cargandoUbicacion.value = false
      errorUbicacion.value = 'Debes activar la ubicación para continuar.'
      console.warn('Error ubicación:', err)
    }
  )
}

onMounted(() => {
  if ('geolocation' in navigator) {
    solicitarUbicacion()
  } else {
    cargandoUbicacion.value = false
    errorUbicacion.value = 'Tu navegador no soporta geolocalización.'
  }
})
</script>

<template>
  <nav class="navbar bg-body-tertiary rounded">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img alt="mercasur logo" src="@/assets/logo.svg" width="200" class="d-inline-block align-text-top">
      </a>
      <h2>Registro de Colaborador</h2>
    </div>
  </nav>

  <!-- Mensajes de estado -->
  <div v-if="!ubicacionActiva || !dentroZona" class="p-4 text-center">
    <p v-if="errorUbicacion" class="text-danger">{{ errorUbicacion }}</p>
    <p v-if="cargandoUbicacion">Solicitando permiso de ubicación...</p>
    <button
      v-else
      @click="solicitarUbicacion"
      class="btn btn-success mt-2"
    >
      Activar ubicación
    </button>
  </div>

  <!-- Mostrar componente solo si ubicación válida y dentro de la zona -->
  <div v-if="ubicacionActiva && dentroZona">
   <Empleado />
  </div>
</template>
