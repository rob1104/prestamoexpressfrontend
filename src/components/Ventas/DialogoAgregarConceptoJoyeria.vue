<template>
  <q-dialog v-model="mostrar" persistent>
    <q-card style="width: 600px; max-width: 95vw;" class="shadow-24">

      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <div class="text-h6 text-weight-bolder uppercase text-orange-4">
          <q-icon name="diamond" size="sm" class="q-mr-sm text-white" />
          Captura de Conceptos de Ventas
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md bg-grey-1">
        <div class="row q-col-gutter-md">

          <div class="col-12 col-md-6 q-gutter-y-md">
            <q-select
              v-model="form.categoria"
              :options="categorias"
              label="Categoría:"
              outlined dense bg-color="white"
            />
            <q-select
              v-model="form.clasificacion"
              :options="clasificaciones"
              label="Clasificación:"
              outlined dense bg-color="white"
            />
          </div>

          <div class="col-12 col-md-6 q-gutter-y-md">
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model.number="form.cantidad"
                  type="number"
                  label="Cantidad:"
                  outlined dense bg-color="white"
                  input-class="text-center text-weight-bold"
                  @focus="$event.target.select()"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="form.precio_unitario"
                  type="number"
                  label="Precio Unit. ($):"
                  outlined dense bg-color="white"
                  input-class="text-right text-weight-bold text-primary"
                  @focus="$event.target.select()"
                />
              </div>
            </div>

            <q-input
             :model-value="importeMostrado"
              readonly
              label="Importe Total:"
              outlined dense bg-color="orange-1"
              @focus="$event.target.select()"
              @keyup.enter="confirmarConcepto"
            />
          </div>

          <div class="col-12">
            <q-input
              v-model="form.concepto"
              label="Descripción del Concepto:"
              outlined dense bg-color="white"
              class="text-uppercase"
              @keyup.enter="confirmarConcepto"
            />
          </div>

        </div>
      </q-card-section>

      <q-card-actions align="between" class="bg-blue-grey-1 q-pa-md" style="border-top: 1px solid #cbd5e1;">
        <q-btn flat label="Cancelar" color="red-9" class="text-weight-bold" v-close-popup />
        <q-btn unelevated label="Aceptar" color="primary" class="q-px-xl text-weight-bold shadow-2" @click="confirmarConcepto" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import { useQuasar } from 'quasar'
  import { api } from 'boot/axios'

  const $q = useQuasar()

  const props = defineProps({
    modelValue: { type: Boolean, required: true }
  })

  const emit = defineEmits(['update:modelValue', 'concepto-agregado'])

  const mostrar = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const categorias = ref([])
  const clasificaciones = ref([])

  // Estado del formulario
  const form = ref({
    cantidad: 1,
    categoria: '',
    clasificacion: '',
    precio_unitario: 0,
    importe: 0,
    concepto: ''
  })

  // --- NUEVO: FUNCIÓN PARA FORMATO MONEDA ---
  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(val || 0))
  }

  // --- NUEVO: Propiedad reactiva para mostrar en el template ---
  const importeMostrado = computed(() => formatMoney(form.value.importe))

  // 1. Cuando cambie la Categoría, sugerimos un precio base automático
  watch(() => form.value.categoria, (nuevaCat) => {
    const cat = String(nuevaCat || '').toUpperCase()

    // Sugerencias base (puedes adaptarlas)
    let precioSugerido = 100
    if (cat.includes('ORO')) precioSugerido = 850
    else if (cat.includes('PLATA')) precioSugerido = 120
    else if (cat.includes('RELOJ')) precioSugerido = 500

    form.value.precio_unitario = precioSugerido
  })

  // 2. Si se cambia Cantidad o Precio Unitario, se actualiza el Importe
  watch([() => form.value.cantidad, () => form.value.precio_unitario], ([cant, precio]) => {
    form.value.importe = roundMoney((Number(cant) || 0) * (Number(precio) || 0))
  })

  // Limpieza al abrir el modal
  watch(mostrar, (nuevoValor) => {
    if (nuevoValor) {
      const catInicial = categorias.value.length > 0 ? categorias.value[0] : 'ORO'

      form.value = {
        cantidad: 1,
        categoria: catInicial,
        clasificacion: clasificaciones.value.length > 0 ? clasificaciones.value[0] : 'ANILLO',
        precio_unitario: 0, // Se llenará en 50ms por el setTimeout
        importe: 0,
        concepto: ''
      }

      // Retardo milimétrico para asegurar que Vue actualice el precio base al abrir
      setTimeout(() => {
         let precioSugerido = 100
         if (catInicial.toUpperCase().includes('ORO')) precioSugerido = 850
         else if (catInicial.toUpperCase().includes('PLATA')) precioSugerido = 120
         else if (catInicial.toUpperCase().includes('RELOJ')) precioSugerido = 500
         form.value.precio_unitario = precioSugerido
      }, 50)
    }
  })

  const roundMoney = (val) => {
    return Math.round((val + Number.EPSILON) * 100) / 100
  }

  // --- VALIDACIONES ---
  const confirmarConcepto = () => {
    if (!form.value.cantidad || form.value.cantidad <= 0) {
      $q.notify({ type: 'negative', message: 'La Cantidad NO puede ser CERO o menor a CERO' })
      return
    }
    if (!form.value.importe || form.value.importe <= 0) {
      $q.notify({ type: 'negative', message: 'El Importe Total NO puede ser CERO' })
      return
    }
    if (!form.value.concepto || form.value.concepto.trim() === '') {
      $q.notify({ type: 'negative', message: 'Concepto de Venta Inválido. Escriba una descripción.' })
      return
    }

    emit('concepto-agregado', {
      cantidad: form.value.cantidad,
      concepto: form.value.concepto.trim().toUpperCase(),
      precio_unitario: form.value.precio_unitario, // Lo mandamos por si lo necesitas
      importe: form.value.importe,
      categoria_nombre: form.value.categoria,
      clasificacion_nombre: form.value.clasificacion
    })

    mostrar.value = false
  }

  // Carga de la BD real
  onMounted(async () => {
    try {
      const resCat = await api.get('/api/catalogos-joyeria/categorias')
      categorias.value = resCat.data.map(c => c.nombre)

      const resClas = await api.get('/api/catalogos-joyeria/clasificaciones')
      clasificaciones.value = resClas.data.map(c => c.nombre)
    } catch (error) {
      console.error("Error cargando catálogos", error)
      $q.notify({ type: 'negative', message: 'Error cargando catálogos de joyería' })
    }
  })

</script>
