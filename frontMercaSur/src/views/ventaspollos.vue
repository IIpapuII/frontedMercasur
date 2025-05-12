<template>
    <div class="container mt-4">
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-success text-white">
          <h4 class="mb-0">Registrar Nueva Venta de Pollos</h4>
        </div>
        <div class="card-body">
          <form @submit.prevent="crearVenta">
            <div class="row g-3">
              <div class="col-md-6">
                <label for="fechaVenta" class="form-label fw-semibold">Fecha de Venta:</label>
                <input type="date" id="fechaVenta" class="form-control" v-model="nuevaVenta.fecha" required>
              </div>
              <div class="col-md-6">
                <label for="ubicacionVenta" class="form-label fw-semibold">Ubicación:</label>
                <select id="ubicacionVenta" class="form-select" v-model="nuevaVenta.ubicacion" required
                        :disabled="computedIsFormUbicacionDisabled">
                  <option v-for="opcion in formUbicacionOptionsComputed"
                          :key="opcion.value"
                          :value="opcion.value"
                          :disabled="opcion.disabled">
                    {{ opcion.text }}
                  </option>
                </select>
              </div>
              <div class="col-md-12">
                <label for="valorVenta" class="form-label fw-semibold">Valor de Venta ($):</label>
                <input type="text" id="valorVenta" class="form-control"
                       v-model="valorVentaInput"
                       @focus="handleValorVentaFocus"
                       @blur="handleValorVentaBlur"
                       required placeholder="0.00">
              </div>
            </div>
  
            <button type="submit" class="btn btn-success mt-4 w-100" :disabled="loadingCrear">
              <span v-if="loadingCrear" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ loadingCrear ? 'Guardando...' : 'Registrar Venta' }}
            </button>
  
            <div v-if="errorCrear" class="alert alert-danger mt-3 p-2 text-center">{{ errorCrear }}</div>
            <div v-if="successCrear" class="alert alert-success mt-3 p-2 text-center">{{ successCrear }}</div>
          </form>
        </div>
      </div>
  
      <div class="card shadow-sm">
        <div class="card-header bg-success text-white">
          <h4 class="mb-0">Listado de Ventas de Pollos</h4>
        </div>
        <div class="card-body">
          <div class="row g-3 mb-3 align-items-end">
            <div class="col-md-4 col-lg-3">
              <label for="fechaInicioFiltro" class="form-label fw-semibold">Fecha Inicio:</label>
              <input type="date" id="fechaInicioFiltro" class="form-control" v-model="filtros.fecha_inicio">
            </div>
            <div class="col-md-4 col-lg-3">
              <label for="fechaFinFiltro" class="form-label fw-semibold">Fecha Fin:</label>
              <input type="date" id="fechaFinFiltro" class="form-control" v-model="filtros.fecha_fin">
            </div>
            <div class="col-md-4 col-lg-3">
              <label for="ubicacionFiltro" class="form-label fw-semibold">Ubicación:</label>
              <select id="ubicacionFiltro" class="form-select" v-model="filtros.ubicacion"
                      :disabled="computedIsFilterUbicacionDisabled">
                <option v-for="opcion in filterUbicacionOptionsComputed"
                        :key="opcion.value"
                        :value="opcion.value"
                        :disabled="opcion.disabled">
                  {{ opcion.text }}
                </option>
              </select>
            </div>
            <div class="col-md-12 col-lg-3">
              <button @click="aplicarFiltros" class="btn btn-success w-100 mt-3 mt-lg-0" :disabled="loadingListar">
                <span v-if="loadingListar" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Aplicar Filtros
              </button>
            </div>
          </div>
  
          <div v-if="loadingListar" class="text-center my-4">
            <div class="spinner-border text-success" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Buscando...</span>
            </div>
            <p class="mt-2">Buscando ventas...</p>
          </div>
  
          <div v-if="errorListar" class="alert alert-danger mt-3 p-2 text-center">{{ errorListar }}</div>
  
          <div v-if="searchPerformed">
            <div v-if="!loadingListar && !errorListar && ventas.length === 0" class="alert alert-info text-center">
              No se encontraron ventas con los filtros aplicados.
            </div>
            <div v-if="!loadingListar && !errorListar && ventas.length > 0" class="table-responsive">
              <table class="table table-striped table-hover table-bordered">
                <thead class="table-success">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Ubicación</th>
                    <th class="text-end">Valor Venta ($)</th>
                    <th>Registrado el</th>
                    <th>Actualizado el</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="venta in ventas" :key="venta.id">
                    <td>{{ venta.id }}</td>
                    <td>{{ formatDate(venta.fecha) }}</td>
                    <td>{{ venta.ubicacion }}</td>
                    <td class="text-end">{{ formatNumberCustom(venta.ValorVenta) }}</td>
                    <td>{{ formatDate(venta.create_date, true) }}</td>
                    <td>{{ formatDate(venta.update_date, true) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
           <div v-else-if="!loadingListar && !errorListar" class="alert alert-secondary text-center">
            Utilice los filtros para buscar ventas.
           </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, watch, nextTick, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '@/services/api'; // Asumiendo que tienes configurado tu servicio API
  
  const router = useRouter();
  
  const nuevaVenta = reactive({
    fecha: '',
    ubicacion: '', // Se preseleccionará en onMounted si es aplicable
    ValorVenta: null,
  });
  const valorVentaInput = ref('');
  const isValorVentaFocused = ref(false);
  
  const loadingCrear = ref(false);
  const errorCrear = ref('');
  const successCrear = ref('');
  
  const ventas = ref([]);
  const filtros = reactive({
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '', // Se preseleccionará en onMounted si es aplicable
  });
  const loadingListar = ref(false);
  const errorListar = ref('');
  const searchPerformed = ref(false);
  
  const userRoles = ref([]); // Almacenará los roles del usuario leídos desde localStorage
  
  // --- Lógica de Roles y Opciones de Ubicación ---
  
  const fetchUserRoles = () => {
    const storedRolesString = localStorage.getItem('user_roles');
    if (storedRolesString) {
      try {
        const roles = JSON.parse(storedRolesString);
        // Asegurarse de que roles sea un array y contenga strings
        if (Array.isArray(roles) && roles.every(role => typeof role === 'string')) {
          return roles;
        } else {
          console.warn('User roles from localStorage is not a valid array of strings:', roles);
          // Opcionalmente, redirigir o manejar este error de forma más robusta
          // router.push('/inicio-sesion');
          return [];
        }
      } catch (e) {
        console.error('Error parsing user roles from localStorage:', e);
        // Opcionalmente, redirigir o manejar este error
        // router.push('/inicio-sesion');
        return [];
      }
    }
    console.warn('No user roles found in localStorage.');
    // Opcionalmente, redirigir si los roles son estrictamente necesarios para esta vista
    // router.push('/inicio-sesion');
    return []; // Retorna un array vacío si no hay roles o hay error
  };
  
  const formUbicacionOptionsComputed = computed(() => {
    const opcionesBase = [];
    if (userRoles.value.includes('CALDAS')) {
      opcionesBase.push({ value: 'CALDAS', text: 'CALDAS' });
    }
    if (userRoles.value.includes('CENTRO')) {
      opcionesBase.push({ value: 'CENTRO', text: 'CENTRO' });
    }
  
    if (opcionesBase.length > 1) {
      // Si hay múltiples opciones, añadir un placeholder deshabilitado
      return [{ value: '', text: 'Seleccione una ubicación...', disabled: true }, ...opcionesBase];
    }
    // Si es 0 o 1 opción, se devuelve tal cual.
    // Si es 0, el select estará vacío. Si es 1, esa será la única opción.
    return opcionesBase;
  });
  
  const filterUbicacionOptionsComputed = computed(() => {
    const opcionesBase = [];
    if (userRoles.value.includes('CALDAS')) {
      opcionesBase.push({ value: 'CALDAS', text: 'CALDAS' });
    }
    if (userRoles.value.includes('CENTRO')) {
      opcionesBase.push({ value: 'CENTRO', text: 'CENTRO' });
    }
  
    if (opcionesBase.length > 1) {
      // Si hay múltiples opciones, añadir "Todas" como opción válida
      return [{ value: '', text: 'Todas' }, ...opcionesBase];
    }
    // Si solo tiene acceso a una (o ninguna), esa es la única opción de filtro (y no se necesita "Todas")
    return opcionesBase;
  });
  
  // Determina si el select del formulario debe estar deshabilitado
  const computedIsFormUbicacionDisabled = computed(() => {
    // Se deshabilita si solo hay una opción real (no el placeholder)
    const opcionesReales = formUbicacionOptionsComputed.value.filter(op => op.value !== '');
    return opcionesReales.length === 1;
  });
  
  // Determina si el select del filtro debe estar deshabilitado
  const computedIsFilterUbicacionDisabled = computed(() => {
    // Se deshabilita si solo hay una opción real (no la opción "Todas" que tiene value '')
    const opcionesReales = filterUbicacionOptionsComputed.value.filter(op => op.value !== '');
    return opcionesReales.length === 1;
  });
  
  onMounted(() => {
    userRoles.value = fetchUserRoles();
  
    const ubicacionesDisponiblesParaUsuario = [];
    if (userRoles.value.includes('CALDAS')) ubicacionesDisponiblesParaUsuario.push('CALDAS');
    if (userRoles.value.includes('CENTRO')) ubicacionesDisponiblesParaUsuario.push('CENTRO');
  
    if (ubicacionesDisponiblesParaUsuario.length === 1) {
      const unicaUbicacion = ubicacionesDisponiblesParaUsuario[0];
      nuevaVenta.ubicacion = unicaUbicacion;
      filtros.ubicacion = unicaUbicacion;
      // Los selects se deshabilitarán automáticamente por las computed properties
    } else {
      // Asegurar que si hay múltiples opciones, el valor por defecto permita el placeholder/Todas
      nuevaVenta.ubicacion = ''; // Para el placeholder "Seleccione una ubicación..."
      filtros.ubicacion = '';    // Para la opción "Todas"
    }
  });
  
  
  // --- Resto del script (formateo, API calls, etc.) ---
  
  const formatNumberCustom = (value, decimalPlaces = 2) => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) {
      return '';
    }
    const num = parseFloat(value);
    const fixedNum = num.toFixed(decimalPlaces);
    const parts = fixedNum.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };
  
  watch(valorVentaInput, (newInputString) => {
    if (!isValorVentaFocused.value) {
        return;
    }
    let cleanedValue = String(newInputString).replace(/,/g, '');
    let foundDecimalPoint = false;
    cleanedValue = cleanedValue.split('').filter(char => {
      if (char >= '0' && char <= '9') return true;
      if (char === '.') {
        if (!foundDecimalPoint) {
          foundDecimalPoint = true;
          return true;
        }
        return false;
      }
      return false;
    }).join('');
  
    if (cleanedValue.trim() === '') {
      nuevaVenta.ValorVenta = null;
    } else {
      const parsed = parseFloat(cleanedValue);
      if (!isNaN(parsed) && parsed >= 0) {
        nuevaVenta.ValorVenta = parsed;
      } else if (cleanedValue === '.') { // Permite punto decimal solo
        nuevaVenta.ValorVenta = 0; // o null, según preferencia
      }
    }
  });
  
  watch(() => nuevaVenta.ValorVenta, (newNumericValue) => {
    if (!isValorVentaFocused.value) {
      valorVentaInput.value = formatNumberCustom(newNumericValue);
    }
  }, { immediate: true });
  
  const handleValorVentaFocus = () => {
    isValorVentaFocused.value = true;
    if (nuevaVenta.ValorVenta !== null && nuevaVenta.ValorVenta !== undefined) {
      // Mostrar como número simple para facilitar la edición
      valorVentaInput.value = String(nuevaVenta.ValorVenta.toFixed(2)).replace(',', '.');
    } else {
      valorVentaInput.value = '';
    }
  };
  
  const handleValorVentaBlur = () => {
    isValorVentaFocused.value = false;
    // Formatear al perder el foco
    valorVentaInput.value = formatNumberCustom(nuevaVenta.ValorVenta);
  };
  
  const getToken = () => localStorage.getItem('token'); // Asume que el token se llama 'token'
  
  const getAuthHeaders = () => {
    const token = getToken();
    // Ajusta el prefijo del token (Bearer, Token, JWT, etc.) según tu backend
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  const handleAuthError = (targetErrorRef ,errorMsg = 'Su sesión ha expirado o no es válida.') => {
    targetErrorRef.value = `${errorMsg} Por favor, inicie sesión nuevamente.`;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh'); // Si también usas refresh token
    localStorage.removeItem('user_roles');
    localStorage.removeItem('username');
    router.push('/inicio-sesion'); // Ajusta la ruta de tu página de login
  };
  
  const resetForm = () => {
    nuevaVenta.fecha = '';
  
    const opcionesRealesForm = formUbicacionOptionsComputed.value.filter(op => op.value !== '');
    if (opcionesRealesForm.length > 1) {
        nuevaVenta.ubicacion = ''; // Resetear para mostrar placeholder si hay múltiples opciones
    } else if (opcionesRealesForm.length === 1) {
        nuevaVenta.ubicacion = opcionesRealesForm[0].value; // Mantener la única opción disponible
    } else {
        nuevaVenta.ubicacion = ''; // No hay opciones de ubicación
    }
  
    nuevaVenta.ValorVenta = null; // Esto dispara el watcher para limpiar valorVentaInput
    errorCrear.value = '';
    // successCrear no se resetea aquí para que el mensaje sea visible por un tiempo
  };
  
  const crearVenta = async () => {
    loadingCrear.value = true;
    errorCrear.value = '';
    successCrear.value = '';
  
    handleValorVentaBlur(); // Asegurar que el valor numérico esté actualizado
    await nextTick();
  
    if (!nuevaVenta.fecha || !nuevaVenta.ubicacion || nuevaVenta.ValorVenta === null || nuevaVenta.ValorVenta < 0) {
      errorCrear.value = 'Por favor, complete todos los campos. El valor de venta debe ser cero o mayor.';
      loadingCrear.value = false;
      return;
    }
  
    try {
      const payload = {
        fecha: nuevaVenta.fecha,
        ubicacion: nuevaVenta.ubicacion,
        ValorVenta: parseFloat(nuevaVenta.ValorVenta.toFixed(2)) // Enviar como número
      };
      // Confirma que el endpoint '/consecion-pollos/' es el correcto
      await api.post('/consecion-pollos/', payload, { headers: getAuthHeaders() });
      successCrear.value = '¡Venta registrada exitosamente!';
      resetForm();
      // Opcionalmente, podrías querer recargar la lista de ventas aquí
      if (searchPerformed.value) {
          aplicarFiltros();
      }
      setTimeout(() => successCrear.value = '', 4000);
    } catch (e) {
      if (e.response && e.response.status === 401) {
        handleAuthError(errorCrear);
      } else if (e.response && e.response.data) {
        const backendErrors = e.response.data;
        // Formatear errores del backend si es un objeto de errores por campo
        if (typeof backendErrors === 'object' && !Array.isArray(backendErrors)) {
          errorCrear.value = Object.entries(backendErrors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
        } else {
          errorCrear.value = String(backendErrors);
        }
      } else {
        errorCrear.value = 'Ocurrió un error al registrar la venta. Intente de nuevo.';
      }
      console.error("Error al crear venta:", e);
    } finally {
      loadingCrear.value = false;
    }
  };
  
  const listarVentas = async () => {
    loadingListar.value = true;
    errorListar.value = '';
    try {
      const params = { ...filtros };
      // No enviar el parámetro 'ubicacion' si está vacío (representa "Todas")
      if (!params.ubicacion) {
          delete params.ubicacion;
      }
      // De igual forma para fechas si no quieres enviarlas si están vacías
      if (!params.fecha_inicio) delete params.fecha_inicio;
      if (!params.fecha_fin) delete params.fecha_fin;
  
      // Confirma que el endpoint '/consecion-pollos/list/' es el correcto
      const response = await api.get('/consecion-pollos/list/', { params, headers: getAuthHeaders() });
      // Ajusta según la estructura de tu respuesta API (si es paginada, usa response.data.results)
      ventas.value = response.data.results || response.data;
    } catch (e) {
      if (e.response && e.response.status === 401) {
        handleAuthError(errorListar);
      } else {
        errorListar.value = 'Ocurrió un error al cargar el listado de ventas.';
      }
      console.error("Error al listar ventas:", e);
      ventas.value = []; // Limpiar ventas en caso de error
    } finally {
      loadingListar.value = false;
    }
  };
  
  const aplicarFiltros = () => {
    // Validaciones de fechas
    if (filtros.fecha_inicio && !filtros.fecha_fin) {
      errorListar.value = "Por favor, ingrese una fecha de fin si ingresó una fecha de inicio.";
      return;
    }
    if (!filtros.fecha_inicio && filtros.fecha_fin) {
      errorListar.value = "Por favor, ingrese una fecha de inicio si ingresó una fecha de fin.";
      return;
    }
    if (filtros.fecha_inicio && filtros.fecha_fin && new Date(filtros.fecha_inicio) > new Date(filtros.fecha_fin)) {
        errorListar.value = "La fecha de inicio no puede ser posterior a la fecha de fin.";
        return;
    }
    errorListar.value = ''; // Limpiar errores de validación previos
    searchPerformed.value = true;
    listarVentas();
  };
  
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
  
    // Asumimos que la fecha viene como YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss...
    // Para evitar problemas de zona horaria al parsear solo la parte de la fecha,
    // es mejor tratarla como UTC si no tiene información de zona horaria explícita.
    let dateObj;
    if (String(dateString).includes('T')) {
      dateObj = new Date(dateString); // Si tiene hora, parsear directamente
    } else {
      // Si es solo fecha (YYYY-MM-DD), añadir 'T00:00:00Z' para interpretarla como UTC
      // o 'T00:00:00' para interpretarla en la zona horaria local del navegador (puede ser inconsistente)
      // Para consistencia con fechas de Colombia, y si las fechas se guardan sin TZ pero se asumen de Colombia:
      dateObj = new Date(dateString + 'T00:00:00-05:00'); // Asumir explícitamente -05:00 (Colombia)
    }
  
  
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
  
    const dateOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Bogota' // Mostrar siempre en hora de Colombia
    };
  
    if (includeTime) {
      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit', // Opcional: añadir segundos
        hour12: true, // O false para formato de 24 horas
        timeZone: 'America/Bogota'
      };
      return `${dateObj.toLocaleDateString('es-CO', dateOptions)} ${dateObj.toLocaleTimeString('es-CO', timeOptions)}`;
    }
    return dateObj.toLocaleDateString('es-CO', dateOptions);
  };
  
  </script>
  
  <style scoped>
  .card-header h4 {
    font-weight: 500;
  }
  .table th, .table td {
    vertical-align: middle;
  }
  .table-responsive {
    max-height: 600px; /* Opcional: si quieres scroll en la tabla */
  }
  #valorVenta {
    text-align: right; /* Alinear texto a la derecha para valores numéricos */
  }
  </style>