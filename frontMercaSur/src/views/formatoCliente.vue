<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api.js'
import clienteFormato from '@/components/componenteFormato.vue'
import empresaFormato from '@/components/formatoempresa.vue'

// Estados de ubicación
const ubicacionActiva = ref(false)
const cargandoUbicacion = ref(true)
const errorUbicacion = ref('')
const dentroZona = ref(false)
const latitud = ref(null)
const longitud = ref(null)
const zonasPermitidas = ref([])

// Estado de selección
const tipoRegistro = ref('') // 'cliente' o 'empresa'

// Título dinámico
const tituloRegistro = computed(() => {
  if (tipoRegistro.value === 'cliente') return 'Registro de Cliente por Formato'
  if (tipoRegistro.value === 'empresa') return 'Registro de Empresa por Formato'
  return 'Registro por Formato'
})

// Función para calcular distancia entre dos puntos
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function verificarZonasPermitidas() {
  dentroZona.value = zonasPermitidas.value.some((zona) => {
    const distancia = calcularDistancia(
      latitud.value,
      longitud.value,
      zona.latitude,
      zona.longitude
    )
    return distancia <= zona.max_distance
  })

  if (!dentroZona.value) {
    errorUbicacion.value = 'Debes estar dentro de una zona autorizada para continuar.'
  }
}

const solicitarUbicacion = () => {
  cargandoUbicacion.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latitud.value = pos.coords.latitude
      longitud.value = pos.coords.longitude
      ubicacionActiva.value = true
      cargandoUbicacion.value = false
      verificarZonasPermitidas()
    },
    (err) => {
      ubicacionActiva.value = false
      cargandoUbicacion.value = false
      errorUbicacion.value = 'Debes activar la ubicación para continuar.'
      console.warn('Error ubicación:', err)
    }
  )
}

const obtenerZonasPermitidas = async () => {
  try {
    const response = await api.get('/zonas-permitidas/')
    zonasPermitidas.value = response.data.results || []
    solicitarUbicacion()
  } catch (error) {
    cargandoUbicacion.value = false
    errorUbicacion.value = 'No se pudo obtener la información de zonas permitidas.'
    console.error('Error obteniendo zonas:', error)
  }
}

onMounted(() => {
  if ('geolocation' in navigator) {
    obtenerZonasPermitidas()
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
      <h2>{{ tituloRegistro }}</h2>
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

  <!-- Selección de tipo de registro -->
  <div v-if="ubicacionActiva && dentroZona && !tipoRegistro" class="text-center my-4">
    <h4>Seleccione el tipo de registro</h4>
    <div class="d-flex justify-content-center gap-3 my-3">
      <button class="btn btn-success" @click="tipoRegistro = 'cliente'">Registrar Cliente</button>
      <button class="btn btn-secondary" @click="tipoRegistro = 'empresa'">Registrar Empresa</button>
    </div>
  </div>

  <!-- Componente según el tipo seleccionado -->
  <div v-if="tipoRegistro === 'cliente'">
    <clienteFormato />
  </div>
  <div v-if="tipoRegistro === 'empresa'">
    <empresaFormato />
  </div>
</template>
