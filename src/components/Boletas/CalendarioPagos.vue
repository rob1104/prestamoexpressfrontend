<template>
  <q-dialog v-model="show" persistent>
    <q-card style="width: 800px; max-width: 95vw;" class="shadow-24">
      <q-card-section class="bg-indigo-9 text-white row items-center q-pb-none">
        <div class="column">
          <div class="text-h6 text-weight-bolder">CALENDARIO DE PAGOS</div>
          <div class="text-caption">Seleccione los pagos que el cliente desea liquidar</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-table
          title="Pagos Pendientes"
          :rows="rows"
          :columns="columns"
          row-key="id"
          selection="multiple"
          v-model:selected="selected"
          flat
          bordered
          dense
          :pagination="{ rowsPerPage: 0 }"
          class="tabla-calendario-sicae"
          no-data-label="No hay pagos pendientes para esta boleta"
        >
          <template v-slot:body-cell-fecha_vencimiento="props">
            <q-td :props="props">
              <q-icon name="event" color="grey-7" class="q-mr-xs" />
              {{ formatFechaSicae(props.value) }}
            </q-td>
          </template>

          <template v-slot:body-cell-dias_vencidos="props">
            <q-td :props="props">
              <q-badge
                v-if="props.value > 0"
                color="red-7"
                text-color="white"
                class="text-weight-bolder"
              >
                {{ props.value }} días
              </q-badge>
              <span v-else class="text-grey-5">0</span>
            </q-td>
          </template>

          <template v-slot:body-cell-monto="props">
            <q-td :props="props" class="text-weight-bolder text-indigo-10">
              $ {{ formatMoney(props.value) }}
            </q-td>
          </template>

          <template v-slot:body-cell-estatus="props">
            <q-td :props="props" class="text-center">
              <q-badge :color="props.value === 'PE' ? 'orange-9' : 'green-9'">
                {{ props.value === 'PE' ? 'PENDIENTE' : 'PAGADO' }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right" class="bg-blue-grey-1 q-pa-md border-top">
        <div class="column items-end q-mr-xl">
          <div class="text-caption text-grey-8 uppercase text-weight-bold">Pagos seleccionados: {{ selected.length }}</div>
          <div class="text-h5 text-weight-bolder text-primary">
            SUBTOTAL: $ {{ formatMoney(subtotal) }}
          </div>
        </div>
        <q-btn
          label="Confirmar Selección"
          color="indigo-10"
          icon="check_circle"
          class="q-px-lg"
          @click="confirmar"
          :disable="selected.length === 0"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { ref, computed, watch } from 'vue'
  import { date } from 'quasar'

  const props = defineProps({
    modelValue: Boolean,
    rows: Array
  })

  const emit = defineEmits(['update:modelValue', 'confirmar-seleccion'])

  const show = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const selected = ref([])

  // Columnas basadas en tu estructura de base de datos
  const columns = [
    { name: 'num_pago', label: 'No. Pago', align: 'left', field: 'num_pago', sortable: true },
    { name: 'fecha_vencimiento', label: 'Vencimiento', align: 'left', field: 'fecha_vencimiento', sortable: true },
    { name: 'dias_vencidos', label: 'Días Venc.', align: 'center', field: 'dias_vencidos', sortable: true },
    { name: 'monto', label: 'Monto Pago', align: 'right', field: 'monto' },
    { name: 'estatus', label: 'Estatus', align: 'center', field: 'estatus' }
  ]

  const subtotal = computed(() => {
    return selected.value.reduce((acc, row) => acc + parseFloat(row.monto), 0)
  })

  const confirmar = () => {
    emit('confirmar-seleccion', {
      items: selected.value,
      total: subtotal.value
    })
    show.value = false
  }

  // Helpers de formato (mismos que usas en el principal)
  const formatMoney = (val) => Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const formatFechaSicae = (fechaStr) => {
    if (!fechaStr) return '---';
    const soloFecha = fechaStr.includes('T') ? fechaStr.split('T')[0] : fechaStr;
    const [anio, mes, dia] = soloFecha.split('-');
    const fechaObj = new Date(anio, mes - 1, dia);
    return date.formatDate(fechaObj, 'DD-MMM-YYYY', {
      monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    });
  }

  // Resetear selección cuando se cierra/abre
  watch(show, (newVal) => {
    if (newVal) selected.ref = []
  })
</script>

<style lang="scss" scoped>
  .tabla-calendario-sicae {
    max-height: 450px;
    .q-table__top, .q-table__bottom, thead tr:first-child th {
      background-color: #f1f5f9;
      font-weight: 800;
    }
  }
  .border-top { border-top: 1px solid #cbd5e1; }
</style>
