
<template>
  <main class="container mt-2">
    <div v-if="globalError" class="alert alert-danger mt-3" role="alert">
      {{ globalError }}
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row mb-3">
            <div class="col-md-6">
              <label for="numeroDocumento" class="form-label"
                >Número de Documento</label
              >
              <div class="input-group">
                <input
                  type="number"
                  id="numeroDocumento"
                  class="form-control"
                  placeholder="Número de Documento"
                  aria-label="Número de Documento"
                  v-model.trim="numeroDocumento"
                  @blur="checkClienteExistente"
                  :disabled="ClienteExiste || loading"
                  required
                  pattern="\d{8,10}"
                  title="Debe tener entre 8 y 10 dígitos numéricos."
                />
                <span v-if="loading" class="input-group-text">
                  <div
                    class="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span class="visually-hidden">Verificando...</span>
                  </div>
                </span>
              </div>
              <div v-if="errorDocumento" class="text-danger mt-1 small">
                El número de documento debe tener entre 8 y 10 dígitos.
              </div>
            </div>
          </div>

          <div v-if="formactive">
            <div class="row mt-2 g-3">
              <div class="col-md-6">
                <label for="primer-apellido" class="form-label"
                  >Primer Apellido</label
                >
                <input
                  type="text"
                  id="primer-apellido"
                  class="form-control"
                  v-model="primerApellido"
                  @input="convertToUppercase('primerApellido')"
                  :disabled="ClienteExiste"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="segundo-apellido" class="form-label"
                  >Segundo Apellido</label
                >
                <input
                  type="text"
                  id="segundo-apellido"
                  class="form-control"
                  v-model="segundoApellido"
                  @input="convertToUppercase('segundoApellido')"
                  :disabled="ClienteExiste"
                />
              </div>
              <div class="col-md-6">
                <label for="primer-nombre" class="form-label"
                  >Primer Nombre</label
                >
                <input
                  type="text"
                  id="primer-nombre"
                  class="form-control"
                  v-model="primerNombre"
                  @input="convertToUppercase('primerNombre')"
                  :disabled="ClienteExiste"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="segundo-nombre" class="form-label"
                  >Segundo Nombre</label
                >
                <input
                  type="text"
                  id="segundo-nombre"
                  class="form-control"
                  v-model="segundoNombre"
                  @input="convertToUppercase('segundoNombre')"
                  :disabled="ClienteExiste"
                />
              </div>
              <div class="col-md-6">
                <label for="fecha-nacimiento" class="form-label"
                  >Fecha Nacimiento</label
                >
                <input
                  type="date"
                  id="fecha-nacimiento"
                  class="form-control"
                  v-model="fechaNacimiento"
                  @change="validateAge"
                  :disabled="ClienteExiste"
                  required
                />
                <div v-if="errorFechaNacimiento" class="text-danger mt-1 small">
                  Debes tener al menos 18 años.
                </div>
              </div>
              <div class="col-md-6">
                <label for="correo" class="form-label"
                  >Correo Electrónico</label
                >
                <input
                  type="email"
                  id="correo"
                  class="form-control"
                  placeholder="tu@correo.com"
                  v-model="correo"
                  required
                />
              </div>
            </div>

            <div class="row mt-3 g-3">
              <div class="col-md-6">
                <label for="celular" class="form-label">Celular</label>
                <input
                  type="number"
                  id="celular"
                  class="form-control"
                  placeholder="Celular"
                  v-model="celular"
                  required
                />
              </div>
              <div class="col-md-6">
                <label for="telefono" class="form-label"
                  >Teléfono (Opcional)</label
                >
                <input
                  type="number"
                  id="telefono"
                  class="form-control"
                  placeholder="Teléfono"
                  v-model="telefono"
                />
              </div>
              <div class="col-md-3">
                <label for="tipo_via" class="form-label">Tipo de vía</label>
                <select
                  class="form-select"
                  id="tipo_via"
                  v-model="tipoVia"
                  required
                >
                  <option selected disabled value="">Seleccione...</option>
                  <tipo_via />
                </select>
              </div>
              <div class="col-md-9">
                <label for="direccion" class="form-label">Dirección</label>
                <input
                  type="text"
                  class="form-control"
                  id="direccion"
                  v-model="direccion"
                  @input="convertToUppercase('direccion')"
                  placeholder="Ej: CL 45B # 23-10"
                  required
                />
              </div>
                <div class="col-md-6">
                  <label for="barrio" class="form-label">Barrio</label>
                  <select
                    id="barrio"
                    class="form-select"
                    v-model="barrio"
                    required
                  >
                    <option disabled value="">Seleccione un barrio</option>
                    <option
                      v-for="item in barrios"
                      :key="item.nombre"
                      :value="item.nombre"
                    >
                      {{ item.nombre }}
                    </option>
                  </select>
                </div>
              <div class="col-md-6">
                <label for="ciudadList" class="form-label"
                  >Ciudad o Municipio</label
                >
                <input
                  class="form-control"
                  list="datalistOptions"
                  id="ciudadList"
                  v-model="ciudad"
                  @input="convertToUppercase('ciudad')"
                  placeholder="Escribe para buscar..."
                  required
                />
                <datalist id="datalistOptions">
                  <option v-for="c in ciudades" :key="c" :value="c"></option>
                </datalist>
              </div>
            </div>

            <div class="row mt-3 g-3">
              <div class="col-md-6">
                <label for="mascota" class="form-label">¿Tienes mascota?</label>
                <select
                  class="form-select"
                  v-model="mascota"
                  id="mascota"
                  required
                >
                  <option selected disabled value="">
                    Selecciona una opción
                  </option>
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="otro">Otro</option>
                  <option value="ninguna">Ninguna</option>
                </select>
                <div class="mt-2" v-if="mascota === 'OTRO'">
                  <label for="otra-mascota" class="form-label"
                    >¿Qué mascota tienes?</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    v-model="otraMascota"
                    placeholder="Especifica tu mascota"
                    id="otra-mascota"
                    @input="convertToUppercase('otraMascota')"
                  />
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label d-block mb-2"
                  >¿Cómo prefieres recibir información?</label
                >
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="emailCheck"
                    v-model="preferencias.email"
                  />
                  <label class="form-check-label" for="emailCheck">Email</label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="whatsappCheck"
                    v-model="preferencias.whatsapp"
                  />
                  <label class="form-check-label" for="whatsappCheck"
                    >WhatsApp</label
                  >
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="smsCheck"
                    v-model="preferencias.sms"
                  />
                  <label class="form-check-label" for="smsCheck">SMS</label>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="redesCheck"
                    v-model="preferencias.redesSociales"
                  />
                  <label class="form-check-label" for="redesCheck"
                    >Redes Sociales</label
                  >
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="llamadaCheck"
                    v-model="preferencias.llamada"
                  />
                  <label class="form-check-label" for="llamadaCheck"
                    >Llamadas</label
                  >
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="ningunaCheck"
                    v-model="preferencias.ninguna"
                  />
                  <label class="form-check-label" for="ningunaCheck"
                    >Ninguna</label
                  >
                </div>
              </div>
            </div>

            <div class="row mt-3 align-items-center">
              <div class="col-md-6">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="politicaCheck"
                    required
                    :checked="politica"
                    @change.prevent
                    disabled 
                  />
                  <label class="form-check-label" for="politicaCheck">
                    He leído y acepto la 
                  </label>
                  <a
                      href="#"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      > política de tratamiento de datos</a
                    >.
                </div>
              <small
                v-if="!politica"
                class="text-danger"
              >
                * Debes aceptar la política de tratamiento de datos para poder registrarte.
              </small>
              </div>
                <div class="col-md-6" v-if="firmaStatus">
                  <label class="form-label d-block">Firma:</label>
                  <SignaturePad ref="firmaComponent" />
                  <div v-if="showSignatureError" class="text-danger mt-1 small">
                    Por favor, proporcione su firma.
                  </div>
                </div>
            </div>

            <div class="row mt-4">
              <div class="col">
                <button
                  type="submit"
                  class="btn btn-success w-100"
                  :disabled="loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {{
                    loading
                      ? "Procesando..."
                      : ClienteExiste
                      ? "Actualizar Datos"
                      : "Registrarme"
                  }}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div
      class="modal fade"
      id="exampleModal"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
      ref="policyModalRef"
    >
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header" v-if="!tarjeta">
            <h1 class="modal-title fs-5" id="exampleModalLabel">
              Autorización para el Tratamiento de Datos Personales
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="politicaState"
            ></button>
          </div>
          <div class="modal-header" v-if="tarjeta">
            <h1 class="modal-title fs-5" id="fidelizacionModalLabel">
              Confirmar Fidelización
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              @click="cancelarFidelizacion"
            ></button>
          </div>

          <div class="modal-body">
            <tratamiento v-if="!tarjeta" />
            <div v-if="tarjeta">
              <p>
                ¿Te gustaría unirte a nuestro programa de fidelización para
                acumular puntos y disfrutar de beneficios exclusivos?
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <div v-if="!tarjeta">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="politicaState"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-success"
                @click="ConfirmarTrantamiento"
              >
                Acepto y Confirmo Tratamiento
              </button>
            </div>
            <div v-if="tarjeta">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="cancelarFidelizacion"
              >
                No, gracias
              </button>
              <button
                type="button"
                class="btn btn-success"
                data-bs-dismiss="modal"
                @click="ConfirmarFidelizacion"
              >
                ¡Sí, quiero unirme!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
