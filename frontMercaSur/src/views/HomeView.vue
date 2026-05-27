<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api.js'
import crearcliente from '@/components/crearcliente.vue'
import empresa from '@/components/CrearEmpresas.vue'
import '@/assets/facebook.png'
import '@/assets/instagram.png'
import '@/assets/logo.png'

// Estado de selección
const tipoRegistro = ref('') // 'cliente' o 'empresa'

// Título dinámico
const tituloRegistro = computed(() => {
  if (tipoRegistro.value === 'cliente') return 'Registro de Cliente'
  if (tipoRegistro.value === 'empresa') return 'Registro de Empresa'
  return 'Sistema de Registro'
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

  <!-- Selección de tipo de registro -->
  <div v-if="!tipoRegistro" class="text-center my-4">
    <h4>Seleccione el tipo de registro que desea realizar</h4>
    <p class="text-muted mb-3">Elija la opción que corresponda a su tipo de relación con mercasur</p>
    <div class="d-flex justify-content-center gap-3 my-3">
      <button class="btn btn-success btn-lg" @click="tipoRegistro = 'cliente'">
        <i class="bi bi-person-plus"></i> Persona natural
      </button>
      <button class="btn btn-secondary btn-lg" @click="tipoRegistro = 'empresa'">
        <i class="bi bi-building"></i> Empresa / Persona jurídica
      </button>
    </div>
  </div>

  <!-- Componente según el tipo seleccionado -->
  <div v-if="tipoRegistro === 'cliente'">
    <crearcliente />
  </div>
  <div v-if="tipoRegistro === 'empresa'">
    <empresa />
  </div>
</template>
