<template>
  <main class="container mt-2">
    <div v-if="globalError" class="alert alert-danger mt-3" role="alert">
      {{ globalError }}
    </div>

    <div v-if="mostrarMensajeCliente">
      <div v-if="mensajeClienteExiste" class="alert alert-success mt-3" role="alert">
        {{ mensajeClienteExiste }}
        <button class="btn btn-sm btn-success ms-2" @click="procederConActualizacion">Sí, actualizar datos</button>
        <button class="btn btn-sm btn-secondary ms-2" @click="cancelarActualizacion">No, ingresar otro documento</button>
      </div>
      <div v-if="mensajeClienteNoExiste" class="alert alert-success mt-3" role="alert">
        {{ mensajeClienteNoExiste }}
      </div>
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
                  :disabled="ClienteExiste || loading || mostrarMensajeCliente" 
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
                  :disabled="ClienteExiste "
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
                  :disabled="ClienteExiste "
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
                  :disabled="ClienteExiste "
                />
              </div>
              <div class="col-md-3">
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
              <div class="col-md-3">
                <label for="sexo" class="form-label">Genero</label>
                <select class="form-select" v-model="sexo" id="sexo" :disabled="ClienteExiste && !permitirActualizacionDatos" required>
                  <option disabled value="">Selecciona una opción</option>
                  <option value="MUJER">Mujer</option>
                  <option value="HOMBRE">Hombre</option>
                  <option value="NO APLICA">No Aplica</option>
                </select>
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
              <div class="col-md-2">
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
              <div class="col-md-5">
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
              <div class="col-md-5">
                <label for="punto_compra" class="form-label">Indique, por favor, el punto de compra de su preferencia:</label>
                <select id="punto_compra" name="punto_compra" class="form-select" v-model="puntoCompra" required>
                    <option value="">Seleccione una opción</option>
                    <option value="CALDAS">CALDAS</option>
                    <option value="CENTRO">CENTRO</option>
                    <option value="SOTOMAYOR">SOTOMAYOR</option>
                    <option value="CABECERA">CABECERA</option>
                </select>
              </div>
              <div class="col-md-6">
                 <label for="barrio-multiselect" class="form-label">Barrio</label>
                 <multiselect
                   id="barrio-multiselect"
                   class="multiselect-bootstrap" v-model="barrioSeleccionadoObj" :options="barrios"
                   label="nombre" track-by="id" placeholder="Escribe o selecciona un barrio"
                   :searchable="true"
                   :allow-empty="false"
                   selectLabel="Enter para seleccionar"
                   deselectLabel="Enter para remover"
                   selectedLabel="Seleccionado"
                 >
                   <template #noResult>
                     <span>Oops! No se encontraron barrios.</span>
                   </template>
                   <template #noOptions>
                     <span>Lista vacía.</span>
                   </template>
                 </multiselect>
                 <input type="hidden" :value="barrioNombre" name="barrio" />
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
              <div class="col-md-4">
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
                  <option value="PERRO">Perro</option>
                  <option value="GATO">Gato</option>
                  <option value="OTROS">Otro</option>
                  <option value="NO TIENE">Ninguna</option>
                </select>
                <div class="mt-2" v-if="mascota === 'OTROS'">
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
              <div class="col-md-4">
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
                <div style="text-align: justify;">
                  <small class="form-text mt-2">
                La información proporcionada será utilizada exclusivamente para procesos de fidelización, marketing y demás actividades contempladas en nuestras políticas de tratamiento de datos personales, en cumplimiento del modelo y la normativa vigente.
                </small>
                </div>
              </div>

                <div class="col-md-4">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="notificacionCorreoCheck"
                      v-model="correoNotificacion"
                    />
                    <label class="form-check-label" for="notificacionCorreoCheck">
                      ¿Deseas recibir un correo electrónico de confirmación sobre tu registro en nuestra base de datos?
                    </label>
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
                <small v-if="!politica && formactive" class="text-danger"> * Debes consultar la política de tratamiento de datos y
                  aceptarla para poder registrarte .
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
import axios from "axios";
import SignaturePad from "./signatured.vue";
import tratamiento from "./tratamiento.vue";
import tipo_via from "./tipovia.vue";
import api from "@/services/api.js";
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';

