<template>
  <q-dialog v-model="show" persistent @keydown.esc="show = false">
    <q-card style="width: 500px; border-radius: 12px;">
      <q-card-section class="bg-primary text-white q-pa-sm">
        <div class="text-subtitle2 text-center text-weight-bolder text-uppercase">
          Captura de Comisiones por Rangos y Categorías
        </div>
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md">
          <div class="col-6 column q-gutter-xs">
            <div v-for="cat in catList" :key="cat.id" class="row items-center">
              <q-checkbox
                v-model="selectedCats"
                :val="cat.id"
                :label="`${cat.id}. ${cat.label}`"
                dense
                size="sm"
              />
            </div>
          </div>

          <div class="col-6 q-gutter-y-sm">
            <q-input
              v-model.number="localItem.limite_inferior"
              label="Límite Inferior PESOS:"
              outlined dense prefix="$"
              type="number"
            />
            <q-input
              v-model.number="localItem.limite_superior"
              label="Límite Superior PESOS:"
              outlined dense prefix="$"
              type="number"
            />
            <q-input
              v-model.number="localItem.mes_inferior"
              label="Límite Inferior MESES:"
              outlined dense
              type="number"
            />
            <q-input
              v-model.number="localItem.mes_superior"
              label="Límite Superior MESES:"
              outlined dense
              type="number"
            />
            <q-input
              v-model.number="localItem.porcentaje_comision"
              label="Comisión:"
              outlined dense suffix="%"
              type="number"
              class="bg-yellow-1"
            />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="between" class="q-pa-md">
        <div class="text-caption text-grey-7">[ESC] para Cancelar</div>
        <q-btn
          unelevated
          color="primary"
          label="Aceptar"
          icon="check"
          @click="confirmar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
    item: Object
  })
  const emit = defineEmits(['update:modelValue', 'add'])

  const show = ref(props.modelValue)
  const selectedCats = ref([])
  const localItem = ref({ ...props.item })

  const catList = [
    { id: 1, label: 'Oro' },
    { id: 2, label: 'Brillantes' },
    { id: 3, label: 'Relojes Finos' },
    { id: 4, label: 'Autos / Motos' },
    { id: 5, label: 'Aparatos Electrónicos' },
    { id: 6, label: 'Varios' },
    { id: 7, label: 'Plata' }
  ]

  // Sincronizar visibilidad
  watch(() => props.modelValue, (val) => show.value = val)
  watch(show, (val) => emit('update:modelValue', val))

  // Al abrir, procesar la cadena "1/2/3/" si existe (para edición)
  watch(() => props.item, (newVal) => {
    localItem.value = { ...newVal }
    if (newVal.categorias) {
      selectedCats.value = newVal.categorias
        .split('/')
        .filter(x => x !== "")
        .map(Number)
    } else {
      selectedCats.value = []
    }
  }, { immediate: true })

  const confirmar = () => {
    // Convertir array [1,2,3] a cadena "1/2/3/"
    if (selectedCats.value.length === 0) {
      alert('Debe seleccionar al menos una categoría')
      return
    }

    const catsString = selectedCats.value.sort().join('/') + '/'
    emit('add', { ...localItem.value, categorias: catsString })
    show.value = false
  }
</script>

<style scoped>
  .bg-yellow-1 { background-color: #fefce8; }
</style>
