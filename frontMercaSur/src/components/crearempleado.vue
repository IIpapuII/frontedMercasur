<script setup>
import tratamiento from './tratamiento.vue'
import tipo_via from './tipovia.vue'
import axios from 'axios'

</script>
<template>
    <main class="container mt-2">
        <div v-if="errorFechaNacimiento" class="alert alert-danger mt-3" role="alert">
        Debes tener al menos 18 años para registrarte.
</div>
        <div class="card">
            <div class="card-body">
                <form action="post" class="container" @submit.prevent="handleSubmit">
                  <div class="row">
                    <div class="col-6">
                            <label for="telefono" class="form-label">Número de Documento</label>
                            <input type="number" class="form-control" placeholder="Número de Documento" aria-label="Número de Documento" maxlength="10" minlength="8"
                             v-model="numeroDocumento"  @blur="checkClienteExistente" :disabled="ClienteExiste" required />
                            <div v-if="loading" class="spinner-border text-primary mt-2" role="status">
                                <span class="visually-hidden">Verificando Documento...</span>
                            </div>
                            <div v-if="errorDocumento" class="text-danger mt-1">
                                El número debe tener entre 8 y 10 dígitos.
                            </div>
                        </div>
                  </div>
                  <div class="row" v-if="formactive">
                    <div class="row mt-2">
                        <div class="col-6">
                            <label for="primer-apellido" class="form-label">Primer Apellido</label>
                            <input type="text" class="form-control" placeholder="Primer Apellido" aria-label="Primer Apellido" v-model="primerApellido" @input="convertToUppercase('primerApellido')" :disabled="ClienteExiste"  required/>
                        </div>
                        <div class="col-6">
                            <label for="segundo-apellido" class="form-label">Segundo Apellido</label>
                            <input type="text" class="form-control" placeholder="Segundo Apellido" aria-label="Segundo Apellido" v-model="segundoApellido" @input="convertToUppercase('segundoApellido')" :disabled="ClienteExiste" />
                        </div>
                        <div class="col-6">
                            <label for="primer-nombre" class="form-label">Primer Nombre</label>
                            <input type="text" class="form-control" placeholder="Primer Nombre" aria-label="Primer Nombre" v-model="primerNombre" @input="convertToUppercase('primerNombre')" :disabled="ClienteExiste" required />
                        </div>
                        <div class="col-6">
                            <label for="segundo-nombre" class="form-label">Segundo Nombre</label>
                            <input type="text" class="form-control" placeholder="Segundo Nombre" aria-label="Segundo Nombre" v-model="segundoNombre" @input="convertToUppercase('segundoNombre')" :disabled="ClienteExiste" />
                        </div>
                    </div>
                    <!-- Otros campos de formulario -->
                    <div class="row mt-2">
                        <div class="col-6">
                            <label for="fecha-nacimiento" class="form-label">Fecha Nacimiento</label>
                            <input type="date" class="form-control" v-model="fechaNacimiento" @blur="validateAge" :disabled="ClienteExiste" required />
                        </div>
                        <div class="col-6">
                            <label for="correo" class="form-label">Correo</label>
                            <input type="email" class="form-control" placeholder="Correo" aria-label="Correo" v-model="correo" required/>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-4">
                            <div class="row">
                            <div class="col">
                                <label for="telefono" class="form-label">Teléfono</label>
                                <input type="number" class="form-control" placeholder="Teléfono" aria-label="Teléfono" v-model="telefono" />
                            </div>
                            </div>
                            <div class="row mt-4">
                            <div class="col">
                                <label for="Celular" class="form-label">Celular</label>
                                <input type="number" class="form-control" placeholder="Celular" aria-label="Celular" v-model="celular" required/>
                            </div>
                            </div>
                        </div>
                        <div class="col">
                            <div class="row g-3">
                                <div class="col-3">
                                    <label for="tipo_via" class="form-label">Tipo de vía</label>
                                    <select class="form-select" id="tipo_via" v-model="tipoVia" required>
                                        <tipo_via/>
                                    </select>
                                </div>

                                <div class="col-md-9">
                                    <label for="direccion" class="form-label">Dirección</label>
                                    <input type="text" class="form-control" id="direccion" v-model="direccion" @input="convertToUppercase('direccion')" placeholder="Ej: 45B # 23-10" required />
                                </div>

                                <div class="col-md-6">
                                    <label for="barrio" class="form-label">Barrio</label>
                                    <input type="text" class="form-control" id="barrio" v-model="barrio" @input="convertToUppercase('barrio')" placeholder="Ej: La Riviera" required />
                                </div>

                                <div class="col-md-6">
                                    <label for="exampleDataList" class="form-label">Ciudad o Municipio</label>
                                    <input class="form-control" list="datalistOptions" v-model="ciudad" @input="convertToUppercase('ciudad')" placeholder="Tipo para buscar..." required />
                                    <datalist id="datalistOptions">
                                        <option v-for="ciudad in ciudades" :key="ciudad" :value="ciudad" />
                                    </datalist>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-4">
                            <label for="mascota" class="form-label">¿Tienes mascota?</label>
                            <select class="form-select" v-model="mascota" id="mascota" required>
                                <option selected disabled>Selecciona una opción</option>
                                <option value="perro">Perro</option>
                                <option value="gato">Gato</option>
                                <option value="otro">Otro</option>
                            </select>
                                                    <!-- Campo para escribir otro tipo de mascota, solo si elige "Otro" -->
                            <div class="row mt-2" v-if="mascota === 'otro'">
                                <div class="col">
                                    <label for="otra-mascota" class="form-label">¿Qué mascota tienes?</label>
                                    <input type="text" class="form-control" v-model="otraMascota" placeholder="Especifica otra mascota" id="otra-mascota" @input="convertToUppercase('otraMascota')"/>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">¿Cómo te gustaría enterarte de nuestros eventos e información de interés?</label>
                            
                            <!-- Checkbox para Email -->
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" id="email" v-model="preferencias.email">
                                <label class="form-check-label" for="email">Por Email</label>
                            </div>

                            <!-- Checkbox para WhatsApp -->
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" id="whatsapp" v-model="preferencias.whatsapp">
                                <label class="form-check-label" for="whatsapp">Por WhatsApp</label>
                            </div>

                            <!-- Checkbox para SMS -->
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" id="sms" v-model="preferencias.sms">
                                <label class="form-check-label" for="sms">Por SMS</label>
                            </div>

                            <!-- Checkbox para Redes Sociales -->
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" id="redes-sociales" v-model="preferencias.redesSociales">
                                <label class="form-check-label" for="redes-sociales">Por Redes Sociales</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" id="llamada" v-model="preferencias.llamada">
                                <label class="form-check-label" for="redes-sociales">Llamadas</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" id="ninguna" v-model="preferencias.ninguna">
                                <label class="form-check-label" for="redes-sociales">Ninguna de las anteriores</label>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col">
                            <input type="checkbox" id="politica" data-bs-toggle="modal" data-bs-target="#exampleModal" required v-model="politica" />
                            <label for="politica" class="form-label">Acepto la política de tratamiento de datos</label>
                        </div>
                        <div class="col" v-if="firmaStatus">

                        </div>
                    </div>
                    <button class="btn btn-success mt-3">{{ ClienteExiste ? 'Actualizar' : 'Registrarme' }}</button>
                  </div>
                </form>
            </div>
        </div>
         <!-- Modal de error -->
        <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                <div class="modal-header" v-if="!tarjeta" >
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Autorización del titular para el tratamiento de datos</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="politicaState"></button>
                </div>
                <div class="modal-header" v-if="tarjeta" >
                    <h1 class="modal-title fs-5" id="exampleModalLabel">Confirmar Fidelización</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="fidelizacion = false" ></button>
                </div>
                <div class="modal-body">
                    
                    <tratamiento v-if="!tarjeta"/>
                    <div v-if="tarjeta">
                      <p>¿Te gustaría unirte a nuestro programa de fidelización para acumular puntos y disfrutar de beneficios exclusivos?</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <div v-if="!tarjeta">
                      <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="politicaState">Cancelar</button>
                      <button type="button" class="btn btn-success" @click="ConfirmarTrantamiento">Confirmar Trantamiento</button>
                    </div>
                    <div v-if="tarjeta">
                      <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="fidelizacion = false">No quiero Fidelizarme</button>
                      <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="ConfirmarFidelizacion">Confirmo Fidelización</button>
                    </div>
                </div>
                </div>
            </div>
            </div>
    </main>