export default {
  components: {
    SignaturePad,
    tratamiento,
    tipo_via,
    Multiselect,
  },
  data() {
    return {
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
      barrioSeleccionadoObj: null,
      ciudad: "",
      mascota: "",
      otraMascota: "",
      sexo: "",
      preferencias: {
        email: false,
        whatsapp: false,
        sms: false,
        redesSociales: false,
        llamada: false,
        ninguna: false,
      },
      ciudades: ["Floridablanca", "Piedecuesta", "Giron", "Bucaramanga"],
      politica: false,
      fidelizacion: false,
      ClienteExiste: false,
      formactive: false,
      firmaStatus: false,
      tarjeta: false,
      loading: false,
      errorFechaNacimiento: false,
      errorDocumento: false,
      showSignatureError: false,
      globalError: null,
      barrios: [],
      correoNotificacion: false,
      puntoCompra: "",

      // Nuevas propiedades para mensajes
      mensajeClienteExiste: "",
      mensajeClienteNoExiste: "",
      mostrarMensajeCliente: false,
      clienteDataTemporal: null, // Para guardar temporalmente los datos del cliente existente
      permitirActualizacionDatos: false, // Controla si los campos se habilitan para actualización
    };
  },
  computed: {
      barrioNombre() {
          return this.barrioSeleccionadoObj ? this.barrioSeleccionadoObj.nombre : null;
      }
  },
  mounted() {
    this.loadBarrios();
  },
  methods: {
    async loadBarrios() {
      try {
        const response = await api.get("/barrios/");
        this.barrios = response.data.map((barrio, index) => ({
            ...barrio,
            id: barrio.id || index 
        }));
      } catch (error) {
        console.error("Error al cargar barrios:", error);
        this.globalError = "No se pudo cargar la lista de barrios.";
      }
    },
    convertToUppercase(field) {
      if (this[field] !== null && this[field] !== undefined) {
        this[field] = this[field].toUpperCase();
      }
    },
    validateAge() {
      this.errorFechaNacimiento = false;
      if (!this.fechaNacimiento) return;
      const birthDate = new Date(this.fechaNacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const month = today.getMonth() - birthDate.getMonth();
      if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      this.errorFechaNacimiento = age < 18;
    },
    validateDocument() {
      this.errorDocumento = false;
      if (!this.numeroDocumento) return true;
      const docString = this.numeroDocumento.toString();
      const longitud = docString.length;
      this.errorDocumento = longitud < 8 || longitud > 10;
      return !this.errorDocumento;
    },
    ConfirmarTrantamiento() {
      this.politica = true;
      this.tarjeta = true; 
      if (this.ClienteExiste && !this.permitirActualizacionDatos) { // Si el cliente existe pero no ha confirmado actualizar, no activar firma aún
          this.firmaStatus = false;
      } else {
          this.firmaStatus = true; // Activar firma para nuevos o para actualización confirmada
      }
    },
    ConfirmarFidelizacion() {
      this.fidelizacion = true;
      this.tarjeta = false;
      this.hidePolicyModal();
    },
    politicaState() {
      this.politica = false;
      this.firmaStatus = false;
      this.tarjeta = false;
    },
    cancelarFidelizacion() {
      this.fidelizacion = false;
      this.tarjeta = false;
      this.hidePolicyModal();
    },
    hidePolicyModal() {
      const modalElement = this.$refs.policyModalRef;
      if (modalElement) {
        try {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          } else {
            const newModalInstance = new bootstrap.Modal(modalElement);
            newModalInstance.hide();
          }
        } catch (e) {
          console.error("Error al intentar cerrar el modal:", e);
        }
      }
    },

    async checkClienteExistente() {
      if (!this.validateDocument()) return;
      this.loading = true;
      this.formactive = false;
      this.ClienteExiste = false;
      this.globalError = null;
      this.mensajeClienteExiste = "";
      this.mensajeClienteNoExiste = "";
      this.mostrarMensajeCliente = false;
      this.clienteDataTemporal = null;
      this.permitirActualizacionDatos = false;


      try {
        const response = await api.get("/clientes/", {
          params: { numero_documento: this.numeroDocumento },
        });
        if (response.data.existe) {
          this.clienteDataTemporal = response.data.cliente;
          this.mensajeClienteExiste = `El colaborador con documento ${this.numeroDocumento} ya existe en nuestra base de datos. ¿Desea actualizar la información?`;
          this.mostrarMensajeCliente = true;
          // No activar el formulario ni marcar ClienteExiste todavía. Esperar confirmación.
        } else {
          this.mensajeClienteNoExiste = `El colaborador con documento ${this.numeroDocumento} no fue encontrado. Se habilitará el formulario para que pueda registrarse.`;
          this.mostrarMensajeCliente = true;
          this.resetPartialForm(); // Limpia datos previos por si acaso
          this.ClienteExiste = false;
          this.politica = false; // Reiniciar política para nuevo cliente
          this.fidelizacion = false;
          this.firmaStatus = false; // Asegurarse que la firma no esté activa para nuevo
          this.formactive = true; // Activar formulario para nuevo registro
          // Esperar un momento para que el usuario lea el mensaje antes de ocultarlo
          setTimeout(() => {
             this.mostrarMensajeCliente = false;
             this.mensajeClienteNoExiste = "";
          }, 4000); // Ocultar después de 4 segundos
        }
      } catch (error) {
        console.error("Error al buscar el cliente:", error);
        this.globalError = "Error al verificar el documento. Intente más tarde.";
        this.formactive = false;
        this.mostrarMensajeCliente = false;
      } finally {
        this.loading = false;
      }
    },

    procederConActualizacion() {
        this.mostrarMensajeCliente = false;
        this.mensajeClienteExiste = "";
        if (this.clienteDataTemporal) {
            const cliente = this.clienteDataTemporal;
            this.primerApellido = cliente.primer_apellido || "";
            this.segundoApellido = cliente.segundo_apellido || "";
            this.primerNombre = cliente.primer_nombre || "";
            this.segundoNombre = cliente.segundo_nombre || "";
            this.fechaNacimiento = cliente.fecha_nacimiento || "";
            this.correo = cliente.correo || "";
            this.telefono = cliente.telefono || "";
            this.celular = cliente.celular || "";
            this.tipoVia = cliente.tipo_via || "";
            this.direccion = cliente.direccion || "";
            this.barrioSeleccionadoObj = this.barrios.find(b => b.nombre === cliente.barrio) || null;
            this.ciudad = cliente.ciudad || "";
            this.mascota = cliente.mascota || "";
            this.sexo = cliente.genero || "";
            this.preferencias.email = cliente.preferencias_email || false;
            this.preferencias.whatsapp = cliente.preferencias_whatsapp || false;
            this.preferencias.sms = cliente.preferencias_sms || false;
            this.preferencias.redesSociales = cliente.preferencias_redes_sociales || false;
            this.preferencias.llamada = cliente.preferencias_llamada || false;
            this.preferencias.ninguna = cliente.preferencias_ninguna || false;
            this.politica = cliente.acepto_politica || false; // Cargar estado de política
            this.fidelizacion = cliente.fidelizacion || false;
            this.puntoCompra = cliente.punto_compra || "";
            this.correoNotificacion = cliente.correo_notificacion || false;

            this.ClienteExiste = true;
            this.permitirActualizacionDatos = true; // Permite editar campos que estaban deshabilitados
            this.firmaStatus = false; // Para actualización, la firma no es obligatoria a menos que se cambie la política
                                     // O si quieres requerirla siempre para actualización, ponla en true si politica es true.
                                     // Por ahora, la firma se activará si abren el modal de políticas.
            this.formactive = true;
        }
        this.clienteDataTemporal = null; // Limpiar datos temporales
    },

    cancelarActualizacion() {
        this.mostrarMensajeCliente = false;
        this.mensajeClienteExiste = "";
        this.numeroDocumento = ""; // Limpiar el campo de documento para que ingrese uno nuevo
        this.resetPartialForm();
        this.ClienteExiste = false;
        this.formactive = false;
        this.clienteDataTemporal = null;
        this.permitirActualizacionDatos = false;
        this.politica = false;
        this.firmaStatus = false;
        // Opcionalmente, puedes recargar la página:
        // window.location.reload();
    },

    resetPartialForm() {
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
      this.barrioSeleccionadoObj = null; 
      this.ciudad = "";
      this.mascota = "";
      this.otraMascota = "";
      this.sexo = "";
      this.preferencias = {
        email: false,
        whatsapp: false,
        sms: false,
        redesSociales: false,
        llamada: false,
        ninguna: false,
      };
      this.puntoCompra = "";
      // No resetees 'politica', 'fidelizacion', 'ClienteExiste', 'firmaStatus' aquí
      // porque su estado depende de la lógica de checkClienteExistente o el flujo del modal
    },
    resetForm() {
      this.resetPartialForm();
      this.numeroDocumento = "";
      this.politica = false;
      this.ClienteExiste = false;
      this.tarjeta = false;
      this.fidelizacion = false;
      this.loading = false;
      this.formactive = false;
      this.firmaStatus = false;
      this.errorDocumento = false;
      this.errorFechaNacimiento = false;
      this.showSignatureError = false;
      this.globalError = null;
      if (this.$refs.firmaComponent) {
        this.$refs.firmaComponent.clearCanvas();
      }
      this.correoNotificacion = false;
      this.puntoCompra = "";
      this.mostrarMensajeCliente = false;
      this.mensajeClienteExiste = "";
      this.mensajeClienteNoExiste = "";
      this.clienteDataTemporal = null;
      this.permitirActualizacionDatos = false;

    },
    async handleSubmit() {
      this.globalError = null;
      this.validateAge();
      if (this.errorFechaNacimiento) {
        this.globalError = "Debe ser mayor de 18 años para registrarse.";
        window.scrollTo(0, 0);
        return;
      }
      if (!this.validateDocument()) {
        this.globalError = "El número de documento no es válido.";
        window.scrollTo(0, 0);
        return;
      }
      
      // Solo requerir aceptación de política si el formulario está activo y es relevante
      if (this.formactive && !this.politica) {
        this.globalError = "Debe aceptar la política de tratamiento de datos para continuar.";
        // Verificar si el modal está abierto, si no, abrirlo o dar un indicio más claro.
        // Esto podría ser más robusto, por ejemplo, mostrando el modal si no se ha aceptado.
        const modalElement = this.$refs.policyModalRef;
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (!modalInstance || !modalElement.classList.contains('show')) {
            // Si el modal no está visible, quizá quieras mostrarlo
            // new bootstrap.Modal(modalElement).show();
        }
        window.scrollTo(0, 0);
        return;
      }

      if (!this.barrioSeleccionadoObj) {
          this.globalError = "Debe seleccionar un barrio.";
          window.scrollTo(0, 0);
          return;
      }


      let signatureBase64 = null;
      this.showSignatureError = false;
      if (this.firmaStatus) { // La firma solo se procesa si firmaStatus es true
        const signatureComponent = this.$refs.firmaComponent;
        if (!signatureComponent) {
          this.globalError = "Error interno al procesar la firma. Intente recargar.";
          window.scrollTo(0, 0);
          return;
        }
        if (signatureComponent.isEmpty()) {
          this.showSignatureError = true;
          this.globalError = "La firma es requerida ya que ha aceptado la política. Por favor, firme en el espacio provisto.";
          window.scrollTo(0, 0);
          return;
        } else {
          signatureBase64 = signatureComponent.getSignatureBase64();
          if (!signatureBase64) {
            this.globalError = "Ocurrió un error al procesar la firma. Intente firmar de nuevo.";
            window.scrollTo(0, 0);
            return;
          }
        }
      }

      let ip = null;
      let location = { latitude: null, longitude: null };
      try {
        const ipPromise = axios.get("https://api.ipify.org?format=json", { timeout: 5000 });
        const locationPromise = new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            return reject(new Error("Geolocalización no soportada."));
          }
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            (error) => reject(error),
            { timeout: 10000, enableHighAccuracy: false }
          );
        });
        const [ipResult, locationResult] = await Promise.allSettled([ ipPromise, locationPromise ]);
        if (ipResult.status === "fulfilled") ip = ipResult.value.data.ip;
        if (locationResult.status === "fulfilled") location = locationResult.value;
      } catch (error) {
        console.error("Error obteniendo IP/Ubicación:", error);
      }

      const clienteData = {
        primer_apellido: this.primerApellido,
        segundo_apellido: this.segundoApellido || null,
        primer_nombre: this.primerNombre,
        segundo_nombre: this.segundoNombre || null,
        numero_documento: this.numeroDocumento,
        fecha_nacimiento: this.fechaNacimiento,
        correo: this.correo,
        telefono: this.telefono || null,
        celular: this.celular,
        tipo_via: this.tipoVia,
        direccion: this.direccion,
        barrio: this.barrioNombre, 
        ciudad: this.ciudad,
        mascota: this.mascota,
        otra_mascota: this.otraMascota || null,
        preferencias_email: this.preferencias.email,
        preferencias_whatsapp: this.preferencias.whatsapp,
        preferencias_sms: this.preferencias.sms,
        preferencias_redes_sociales: this.preferencias.redesSociales,
        preferencias_llamada: this.preferencias.llamada,
        preferencias_ninguna: this.preferencias.ninguna,
        fidelizacion: this.fidelizacion,
        acepto_politica: this.politica,
        longitud: location.longitude,
        latitud: location.latitude,
        ip_usuario: ip,
        tipocliente: "Colaborador",
        firma_base64: signatureBase64, // Se envía null si no se requirió/proporcionó firma
        genero: this.sexo,
        correo_notificacion: this.correoNotificacion,
        punto_compra: this.puntoCompra,
      };

      this.loading = true;
      try {
        let response;
        const apiUrl = "/clientes/";
        if (this.ClienteExiste) {
          response = await api.put(`${apiUrl}${this.numeroDocumento}/`, clienteData);
          alert("Datos actualizados correctamente.");
        } else {
          response = await api.post(apiUrl, clienteData);
          alert("Cliente registrado exitosamente.");
        }
        this.resetForm();
      } catch (error) {
        console.error("Error al guardar los datos:", error);
        this.globalError = "Ocurrió un error al guardar los datos.";
        if (error.response && error.response.data) {
          try {
            let backendErrors = error.response.data;
            if (typeof backendErrors === "object") {
              this.globalError += " Detalles: " + Object.entries(backendErrors).map(([key, value]) => `${key}: ${value}`).join("; ");
            } else {
              this.globalError += " Detalles: " + JSON.stringify(backendErrors);
            }
          } catch (parseError) {
             this.globalError += " No se pudo obtener detalle del error.";
          }
        }
        window.scrollTo(0, 0);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style>
/* Estilos globales opcionales o scoped si prefieres */
.input-group .spinner-border {
  margin-left: 5px;
}
.multiselect-bootstrap { /* O el nombre de clase que uses para el wrapper del multiselect */
  /* z-index: 1056; */ /* O un valor mayor que el del modal si es necesario, aunque generalmente no hace falta si el multiselect no está *dentro* del modal */
}
</style>