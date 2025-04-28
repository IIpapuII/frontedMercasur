<script setup>
import { ref, onMounted } from 'vue'
// Importa tu servicio API y el componente empleado
import api from '@/services/api.js' // Asegúrate que la ruta sea correcta
import empleado from '@/components/crearempleado.vue' // Asegúrate que la ruta sea correcta

// --- Estados para Código de Acceso ---
const codigoIngresado = ref('');
const codigoValidado = ref(false); // Indica si el código ingresado es correcto
const errorCodigo = ref(''); // Mensaje de error para el código

// --- Estados para Geolocalización y Zonas ---
const ubicacionActiva = ref(false);
const cargando = ref(false); // Un solo estado de carga para código/zonas/ubicación
const errorGeneral = ref(''); // Un solo mensaje de error para código/zonas/ubicación
const dentroZona = ref(false);
const latitud = ref(null);
const longitud = ref(null);
const zonasPermitidas = ref([]); // Almacenará las zonas de la API

// --- Función para validar el código de acceso llamando a la API ---
const validarCodigo = async () => {
  // Limpiar errores previos
  errorGeneral.value = '';
  errorCodigo.value = '';

  if (!codigoIngresado.value) {
      errorCodigo.value = 'Por favor, ingresa un código.';
      return; // No llamar a la API si el campo está vacío
  }

  cargando.value = true; // Iniciar estado de carga

  try {
    // Llamar al endpoint de Django para validar el código
    // Asegúrate de que el endpoint '/validar-codigo-acceso/' exista en tu backend
    // y que espere un POST con el código en el cuerpo.
    const response = await api.post('/validar-codigo-acceso/', {
      codigo: codigoIngresado.value
    });

    // Asumiendo que la API responde con un booleano o una estructura como { valido: true/false }
    if (response.data && (response.data === true || response.data.valido === true)) {
      // Código correcto
      codigoValidado.value = true;
      // Iniciar el proceso principal (obtener zonas y ubicación)
      iniciarProcesoPrincipal();
    } else {
      // Código incorrecto según la API
      codigoValidado.value = false;
      errorCodigo.value = 'Código de acceso incorrecto.';
      errorGeneral.value = 'Código de acceso incorrecto.'; // Mensaje general también
    }
  } catch (error) {
    // Error durante la llamada a la API (red, servidor, etc.)
    codigoValidado.value = false;
    errorCodigo.value = 'Error al validar el código. Intenta de nuevo.';
    errorGeneral.value = 'Error de comunicación al validar el código.';
    console.error('Error validando código vía API:', error);
  } finally {
    // Detener estado de carga independientemente del resultado
    // excepto si el código fue válido, en cuyo caso iniciarProcesoPrincipal ya puso cargando=true
    if (!codigoValidado.value) {
        cargando.value = false;
    }
  }
};

// --- Función Principal (se llama después de validar código) ---
const iniciarProcesoPrincipal = () => {
  // cargando.value ya debería ser true si se llama desde validarCodigo exitoso
  // Si se llama desde el botón reintentar, ponerlo en true
  cargando.value = true;
  errorGeneral.value = ''; // Limpiar errores previos
   if ('geolocation' in navigator) {
    // Primero obtener las zonas, luego solicitar ubicación
    obtenerZonasPermitidas();
  } else {
    cargando.value = false;
    errorGeneral.value = 'Tu navegador no soporta geolocalización.';
  }
}

// --- Carga las zonas permitidas desde la API ---
const obtenerZonasPermitidas = async () => {
  errorGeneral.value = 'Obteniendo información de zonas...'; // Mensaje de carga
  try {
    const response = await api.get('/zonas-permitidas/'); // Usa tu endpoint
    zonasPermitidas.value = response.data;
    if (zonasPermitidas.value && zonasPermitidas.value.length > 0) {
        console.log(`DEBUG: Zonas obtenidas: ${zonasPermitidas.value.length}`);
        // Si se obtuvieron zonas, solicitar ubicación
        solicitarUbicacion();
    } else {
        // No se encontraron zonas activas o hubo un problema
        cargando.value = false;
        errorGeneral.value = 'No se encontraron zonas permitidas activas.';
        console.warn('Respuesta de API de zonas vacía o inválida:', response.data);
    }
  } catch (error) {
    cargando.value = false;
    errorGeneral.value = 'Error al obtener la información de zonas permitidas.';
    console.error('Error obteniendo zonas:', error);
  }
}

// --- Solicita la ubicación del usuario ---
const solicitarUbicacion = () => {
  errorGeneral.value = 'Solicitando permiso y obteniendo ubicación...'; // Mensaje de carga
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latitud.value = pos.coords.latitude;
      longitud.value = pos.coords.longitude;
      ubicacionActiva.value = true;
      console.log(`DEBUG: Ubicación obtenida: ${latitud.value}, ${longitud.value}`);
      // Una vez obtenida la ubicación, verificar si está en zona
      verificarZonasPermitidas();
      cargando.value = false; // Termina la carga general aquí
    },
    (err) => {
      ubicacionActiva.value = false;
      cargando.value = false;
      // Mensajes de error específicos
      if (err.code === err.PERMISSION_DENIED) {
        errorGeneral.value = 'Permiso de ubicación denegado. Debes activarlo en la configuración.';
      } else if (err.code === err.POSITION_UNAVAILABLE) {
         errorGeneral.value = 'No se pudo determinar tu ubicación actual.';
      } else {
         errorGeneral.value = 'Ocurrió un error al obtener la ubicación.';
      }
      console.warn('Error ubicación:', err);
    },
    // Opciones para mejorar la precisión (opcional)
    {
      enableHighAccuracy: true,
      timeout: 15000, // Aumentar timeout ligeramente
      maximumAge: 0
    }
  );
}

