<template>
  <q-page class="q-pa-xl bg-slate-50">
    <div class="row items-center q-mb-xl">
      <div class="col">
        <div class="text-h4 text-weight-bolder text-primary tracking-tight text-uppercase">
          <q-icon name="settings_suggest" class="q-mr-sm" /> Configuración de Parámetros
        </div>
        <div class="text-subtitle1 text-grey-7">Gestión integral de sucursal, tasas impositivas y reglas de negocio</div>
      </div>
      <div class="col-auto q-gutter-sm">
        <q-btn
          unelevated
          color="primary"
          icon="save"
          label="F6 - Confirmar"
          rounded
          class="q-px-xl shadow-8 shadow-btn-premium"
          @click="saveAll"
        />
        <q-btn
          outline
          color="grey-8"
          icon="logout"
          label="F9 - Salir"
          rounded
          class="q-px-lg"
          to="/"
        />
      </div>
    </div>

    <q-card class="shadow-24 table-container no-border">
      <q-tabs
        v-model="tab"
        dense
        class="bg-primary text-white"
        active-color="yellow-7"
        indicator-color="yellow-7"
        align="left"
        narrow-indicator
      >
        <q-tab name="generales" label="Datos Generales de la Sucursal" />
        <q-tab name="comisiones" label="Comisiones" />
        <q-tab name="recargos" label="Recargos" />
        <q-tab name="electronicos" label="Datos de Electrónicos" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated class="q-pa-none">

        <q-tab-panel name="generales" class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-2">
              <q-input v-model.number="form.generales.no_sucursal" label="No. Sucursal" outlined dense type="number" />
            </div>
            <div class="col-12 col-md-10">
              <q-input v-model="form.generales.nombre_sucursal" label="Nombre de la Sucursal" outlined dense class="text-uppercase" />
            </div>
            <div class="col-12">
              <q-input v-model="form.generales.razon_social" label="Razón Social" outlined dense class="text-uppercase" />
            </div>

            <div class="col-12 col-md-8">
              <q-input v-model="form.generales.calle_num" label="Calle y Núm." outlined dense class="text-uppercase" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.generales.colonia" label="Colonia" outlined dense class="text-uppercase" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.generales.municipio" label="Municipio" outlined dense class="text-uppercase" />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.generales.estado" label="Estado" outlined dense class="text-uppercase" />
            </div>
            <div class="col-12 col-md-2">
              <q-input v-model="form.generales.codigo_postal" label="C.P." outlined dense mask="#####" />
            </div>
            <div class="col-12 col-md-2">
              <q-input v-model="form.generales.rfc" label="R.F.C." outlined dense class="text-uppercase" />
            </div>

            <div class="col-12 col-md-3">
              <q-input v-model="form.generales.telefono_1" label="Teléfono 1" outlined dense mask="(###) ###-####" unmasked-value />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model="form.generales.telefono_2" label="Teléfono 2" outlined dense mask="(###) ###-####" unmasked-value />
            </div>

            <q-separator class="col-12 q-my-sm" />

            <div class="col-6 col-md-2">
              <q-input v-model.number="form.generales.p_comision" label="% Comisión" outlined dense suffix="%" color="indigo" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model.number="form.generales.p_iva" label="% I.V.A." outlined dense suffix="%" color="indigo" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model.number="form.generales.p_avaluo" label="% Avaluo" outlined dense suffix="%" color="indigo" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.number="form.generales.capital_trabajo" label="Capital Trabajo" outlined dense prefix="$" class="bg-blue-50" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.number="form.generales.fondo_fijo_mn" label="Fondo Fijo MN" outlined dense prefix="$" />
            </div>

            <div class="col-12 col-md-3">
              <q-input v-model.number="form.generales.fondo_fijo_usd" label="Fondo Fijo de Dólares" outlined dense prefix="$" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model.number="form.generales.comision_tc" label="Comisión Tarjeta de Crédito" outlined dense />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model.number="form.generales.comision_td" label="Comisión Tarjeta de Débito" outlined dense />
            </div>

             <div class="col-12 col-md-3">
              <q-input v-model.number="form.generales.min_cheques_fed" label="Mínimo Cheques Federación" outlined dense prefix="$" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model.number="form.generales.p_com_cheques_fed" label="% Com Cheques Federación" outlined dense suffix="%" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model.number="form.generales.m_com_cheques_fed" label="$ Com Cheques Federación" outlined dense prefix="$" />
            </div>


            <q-separator class="col-12 q-my-sm" />

            <div class="col-12 col-md-3">
              <q-input v-model.number="form.generales.costo_reporte_extravio" label="Costo Extravío" outlined dense prefix="$" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model.number="form.generales.dias_comercializacion" label="Días Comercializ." outlined dense type="number" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model.number="form.generales.dias_adjudicar" label="Días Adjudicar" outlined dense type="number" />
            </div>

            <div class="col-12 col-md-3">
              <q-select
                v-model="form.generales.tomar_festivos"
                :options="['SI', 'NO']"
                label="Tomar en Cuenta los Días Festivos"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="form.generales.tamano_ticket"
                :options="['CORTO', 'LARGO']"
                label="Tamaño de Ticket"
                outlined
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <div class="row q-col-gutter-sm items-center">
                <div class="col-auto text-caption">Salidas de Cartera:</div>
                <div class="col">
                  <q-select
                    v-model="form.generales.salida_cartera_de"
                    :options="diasSemana"
                    label="DE"
                    outlined
                    dense
                  />
                </div>
                <div class="col">
                  <q-select
                    v-model="form.generales.salida_cartera_a"
                    :options="diasSemana"
                    label="A"
                    outlined
                    dense
                  />
                </div>
              </div>
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model.number="form.generales.min_pago_facil" label="Mínimo PAGO FACIL TRADICIONAL" outlined dense prefix="$" />
            </div>

          </div>
        </q-tab-panel>

        <q-tab-panel name="comisiones" class="q-pa-lg">
          <div class="row items-center q-mb-md">
            <div class="text-h6 text-primary text-weight-bold text-uppercase">Tabla de Comisiones</div>
            <q-space />
            <q-btn color="primary" icon="add" label="Agregar Rango" @click="openAuxiliar()" />
          </div>
          <q-markup-table flat bordered class="sicae-config-table">
            <thead class="bg-grey-2">
              <tr>
                <th class="text-left">No.</th>
                <th>Categorías</th>
                <th>Lim. Inf ($)</th>
                <th>Lim. Sup ($)</th>
                <th>Mes Inf</th>
                <th>Mes Sup</th>
                <th class="bg-blue-1 text-primary">% Comisión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(com, index) in form.comisiones" :key="index">
                <td class="text-center">{{ index + 1 }}</td>
                <td><q-input v-model="com.categorias" dense borderless class="text-center" /></td>
                <td><q-input v-model.number="com.limite_inferior" dense borderless type="number" /></td>
                <td><q-input v-model.number="com.limite_superior" dense borderless type="number" /></td>
                <td><q-input v-model.number="com.mes_inferior" dense borderless type="number" /></td>
                <td><q-input v-model.number="com.mes_superior" dense borderless type="number" /></td>
                <td class="bg-blue-0 text-weight-bold text-primary"><q-input v-model.number="com.porcentaje_comision" dense borderless type="number" suffix="%" /></td>
                <td class="text-center">
                  <q-btn flat round icon="edit" color="blue" size="sm" @click="openAuxiliar(com, index)" />
                  <q-btn flat round icon="delete" color="negative" size="sm" @click="removeRow('comisiones', index)" />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
          <comision-auxiliar-form
              v-model="auxDialog"
              :item="editingItem"
              @add="handleAuxSave"
            />


          <div class="row q-col-gutter-lg q-mt-xl bg-blue-grey-1 q-pa-lg rounded-borders shadow-1">
            <div class="col-12 text-subtitle1 text-weight-bold text-blue-grey-9 text-uppercase q-mb-md border-bottom">
              <q-icon name="analytics" class="q-mr-xs" /> Separación de Comisiones Internas
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model.number="form.generales.p_almacenaje" label="Almacenaje (%)" outlined dense bg-color="white" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model.number="form.generales.p_administracion" label="Admón. (%)" outlined dense bg-color="white" />
            </div>
            <div class="col-6 col-md-2">
              <q-input v-model.number="form.generales.p_custodia" label="Custodia (%)" outlined dense bg-color="white" />
            </div>
            <div class="col-6 col-md-3">
              <q-input v-model.number="form.generales.p_interes_dividido" label="Int. Dividido (%)" outlined dense bg-color="white" />
            </div>
            <div class="col-12 col-md-3">
              <q-input v-model.number="form.generales.p_iva_interes" label="I.V.A. Interés (%)" outlined dense bg-color="white" />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="recargos" class="q-pa-lg">
          <div class="text-h6 text-negative q-mb-md text-weight-bold text-uppercase">Reglas de Recargos Moratorios</div>
          <q-markup-table flat bordered class="sicae-config-table" style="max-width: 900px">
            <thead class="bg-red-1">
              <tr>
                <th class="text-left">Desde (Día)</th>
                <th>Hasta (Día)</th>
                <th>Valor ($ / %)</th>
                <th>Tipo Cálculo</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rec, index) in form.recargos" :key="index">
                <td><q-input v-model.number="rec.dia_inicio" dense borderless type="number" /></td>
                <td><q-input v-model.number="rec.dia_fin" dense borderless type="number" /></td>
                <td><q-input v-model.number="rec.valor" dense borderless type="number" prefix="$" /></td>
                <td>
                  <q-select
                    v-model="rec.tipo"
                    :options="[{label:'Diario (D)', value:'D'}, {label:'Total (T)', value:'T'}]"
                    dense borderless
                    emit-value map-options
                  />
                </td>
                <td class="text-center">
                  <q-btn flat round icon="delete" color="negative" size="sm" @click="removeRow('recargos', index)" />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
          <q-btn flat color="negative" icon="add" label="Nuevo Rango de Recargo" class="q-mt-sm" @click="addRow('recargos')" />
        </q-tab-panel>

        <q-tab-panel name="electronicos" class="q-pa-xl flex flex-center bg-grey-2">
          <q-card style="width: 100%; max-width: 500px;" class="shadow-10">
            <q-card-section class="bg-orange-9 text-white text-center text-weight-bold text-uppercase">
              Configuración de Encabezado de Ticket
            </q-card-section>
            <q-card-section class="q-pa-lg column q-gutter-y-md bg-white">
              <q-input v-model="form.generales.linea_01" label="Línea 01" outlined dense maxlength="50" counter />
              <q-input v-model="form.generales.linea_02" label="Línea 02" outlined dense maxlength="50" counter />
              <q-input v-model="form.generales.linea_03" label="Línea 03" outlined dense maxlength="50" counter />
              <q-input v-model="form.generales.linea_04" label="Línea 04" outlined dense maxlength="50" counter />
              <q-input v-model="form.generales.linea_05" label="Línea 05" outlined dense maxlength="50" counter />
            </q-card-section>
          </q-card>
        </q-tab-panel>

      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { onBeforeRouteLeave } from 'vue-router'
  import { api } from 'boot/axios'
  import { useQuasar } from 'quasar'
  import ComisionAuxiliarForm from 'components/Cotizaciones/ComisionAuxiliar.vue'

  const $q = useQuasar()
  const tab = ref('generales')
  const diasSemana = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']

  const auxDialog = ref(false)
  const editingItem = ref({})
  const editingIndex = ref(-1)

  const initialForm = ref(null)

  const hasChanges = computed(() => {
    if (!initialForm.value) return false
    return JSON.stringify(form.value) !== JSON.stringify(initialForm.value)
  })


  const openAuxiliar = (item = null, index = -1) => {
    editingIndex.value = index
    if (item) {
      editingItem.value = { ...item }
    } else {
      // Valores por defecto según tu imagen
      editingItem.value = {
        categorias: '',
        limite_inferior: 1.00,
        limite_superior: 250000.00,
        mes_inferior: 1,
        mes_superior: 3,
        porcentaje_comision: 20.00
      }
    }
    auxDialog.value = true
  }

  const handleAuxSave = (item) => {
    if (editingIndex.value > -1) {
      form.value.comisiones[editingIndex.value] = item
    } else {
      form.value.comisiones.push(item)
    }
  }

  const form = ref({
    generales: {
      // Inicializamos los campos nuevos para evitar errores si la API no los devuelve aún
      fondo_fijo_usd: 0,
      comision_tc: 0,
      comision_td: 0,
      min_cheques_fed: 900,
      p_com_cheques_fed: 4.00,
      m_com_cheques_fed: 20.00,
      tomar_festivos: 'SI',
      tamano_ticket: 'CORTO',
      salida_cartera_de: 'DOM',
      salida_cartera_a: 'SAB',
      min_pago_facil: 400.00,
    },
    comisiones: [],
    recargos: []
  })

  const loadConfig = async () => {
    $q.loading.show({ message: 'Obteniendo parámetros de sucursal...' })
    try {
      const res = await api.get('/api/config/parametros')
      // Fusionamos la respuesta con los valores por defecto por si la DB está incompleta
      form.value.generales = { ...form.value.generales, ...res.data.generales }
      form.value.comisiones = res.data.comisiones
      form.value.recargos = res.data.recargos
      initialForm.value = JSON.parse(JSON.stringify(form.value))
    } finally {
      $q.loading.hide()
    }
  }

  const saveAll = async () => {
    $q.loading.show({ message: 'Confirmando cambios en el servidor...' })
    try {
      const res = await api.post('/api/config/parametros', form.value)
      initialForm.value = JSON.parse(JSON.stringify(form.value))
      $q.notify({
        type: 'positive',
        message: res.data.message || 'PARAMETROS GUARDADOS',
        position: 'top',
        icon: 'check_circle'
      })
    } finally {
      $q.loading.hide()
    }
  }

  const addRow = (type) => {
    if (type === 'comisiones') {
      form.value.comisiones.push({ categorias: '', limite_inferior: 0, limite_superior: 0, mes_inferior: 1, mes_superior: 3, porcentaje_comision: 0 })
    } else {
      form.value.recargos.push({ dia_inicio: 0, dia_fin: 0, valor: 0, tipo: 'T' })
    }
  }

  const removeRow = (type, index) => form.value[type].splice(index, 1)

  const handleKeys = (e) => {
    if (e.key === 'F6') { e.preventDefault(); saveAll(); }
  }

  onBeforeRouteLeave((to, from, next) => {
    if (hasChanges.value) {
      $q.dialog({
        title: '¡ATENCIÓN!',
        message: 'Hay movimientos pendientes en la configuración. Debes presionar F6 para guardar los cambios antes de salir. ¿Deseas salir de todos modos y perder los cambios?',
        cancel: true,
        persistent: true,
        ok: { label: 'SALIR SIN GUARDAR', color: 'negative', flat: true },
        cancel: { label: 'PERMANECER AQUÍ', color: 'primary' }
      }).onOk(() => {
        next() // El usuario acepta perder los cambios
      }).onCancel(() => {
        next(false) // El usuario decide quedarse
      })
    } else {
      next()
    }
  })

  const handleBeforeUnload = (e) => {
    if (hasChanges.value) {
      e.preventDefault()
      e.returnValue = '' // Dispara el aviso estándar del navegador
    }
  }

  onMounted(() => {
    loadConfig()
    window.addEventListener('keydown', handleKeys)
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeys)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })

</script>

<style lang="scss" scoped>
  .sicae-config-table {
    border-radius: 8px;
    overflow: hidden;
    thead th { font-weight: 800; padding: 14px; }
    tbody td { padding: 4px 12px !important; }
  }

  .bg-blue-50 { background-color: #f0f9ff; }
  .bg-blue-1 { background-color: #dbefe2; }

  .shadow-btn-premium {
    box-shadow: 0 4px 14px 0 rgba(0, 118, 255, 0.39);
    &:active { transform: scale(0.98); }
  }

  /* Mayúsculas automáticas visuales para campos de texto */
  .text-uppercase :deep(input) { text-transform: uppercase; }

  .border-bottom { border-bottom: 2px solid #cbd5e1; }
</style>
