<template>
  <div class="q-gutter-y-sm">
    <q-card flat bordered class="valuacion-card shadow-2">
      <q-card-section class="bg-slate-800 text-white q-py-sm">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="devices" class="q-mr-sm" size="sm" />
            <div class="text-subtitle2 text-weight-bold uppercase tracking-widest">
              Valuación de Aparatos Electrónicos
            </div>
          </div>
          <q-badge color="orange-9" text-color="white" class="text-weight-bolder q-px-md text-subtitle2">
            PRESTAMO SUGERIDO: $ {{ formatMoney(datos.prestamo) }}
          </q-badge>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md bg-white">
        <div class="row q-col-gutter-md">

          <div class="col-12 col-md-8">
            <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Clasificación Aparato:</div>
            <q-select
              v-model="datos.clasificacion"
              :options="tiposAparatos"
              outlined dense
              bg-color="grey-1"
              @update:model-value="emitirCambios"
            />
          </div>
          <div class="col-12 col-md-4">
            <div class="text-caption text-weight-bold text-primary q-mb-xs">Monto a Prestar:</div>
            <q-input
              v-model.number="datos.prestamo"
              type="number"
              outlined dense
              bg-color="yellow-1"
              prefix="$"
              input-class="text-weight-bolder text-right text-h6 text-primary"
              @focus="$event.target.select()"
              @update:model-value="val => { datos.prestamo = Math.max(0, val); emitirCambios(); }"
            />
          </div>

          <div class="col-12 col-md-6">
            <q-input
              v-model="datos.marca"
              label="Marca *"
              outlined dense
              class="uppercase-input"
              @update:model-value="emitirCambios"
            />
          </div>
          <div class="col-12 col-md-6">
            <q-input
              v-model="datos.modelo"
              label="Modelo *"
              outlined dense
              class="uppercase-input"
              @update:model-value="emitirCambios"
            />
          </div>

          <div class="col-12 col-md-8">
            <q-input
              v-model="datos.serie"
              label="No. Serie *"
              outlined dense
              class="uppercase-input"
              @update:model-value="emitirCambios"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input
              v-model="datos.anio"
              label="Año *"
              outlined dense
              mask="####"
              @update:model-value="emitirCambios"
            />
          </div>

          <div class="col-12">
            <q-input
              v-model="datos.caracteristicas"
              type="textarea"
              label="Características y detalles del estado (Obligatorio) *"
              outlined dense
              rows="3"
              class="uppercase-input"
              @update:model-value="emitirCambios"
            />
          </div>

        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['update'])

// Opciones similares a las que tendrías en tu SICAECatalogoTiposAparatos
const tiposAparatos = [
  'AIRE ACONDICIONADO', 'TELEVISION / SMART TV', 'CELULAR / SMARTPHONE',
  'COMPUTADORA / LAPTOP', 'TABLET / IPAD', 'CONSOLA DE VIDEOJUEGOS',
  'HERRAMIENTA ELECTRICA', 'EQUIPO DE SONIDO', 'OTROS ELECTRONICOS'
]

const datos = reactive({
  clasificacion: 'TELEVISION / SMART TV',
  marca: '',
  modelo: '',
  serie: '',
  anio: '',
  caracteristicas: '',
  prestamo: 0
})

const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const emitirCambios = () => {
  // Validaciones exigidas por el sistema (Ningún campo puede estar vacío y el préstamo > 0)
  const esValido = Boolean(
    datos.clasificacion &&
    datos.marca.trim() &&
    datos.modelo.trim() &&
    datos.serie.trim() &&
    datos.anio.toString().trim() &&
    datos.caracteristicas.trim() &&
    datos.prestamo > 0
  )

  // Construimos una partida única con la información concatenada para guardarla en BD
  const descripcionArmada = `${datos.clasificacion} | Marca: ${datos.marca.toUpperCase()} | Mod: ${datos.modelo.toUpperCase()} | Serie: ${datos.serie.toUpperCase()} | Año: ${datos.anio} | Detalle: ${datos.caracteristicas.toUpperCase()}`

  const partidas = []

  if (datos.prestamo > 0) {
    partidas.push({
      tipo: 'electronico',
      subtipo: datos.clasificacion,
      gramos_cantidad: 1,
      costo_unitario: datos.prestamo,
      valor: datos.prestamo,
      descripcion: descripcionArmada,
      // Metadatos extras por si tu backend tiene columnas separadas
      marca: datos.marca.toUpperCase(),
      modelo: datos.modelo.toUpperCase(),
      serie: datos.serie.toUpperCase()
    })
  }

  // Emitimos el mismo formato que emite el Grid de Oro
  emit('update', {
    partidas: partidas,
    totalPrestamo: datos.prestamo || 0,
    esValido: esValido
  })
}
</script>

<style scoped>
  .valuacion-card {
    border-radius: 4px;
    border: 1px solid #cbd5e1;
  }
  .bg-slate-800 {
    background-color: #1e293b;
  }
  .tracking-widest {
    letter-spacing: 0.1em;
  }
  .uppercase-input :deep(input), .uppercase-input :deep(textarea) {
    text-transform: uppercase;
  }
</style>