// --- Función para calcular distancia (sin cambios) ---
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // en metros
}

// --- Verifica si la ubicación actual está dentro de alguna zona permitida ---
function verificarZonasPermitidas() {
  // Usamos .some() que se detiene en cuanto encuentra una coincidencia (más eficiente)
  dentroZona.value = zonasPermitidas.value.some((zona) => {
    // Validar que la zona tenga datos antes de calcular
    if (zona.latitude == null || zona.longitude == null || zona.max_distance == null) {
        console.warn(`DEBUG: Zona ID ${zona.id} (${zona.nombre}) omitida por datos incompletos.`);
        return false; // Saltar esta zona
    }
    try {
        const distancia = calcularDistancia(
          latitud.value,
          longitud.value,
          parseFloat(zona.latitude), // Asegurar que sean números
          parseFloat(zona.longitude)
        );
        const distanciaMaxima = parseInt(zona.max_distance, 10); // Asegurar que sea número entero

        console.log(`DEBUG: Distancia a zona ${zona.nombre} (ID: ${zona.id}): ${distancia.toFixed(2)} m (máx: ${distanciaMaxima} m)`);

        return distancia <= distanciaMaxima;

    } catch (e) {
        console.error(`Error calculando distancia para zona ${zona.id}: ${e}`);
        return false; // Si hay error en el cálculo, no considerar como válida
    }
  });

  // Establecer mensaje de error solo si la ubicación se obtuvo pero no está en zona
  if (ubicacionActiva.value && !dentroZona.value) {
    errorGeneral.value = 'Estás fuera de la zona permitida para el registro.';
  } else if (!ubicacionActiva.value && !errorGeneral.value) {
    // Si la ubicación no se activó y no hay otro error, poner un mensaje genérico
    // Considerar si este mensaje es necesario o si los errores específicos ya cubren los casos
    // errorGeneral.value = 'No se pudo verificar la ubicación o la zona.';
  }
}

// --- onMounted ---
// No hace nada al montar, espera la validación del código
onMounted(() => {
  console.log("Componente montado. Esperando código de acceso.");
});

</script>

<template>
  <nav class="navbar bg-body-tertiary rounded mb-4">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">
        <img alt="mercasur logo" src="@/assets/logo.svg" width="200" class="d-inline-block align-text-top">
      </a>
      <h2>Registro de Colaboradores</h2>
    </div>
  </nav>

  <div class="container" style="width: 600px;">
    <div v-if="!codigoValidado" class="card p-4 shadow-sm">
      <h5 class="card-title mb-3 text-center">Código de Acceso</h5>
      <div class="mb-3">
        <label for="codigoAcceso" class="form-label">Ingresa el código proporcionado:</label>
        <input
          type="password"
          id="codigoAcceso"
          class="form-control"
          :class="{ 'is-invalid': errorCodigo }"
          v-model="codigoIngresado"
          @keyup.enter="validarCodigo"
          placeholder="Código"
          aria-describedby="errorCodigoFeedback"
          :disabled="cargando" />
        <div id="errorCodigoFeedback" v-if="errorCodigo" class="invalid-feedback">
            {{ errorCodigo }}
        </div>
      </div>
      <button @click="validarCodigo" class="btn btn-success w-100" :disabled="cargando || !codigoIngresado">
        <span v-if="cargando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {{ cargando ? 'Validando...' : 'Validar Código' }}
      </button>
    </div>

    <div v-if="codigoValidado">
      <div v-if="cargando" class="alert alert-info text-center">
         <div class="spinner-border spinner-border-sm me-2" role="status">
           <span class="visually-hidden">Cargando...</span>
         </div>
        {{ errorGeneral || 'Procesando...' }} </div>

      <div v-if="!cargando && errorGeneral && !(ubicacionActiva && dentroZona)" class="alert alert-danger text-center">
        {{ errorGeneral }}
         <button
           v-if="!errorGeneral.includes('navegador no soporta') && !errorGeneral.includes('Código de acceso incorrecto')"
           @click="iniciarProcesoPrincipal"
           class="btn btn-warning btn-sm ms-2 mt-2"
         >
           Reintentar
         </button>
      </div>
    </div>
  </div>
  <section class="container mt-4" v-if="!cargando && ubicacionActiva && dentroZona">
  <empleado />
</section>
</template>

<style scoped>
/* Estilos básicos para el contenedor y la tarjeta */
.container {
  margin: auto;
  padding-top: 1rem;
}
.card {
  border: none;
}
/* Estilo para feedback inválido en Bootstrap 5 */
.is-invalid {
  border-color: #dc3545;
}
.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
</style>
