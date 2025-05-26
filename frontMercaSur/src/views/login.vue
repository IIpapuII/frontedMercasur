<template>
    <div class="login-container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="login-box col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4 col-xxl-3 card shadow-sm p-4 p-md-5">
        <div class="text-center mb-4">
          <img alt="Mercasur Logo" src="@/assets/logo.svg" class="login-logo img-fluid" />
        </div>
        <h2 class="login-title h3 text-center mb-4">Iniciar Sesión</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="username" class="form-label fw-semibold">Usuario:</label>
            <input
              type="text"
              id="username"
              class="form-control form-control-lg"
              v-model="username"
              required
              placeholder="Tu usuario"
            />
          </div>
          <div class="mb-3">
            <label for="password" class="form-label fw-semibold">Contraseña:</label>
            <input
              type="password"
              id="password"
              class="form-control form-control-lg"
              v-model="password"
              required
              placeholder="Tu contraseña"
            />
          </div>
          <button type="submit" class="btn btn-success btn-lg w-100 fw-semibold mt-4" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ loading ? 'Ingresando...' : 'Iniciar Sesión' }}
          </button>
        </form>
        <div v-if="error" class="text-danger mt-3 text-center small">{{ error }}</div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '@/services/api'; // Asegúrate de que tu instancia de Axios (api) esté bien configurada
  
  export default {
    name: 'LoginViewMercasurBootstrap', // Nombre del componente actualizado
    setup() {
      const username = ref('');
      const password = ref('');
      const error = ref('');
      const loading = ref(false);
      const router = useRouter();
  
      // Define las rutas de redirección para cada rol principal
      const roleRedirects = {
        admin: '/admin-dashboard', // Ejemplo: si tienes un rol 'admin'
        ventaspollos: '/concesion-pollos',
        presupuesto: '/presupuesto/reporte-cumplimiento/', // Ejemplo: si tienes un rol 'presupuesto'
        // Puedes añadir más roles y sus respectivas rutas aquí
        // cliente: '/panel-cliente',
      };
  
      // Define el orden de prioridad para la redirección si un usuario tiene múltiples roles principales
      // El primer rol en este array que el usuario posea y tenga una redirección definida, será usado.
      const rolePriorityOrder = ['admin', 'ventaspollos', 'presupuesto'/* 'cliente', ... */];
  
      const handleLogin = async () => {
        error.value = '';
        loading.value = true;
  
        try {
          const response = await api.post('/token/', { // Endpoint de tu API para obtener el token
            username: username.value,
            password: password.value,
          });
  
          // Asumiendo que la respuesta de la API es como la proporcionaste:
          // response.data = { access: "...", refresh: "...", role: ["rol1", "rol2", ...] }
          const { access, refresh, role: userRolesArray } = response.data;
  
          if (!userRolesArray || !Array.isArray(userRolesArray)) {
            console.error('La respuesta de la API no contiene un array de roles válido.');
            error.value = 'Error en los datos recibidos del servidor (roles).';
            loading.value = false;
            return;
          }
  
          // Guardar tokens y el array de roles en localStorage
          localStorage.setItem('token', access);
          localStorage.setItem('refresh', refresh);
          localStorage.setItem('user_roles', JSON.stringify(userRolesArray)); // Guardar el array de roles directamente
          localStorage.setItem('username', username.value);
  
  
          // Lógica de redirección basada en la prioridad de roles
          let targetRoute = '/'; // Ruta por defecto si ningún rol coincide o tiene redirección
          let redirected = false;
  
          for (const priorityRole of rolePriorityOrder) {
            if (userRolesArray.includes(priorityRole) && roleRedirects[priorityRole]) {
              targetRoute = roleRedirects[priorityRole];
              redirected = true;
              break; // Redirigir basado en el primer rol prioritario encontrado
            }
          }
  
          // Si no se redirigió por un rol prioritario, podrías tener una lógica adicional
          // o simplemente usar la ruta por defecto.
          // Por ejemplo, si ningún rol en rolePriorityOrder está, pero 'ventaspollos' está y no estaba en la lista de prioridad:
          if (!redirected && userRolesArray.includes('ventaspollos') && roleRedirects['ventaspollos']) {
               targetRoute = roleRedirects['ventaspollos'];
          }
          // Esta lógica adicional puede ser tan compleja como necesites.
          // La forma más simple es confiar en rolePriorityOrder.
  
          await router.push(targetRoute);
  
        } catch (err) {
          if (err.response?.status === 401) {
            error.value = 'Usuario o contraseña incorrectos.';
          } else if (err.response?.data) {
              // Mostrar errores más específicos del backend si están disponibles
              const responseData = err.response.data;
              if (typeof responseData.detail === 'string') {
                  error.value = responseData.detail;
              } else if (Array.isArray(responseData.detail)) {
                  error.value = responseData.detail.join(' ');
              } else if (typeof responseData === 'string') {
                  error.value = responseData;
              } else {
                  error.value = 'Error de conexión o del servidor. Intenta más tarde.';
              }
          }
          else {
            error.value = 'Error de conexión o del servidor. Intenta más tarde.';
            console.error("Login error details:", err);
          }
        } finally {
          loading.value = false;
        }
      };
  
      return {
        username,
        password,
        error,
        loading,
        handleLogin,
      };
    },
  };
  </script>
  
  <style scoped>
  .login-container {
    /* background-color: #f8f9fa; */ /* Ya está en la clase bg-light */
  }
  .login-logo {
    max-width: 180px; /* Ajusta según el tamaño de tu logo */
    height: auto;
    margin-bottom: 1rem; /* Espacio debajo del logo */
  }
  .login-title {
    font-weight: 500; /* Un poco menos grueso que fw-semibold si quieres variar */
  }
  /* .form-control-lg {
    padding: 0.75rem 1rem;
    font-size: 1.1rem; 
  } */
  /* .btn-lg {
    padding: 0.75rem 1rem;
    font-size: 1.1rem;
  } */
  .spinner-border-sm {
    width: 1.25rem; /* Un poco más grande para mejor visibilidad en botón lg */
    height: 1.25rem;
    border-width: 0.2em;
  }
  </style>