// Importaciones estándar de Options API
import axios from "axios";
import SignaturePad from "./signatured.vue"; // Corregido nombre y ruta
import tratamiento from "./tratamiento.vue"; // Asumiendo que existe
import tipo_via from "./tipovia.vue"; // Asumiendo que existe

export default {
  // Registro de componentes
  components: {
    SignaturePad,
    tratamiento,
    tipo_via,
  },
  data() {
    return {
      // --- Datos del Formulario ---
      primerApellido: "",
      segundoApellido: "",
      primerNombre: "",
      segundoNombre: "",
      numeroDocumento: "",
      fechaNacimiento: "",
      correo: "",
      telefono: "",
      celular: "",
      tipoVia: "",
      direccion: "",
      barrio: "",
      ciudad: "",
      mascota: "",
      otraMascota: "",
      preferencias: {
        // Inicializados en false
        email: false,
        whatsapp: false,
        sms: false,
        redesSociales: false,
        llamada: false,
        ninguna: false,
      },
      // --- Estado del Componente ---
      ciudades: ["Floridablanca", "Piedecuesta", "Giron", "Bucaramanga"], // Podría venir de API
      politica: false, // Si la política ha sido aceptada
      fidelizacion: false, // Si aceptó fidelización
      ClienteExiste: false, // Si el cliente ya está registrado
      formactive: false, // Si el resto del formulario está visible
      firmaStatus: false, // Si el campo de firma debe mostrarse
      tarjeta: false, // Estado interno del modal (mostrando política o fidelización)
      loading: false, // Estado de carga general (API calls)
      // --- Errores de Validación ---
      errorFechaNacimiento: false,
      errorDocumento: false,
      showSignatureError: false, // Error específico de firma vacía
      globalError: null, // Mensaje de error general (opcional)
      barrios: []
    };
  },
  mounted() {
    // Cargar barrios desde la API al montar el componente
    this.loadBarrios();
  },
  methods: {
    // --- Cargar Barrios ---
    async loadBarrios() {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/barrios/"
        );
        this.barrios = response.data;
      } catch (error) {
        console.error("Error al cargar barrios:", error);
        this.globalError = "No se pudo cargar la lista de barrios.";
      }
    },
    // --- Utilitarios ---
    convertToUppercase(field) {
      // Evita error si el campo es null o undefined brevemente
      if (this[field] !== null && this[field] !== undefined) {
        this[field] = this[field].toUpperCase();
      }
    },

    // --- Validaciones ---
    validateAge() {
      this.errorFechaNacimiento = false; // Reset error
      if (!this.fechaNacimiento) return;

      const birthDate = new Date(this.fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const month = today.getMonth() - birthDate.getMonth();
      if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      this.errorFechaNacimiento = age < 18;
      // Ya no se llama a showErrorModal inexistente
    },

    validateDocument() {
      this.errorDocumento = false; // Reset error
      if (!this.numeroDocumento) return true; // Permite continuar si está vacío (se valida con required)
      const docString = this.numeroDocumento.toString();
      const longitud = docString.length;
      this.errorDocumento = longitud < 8 || longitud > 10;
      return !this.errorDocumento; // Devuelve true si es válido
    },

    // --- Lógica de Modales ---
    ConfirmarTrantamiento() {
      this.politica = true; // Marca la política como aceptada
      this.tarjeta = true; // Cambia el estado del modal a mostrar fidelización
      this.firmaStatus = true; // Muestra el campo de firma
      // No cerramos el modal aquí, el usuario decide sobre fidelización
    },
    ConfirmarFidelizacion() {
      this.fidelizacion = true;
      this.tarjeta = false; // Resetea el estado del modal
      // Cerramos el modal manualmente usando la referencia
    },
    politicaState() {
      // Al cerrar el modal o cancelar política
      this.politica = false;
      this.firmaStatus = false;
      this.tarjeta = false;
      // Asegúrate que el modal se cierre (Bootstrap debería hacerlo con data-bs-dismiss)
    },
    cancelarFidelizacion() {
      // Al hacer clic en "No, gracias" o cerrar el modal de fidelización
      this.fidelizacion = false;
      this.tarjeta = false; // Resetea el estado del modal
      // Cerramos el modal manualmente
    },
    // Helper para cerrar el modal programáticamente
    hidePolicyModal() {
      const modalElement = this.$refs.policyModalRef; // Usa la ref añadida al modal
      if (modalElement) {
        try {
          const modalInstance = bootstrap.Modal.getInstance(modalElement); // Si Bootstrap es global
          if (modalInstance) {
            modalInstance.hide();
          } else {
            // Fallback si getInstance falla (a veces pasa en HMR)
            const newModalInstance = new bootstrap.Modal(modalElement);
            newModalInstance.hide();
          }
        } catch (e) {
          console.error("Error al intentar cerrar el modal:", e);
        }
      }
    },

    // --- API Call ---
    async checkClienteExistente() {
      if (!this.validateDocument()) return; // Valida longitud primero

      this.loading = true;
      this.formactive = false; // Oculta el resto del form mientras verifica
      this.ClienteExiste = false; // Resetea estado
      this.globalError = null; // Limpia errores previos

      try {
        const response = await axios.get(
          "https://aceitera.cubocloud.com:8000/api/clientes/",
          {
            params: { numero_documento: this.numeroDocumento },
          }
        );

        if (response.data.existe) {
          const cliente = response.data.cliente;
          // Rellena los campos solo si el cliente existe
          this.primerApellido = cliente.primer_apellido || "";
          this.segundoApellido = cliente.segundo_apellido || "";
          this.primerNombre = cliente.primer_nombre || "";
          this.segundoNombre = cliente.segundo_nombre || "";
          this.fechaNacimiento = cliente.fecha_nacimiento || "";
          // Rellenar otros campos si vienen del backend (correo, tel, dirección, etc.)
          // Rellenar preferencias, política, fidelización si vienen del backend
          this.politica = cliente.acepto_politica || false; // Importante
          this.fidelizacion = cliente.fidelizacion || false; // Importante

          this.ClienteExiste = true;
          this.firmaStatus = false; // Por defecto, no pedimos firma si ya existe (a menos que la lógica lo requiera)
        } else {
          // Cliente no existe, resetea campos por si acaso y prepara para nuevo registro
          this.resetPartialForm(); // Limpia campos excepto documento
          this.ClienteExiste = false;
          this.politica = false; // Necesita aceptar política
          this.fidelizacion = false;
          this.firmaStatus = false; // Se activará al aceptar política
        }
        this.formactive = true; // Muestra el resto del formulario
      } catch (error) {
        console.error("Error al buscar el cliente:", error);
        this.globalError =
          "Error al verificar el documento. Intente más tarde.";
        this.formactive = false; // Mantiene oculto el form si hay error
      } finally {
        this.loading = false; // Oculta spinner en cualquier caso
      }
    },

    // --- Limpieza de Formulario ---
    resetPartialForm() {
      // Limpia solo los campos rellenables
      this.primerApellido = "";
      this.segundoApellido = "";
      this.primerNombre = "";
      this.segundoNombre = "";
      this.fechaNacimiento = "";
      this.correo = "";
      this.telefono = "";
      this.celular = "";
      this.tipoVia = "";
      this.direccion = "";
      this.barrio = ""; // Resetea el ID del barrio
      this.ciudad = "";
      this.mascota = "";
      this.otraMascota = "";
      this.preferencias = {
        email: false,
        whatsapp: false,
        sms: false,
        redesSociales: false,
        llamada: false,
        ninguna: false,
      };
      // No resetea politica, fidelizacion, firmaStatus aquí, se manejan en checkClienteExistente o modales
    },

    resetForm() {
      // Limpieza completa
      console.log("Resetting form completely...");
      this.resetPartialForm(); // Llama a la limpieza parcial
      this.numeroDocumento = ""; // Limpia también el documento
      // Resetea estados clave
      this.politica = false;
      this.ClienteExiste = false;
      this.tarjeta = false;
      this.fidelizacion = false;
      this.loading = false;
      this.formactive = false; // Oculta formulario
      this.firmaStatus = false; // Oculta campo de firma
      // Resetea errores
      this.errorDocumento = false;
      this.errorFechaNacimiento = false;
      this.showSignatureError = false;
      this.globalError = null;
      // Limpiar el canvas de firma si la referencia existe
      if (this.$refs.firmaComponent) {
        this.$refs.firmaComponent.clearCanvas();
      }
    },

    // --- Envío de Formulario ---
    async handleSubmit() {
      console.log("Iniciando handleSubmit...");
      this.globalError = null; // Limpia errores globales

      // --- Validaciones Previas ---
      this.validateAge(); // Valida edad
      if (this.errorFechaNacimiento) {
        this.globalError = "Debe ser mayor de 18 años para registrarse.";
        window.scrollTo(0, 0); // Scroll arriba para ver el error
        return;
      }

      if (!this.validateDocument()) {
        // Valida longitud documento
        this.globalError = "El número de documento no es válido.";
        window.scrollTo(0, 0);
        return;
      }

      // Validar si aceptó la política (importante)
      if (!this.politica) {
        this.globalError =
          "Debe aceptar la política de tratamiento de datos para continuar.";
        // Opcional: abrir modal si se desea forzar
        // const modal = new bootstrap.Modal(this.$refs.policyModalRef); modal.show();
        window.scrollTo(0, 0);
        return;
      }

      // --- Obtener Firma (si aplica) ---
      let signatureBase64 = null;
      this.showSignatureError = false; // Resetea error específico

      if (this.firmaStatus) {
        // Si el campo de firma está visible/activo
        const signatureComponent = this.$refs.firmaComponent; // CORREGIDO: nombre de ref
        if (!signatureComponent) {
          console.error("Referencia al componente de firma no encontrada.");
          this.globalError =
            "Error interno al procesar la firma. Intente recargar.";
          window.scrollTo(0, 0);
          return;
        }

        if (signatureComponent.isEmpty()) {
          // CORREGIDO: Llamada al método correcto
          console.log("La firma está vacía.");
          this.showSignatureError = true; // Muestra el error bajo el canvas
          this.globalError =
            "La firma es requerida. Por favor, firme en el espacio provisto.";
          window.scrollTo(0, 0); // Ayuda a ver el campo de firma
          return;
        } else {
          signatureBase64 = signatureComponent.getSignatureBase64(); // CORREGIDO: Llamada al método correcto
          if (!signatureBase64) {
            console.error("Error al obtener la firma en formato Base64.");
            this.globalError =
              "Ocurrió un error al procesar la firma. Intente firmar de nuevo.";
            window.scrollTo(0, 0);
            return;
          }
          console.log("Firma obtenida OK.");
        }
      } else {
        console.log("El campo de firma no está activo.");
        // Considerar si la firma es *siempre* necesaria incluso al actualizar
      }

      // --- Obtener IP y Geolocalización (con manejo de errores) ---
      let ip = null;
      let location = { latitude: null, longitude: null };
      try {
        const ipPromise = axios.get("https://api.ipify.org?format=json", {
          timeout: 5000,
        }); // Timeout para IP
        const locationPromise = new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            return reject(
              new Error("Geolocalización no soportada por el navegador.")
            );
          }
          navigator.geolocation.getCurrentPosition(
            (position) =>
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            (error) => reject(error), // Rechaza si hay error de geoloc
            { timeout: 10000, enableHighAccuracy: false } // Timeout y menos precisión (más rápido)
          );
        });

        // Espera ambas promesas pero no falla si una no se completa
        const [ipResult, locationResult] = await Promise.allSettled([
          ipPromise,
          locationPromise,
        ]);

        if (ipResult.status === "fulfilled") {
          ip = ipResult.value.data.ip;
          console.log("IP del cliente:", ip);
        } else {
          console.warn("No se pudo obtener la IP:", ipResult.reason);
        }

        if (locationResult.status === "fulfilled") {
          location = locationResult.value;
          console.log("Ubicación:", location);
        } else {
          console.warn(
            "No se pudo obtener la ubicación:",
            locationResult.reason.message || locationResult.reason
          );
        }
      } catch (error) {
        console.error("Error inesperado obteniendo IP/Ubicación:", error);
      }

      // --- Preparar Datos ---
      const clienteData = {
        primer_apellido: this.primerApellido,
        segundo_apellido: this.segundoApellido || null, // Enviar null si está vacío
        primer_nombre: this.primerNombre,
        segundo_nombre: this.segundoNombre || null,
        numero_documento: this.numeroDocumento,
        fecha_nacimiento: this.fechaNacimiento,
        correo: this.correo,
        telefono: this.telefono || null,
        celular: this.celular,
        tipo_via: this.tipoVia,
        direccion: this.direccion,
        barrio: this.barrio,
        ciudad: this.ciudad,
        // Lógica mejorada para mascota
        mascota:
          this.mascota === "OTRO"
            ? this.otraMascota.toUpperCase()
            : this.mascota === "NINGUNA"
            ? null
            : this.mascota,
        // Preferencias directamente
        preferencias_email: this.preferencias.email,
        preferencias_whatsapp: this.preferencias.whatsapp,
        preferencias_sms: this.preferencias.sms,
        preferencias_redes_sociales: this.preferencias.redesSociales,
        preferencias_llamada: this.preferencias.llamada,
        preferencias_ninguna: this.preferencias.ninguna,
        // Estados booleanos
        fidelizacion: this.fidelizacion,
        acepto_politica: this.politica,
        // Geolocalización (Corregido nombre)
        longitud: location.longitude,
        latitud: location.latitude,
        ip_usuario: ip,
        tipocliente: "Cliente", // O determinar dinámicamente
        firma_base64: signatureBase64, // Contendrá null o el base64
      };

      console.log("Datos listos para enviar:", clienteData);

      // --- Enviar Datos ---
      this.loading = true; // Activa spinner de envío
      try {
        let response;
        const apiUrl = "https://aceitera.cubocloud.com:8000/api/clientes/"; // URL base

        if (this.ClienteExiste) {
          console.log(`Actualizando cliente: ${this.numeroDocumento}`);
          response = await axios.put(
            `${apiUrl}${this.numeroDocumento}/`,
            clienteData
          );
          alert("Datos actualizados correctamente.");
        } else {
          console.log("Registrando nuevo cliente...");
          response = await axios.post(apiUrl, clienteData);
          alert("Cliente registrado exitosamente.");
        }
        console.log("Respuesta del backend:", response.data);
        this.resetForm(); // Limpia el formulario después del éxito
      } catch (error) {
        console.error("Error al guardar los datos:", error);
        this.globalError = "Ocurrió un error al guardar los datos.";
        if (error.response && error.response.data) {
          console.error("Detalle del error del backend:", error.response.data);
          // Intenta mostrar un mensaje más específico si el backend lo envía
          try {
            // Intenta parsear errores complejos
            let backendErrors = error.response.data;
            if (typeof backendErrors === "object") {
              this.globalError +=
                " Detalles: " +
                Object.entries(backendErrors)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("; ");
            } else {
              this.globalError += " Detalles: " + JSON.stringify(backendErrors);
            }
          } catch (parseError) {
            this.globalError += " No se pudo obtener detalle del error.";
          }
        }
        window.scrollTo(0, 0); // Scroll arriba para ver el error
      } finally {
        this.loading = false; // Desactiva spinner de envío
      }
    }, // Fin de handleSubmit
  }, // Fin de methods
};
</script>

<style>
/* Estilos globales opcionales o scoped si prefieres */
.input-group .spinner-border {
  margin-left: 5px;
}
/* Ajusta estilos si es necesario */
</style>