</template>

<script>
export default {
  data() {
    return {
      primerApellido: '',
      segundoApellido: '',
      primerNombre: '',
      segundoNombre: '',
      numeroDocumento: '',
      fechaNacimiento: '',
      correo: '',
      telefono: '',
      celular: '',
      tipoVia: '',
      direccion: '',
      barrio: '',
      ciudad: '',
      ciudades: ['Floridablanca', 'Piedecuesta', 'Giron', 'Bucaramanga'],
      errorFechaNacimiento: false,
      mascota: '', 
      otraMascota: '',
      preferencias: {
        email: false,
        whatsapp: false,
        sms: false,
        redesSociales: false,
        llamada: false,
        ninguna: false,
      },
        politica: false ,
        loading: false,
        ClienteExiste: false,
        tarjeta: false,
        fidelizacion: false,
        formactive: false,
        errorDocumento: false,
        
    };
  },
  methods: {
    convertToUppercase(field) {
      this[field] = this[field].toUpperCase();
    },
    validateAge() {
    if (!this.fechaNacimiento) return;

    const birthDate = new Date(this.fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.errorFechaNacimiento = age < 18;

    if (this.errorFechaNacimiento) {
      this.showErrorModal();
    }
  },
  ConfirmarTrantamiento(){
    this.politica = true;
    this.tarjeta = true;
  },
  ConfirmarFidelizacion(){
    this.fidelizacion = true;
    this.tarjeta = false;
    this.politica = true;
  },
  handleSubmit() {
    this.validateAge();
    if (this.errorFechaNacimiento) return;

    alert("Formulario enviado exitosamente.");
  },
  politicaState(){
    this.politica = false;
  },
  async checkClienteExistente() {
  if (!this.numeroDocumento) return;
  
  this.loading = true;
  const longitud = this.numeroDocumento.toString().length;
  if (longitud < 8 || longitud > 10) {
    this.errorDocumento = true;
    this.loading = false;
    return
  } else {
    this.errorDocumento = false;
  }

  try {
    const response = await axios.get('http://127.0.0.1:8000/api/clientes/', {
      params: {
        numero_documento: this.numeroDocumento
      }
    });

    if (response.data.existe) {
      const cliente = response.data.cliente;
       
      // Espera 5 segundos antes de pintar los datos
      setTimeout(() => {
        this.primerApellido = cliente.primer_apellido;
        this.segundoApellido = cliente.segundo_apellido;
        this.primerNombre = cliente.primer_nombre;
        this.segundoNombre = cliente.segundo_nombre;
        this.fechaNacimiento = cliente.fecha_nacimiento;
        this.ClienteExiste = true; 

        this.loading = false;
        this.formactive = true;
      }, 5000);
      
    } else {
      // Si no existe el cliente, igual ocultas el spinner luego de 5s
      setTimeout(() => {
        this.loading = false;
        this.formactive = true;
      }, 5000);
      
    }

  } catch (error) {
    console.error('Error al buscar el cliente:', error);
    // También manejas el error con timeout
    setTimeout(() => {
      this.loading = false;
    }, 5000);
  }
},
resetForm() {
  console.log("Resetting form...");
  this.primerApellido = ''
  this.segundoApellido = ''
  this.primerNombre = ''
  this.segundoNombre = ''
  this.numeroDocumento = ''
  this.fechaNacimiento = ''
  this.correo = ''
  this.telefono = ''
  this.celular = ''
  this.tipoVia = ''
  this.direccion = ''
  this.barrio = ''
  this.ciudad = ''
  this.mascota = ''
  this.otraMascota = ''
  this.preferencias = {
    email: false,
    whatsapp: false,
    sms: false,
    redesSociales: false,
    llamada: false,
    ninguna: false,
  }
  this.politica = false
  this.ClienteExiste = false
  this.tarjeta = false
  this.fidelizacion = false
  this.loading = false
},
async handleSubmit() {

  const ipResponse = await axios.get("https://api.ipify.org?format=json");
    const ip = ipResponse.data.ip;
    console.log("IP del cliente:", ip);
  
  const getLocation = () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error al obtener ubicación:", error);
            resolve({ latitude: null, longitude: null }); // Devuelve null si el usuario niega permiso
          }
        );
      });};
  const location = await getLocation();
  this.validateAge();
  if (this.errorFechaNacimiento) return;

  const clienteData = {
    primer_apellido: this.primerApellido,
    segundo_apellido: this.segundoApellido,
    primer_nombre: this.primerNombre,
    segundo_nombre: this.segundoNombre,
    numero_documento: this.numeroDocumento,
    fecha_nacimiento: this.fechaNacimiento,
    correo: this.correo,
    telefono: this.telefono,
    celular: this.celular,
    tipo_via: this.tipoVia,
    direccion: this.direccion,
    barrio: this.barrio,
    ciudad: this.ciudad,
    mascota: this.mascota,
    otra_mascota: this.otraMascota,
    preferencias_email: this.preferencias.email,
    preferencias_whatsapp: this.preferencias.whatsapp,
    preferencias_sms: this.preferencias.sms,
    preferencias_redes_sociales: this.preferencias.redesSociales,
    preferencias_llamada: this.preferencias.llamada,
    preferencias_ninguna: this.preferencias.ninguna,
    fidelizacion: this.fidelizacion,
    acepto_politica: this.politica,
    logitud: location.latitude,
    latitud: location.longitude,
    ip_usuario: ip,
    tipocliente: "Colaborador"
  };

  try {
    if (this.ClienteExiste) {
      await axios.put(`http://127.0.0.1:8000/api/clientes/${this.numeroDocumento}/`, clienteData);
      alert("Datos actualizados correctamente.");
    } else {
      await axios.post('http://127.0.0.1:8000/api/clientes/', clienteData);
      alert("Cliente registrado exitosamente.");
    }
    this.resetForm();
  } catch (error) {
    console.error(error);
    console.log(error.response.data);
    alert("Ocurrió un error al guardar los datos.");
  }
}
  }
};
</script>
