<template>
  <div>
    <canvas
      ref="signatureCanvas"
      class="signature-canvas-style border border-success rounded"
      style="touch-action: none;"
      >
      Tu navegador no soporta el elemento canvas.
    </canvas>
    <div class="mt-1"> <button type="button" class="btn btn-sm btn-danger" @click="clearCanvas">Limpiar Firma</button> </div>
  </div>
</template>

<script>
import SignaturePad from 'signature_pad';

export default {
  name: 'SignaturePad', // Nombre del componente
  data() {
    return {
      signaturePad: null,
      resizeTimeout: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      const canvas = this.$refs.signatureCanvas;
      if (canvas) {
        this.signaturePad = new SignaturePad(canvas, {
           // backgroundColor: 'rgb(255, 255, 255)', // Puedes descomentar si necesitas opciones
           // penColor: 'rgb(0, 0, 0)'
        });
        this.resizeCanvas();
        window.addEventListener('resize', this.debouncedResizeHandler);
      } else {
          console.error("SignaturePad.vue: Referencia del Canvas no encontrada en mounted.");
      }
    });
  },
  beforeDestroy() { // Para Vue 2. Si usas Vue 3 sería beforeUnmount
    window.removeEventListener('resize', this.debouncedResizeHandler);
    clearTimeout(this.resizeTimeout);
    // Liberar recursos si la librería lo requiere (usualmente no con signature_pad)
    // if (this.signaturePad) { this.signaturePad.off(); }
  },
  methods: {
    clearCanvas() {
      if (this.signaturePad) {
        this.signaturePad.clear();
        this.$emit('cleared'); // Opcional: Emitir evento si el padre necesita saber
      }
    },
    getSignatureBase64() {
      if (this.signaturePad && !this.signaturePad.isEmpty()) {
        return this.signaturePad.toDataURL('image/png');
      }
      return null;
    },
    // Método crucial que faltaba en tu versión anterior
    isEmpty() {
      return this.signaturePad ? this.signaturePad.isEmpty() : true;
    },
    // --- Lógica de Redimensión ---
    resizeCanvas() {
      const canvas = this.$refs.signatureCanvas;
      if (!canvas || !this.signaturePad) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      this.signaturePad.clear(); // Limpiar al redimensionar
    },
    debouncedResizeHandler() {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.resizeCanvas();
      }, 150);
    }
  },
};
</script>

<style scoped>
.signature-canvas-style {
  display: block;
  width: 100%;
  height: 200px; /* O la altura que prefieras */
  background-color: #ffffff;
  cursor: crosshair; /* Indica que se puede dibujar */
}
</style>