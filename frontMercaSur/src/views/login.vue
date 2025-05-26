<template>
    <div class="login-container d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="login-box col-11 col-sm-8 col-md-6 col-lg-5 col-xl-4 col-xxl-3 card shadow-sm p-4 p-md-5">
        <div class="text-center mb-4">
          <img alt="Logo de Mercasur" src="@/assets/logo.svg" class="login-logo img-fluid" />
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
  import api from '@/services/api';
  
  export default {
    name: 'LoginViewMercasurBootstrap',
    setup() {
      const username = ref('');
      const password = ref('');
      const error = ref('');
      const loading = ref(false);
      const router = useRouter();
  
      const roleRedirectsFrontend = {
        admin:       { path: '/admin-dashboard', type: 'internal' },
        ventaspollos:  { path: '/concesion-pollos', type: 'internal' },
      };
  
      const handleLogin = async () => {
        error.value = '';
        loading.value = true;
  
        try {
          const tokenResponse = await api.post('/token/', {
            username: username.value,
            password: password.value,
          });
  
          const { access, refresh, role: userRolesArray } = tokenResponse.data;
  
          if (!userRolesArray || !Array.isArray(userRolesArray)) {
            error.value = 'Respuesta inesperada del servidor (roles).';
            loading.value = false;
            return;
          }
  
          localStorage.setItem('token', access);
          localStorage.setItem('refresh', refresh);
          localStorage.setItem('user_roles', JSON.stringify(userRolesArray)); 
          localStorage.setItem('username', username.value);
  
          const sessionResponse = await api.post('/iniciar-sesion-django/', {}, {
            headers: { 'Authorization': `Bearer ${access}` }
          });
  
          if (sessionResponse.data.success && sessionResponse.data.redirect_url) {
            const finalRedirectUrl = sessionResponse.data.redirect_url;
            let isVueRoute = false;

            for (const role in roleRedirectsFrontend) {
                if (roleRedirectsFrontend[role].path === finalRedirectUrl && roleRedirectsFrontend[role].type === 'internal') {
                    isVueRoute = true;
                    break;
                }
            }

            if (isVueRoute) {
                await router.push(finalRedirectUrl);
            } else {
                window.location.href = finalRedirectUrl;
            }
          } else {
            error.value = sessionResponse.data.message || 'No se pudo iniciar la sesión en el servidor.';
          }
  
        } catch (err) {
          if (err.response?.status === 401 && err.config.url.includes('/token/')) {
            error.value = 'Usuario o contraseña incorrectos.';
          } else if (err.response?.status === 401 && err.config.url.includes('/api/iniciar-sesion-django/')) {
            error.value = 'Token inválido o sesión expirada. Intenta de nuevo.';
          } else if (err.response?.data?.detail) {
            error.value = err.response.data.detail;
          } else {
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
  .login-logo {
    max-width: 180px;
    height: auto;
    margin-bottom: 1rem;
  }
  .login-title {
    font-weight: 500;
  }
  .spinner-border-sm {
    width: 1.25rem;
    height: 1.25rem;
    border-width: 0.2em;
  }
  </style>
