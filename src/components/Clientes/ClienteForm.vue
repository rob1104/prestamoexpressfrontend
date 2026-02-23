<template>
  <q-card style="width: 1000px; max-width: 95vw; border-radius: 20px;">
    <q-form @submit.prevent="submitForm">
      <q-card-section class="bg-primary text-white row items-center q-pa-md">
        <div class="text-h6 text-weight-bold">
          <q-icon name="badge" class="q-mr-md" />
          {{ isEdit ? 'Actualizar Cliente No. ' + props.initialData.id : 'Nuevo Cliente' }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-lg scroll" style="max-height: 75vh">
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-md-7">
            <div class="row q-col-gutter-sm">
              <div class="col-12 text-overline text-primary q-mb-xs">Datos de Identidad</div>
              <div class="col-12">
                <q-input
                  v-model="localForm.nombre"
                  label="Nombre Completo"
                  outlined dense autofocus
                  class="text-uppercase"
                  @update:model-value="val => onInputUpdate('nombre', val)"
                  :rules="[val => !!val || 'Requerido']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="localForm.identificacion"
                  label="Identificación (INE/CURP)"
                  outlined dense
                  class="text-uppercase"
                  @update:model-value="val => onInputUpdate('identificacion', val)"
                  :rules="[val => !!val || 'Requerido']"
                />
              </div>
              <div class="col-6">
                <q-select v-model="localForm.clasificacion" :options="clasifOptions" label="Clasificación" outlined dense />
              </div>
              <div class="col-6">
                <q-input v-model="localForm.telefono1" label="Teléfono 1" outlined dense mask="##########" unmasked-value />
              </div>
              <div class="col-6">
                <q-input v-model="localForm.telefono2" label="Teléfono 2" outlined dense mask="##########" unmasked-value />
              </div>

              <div class="col-12 text-overline text-primary q-mt-md">Domicilio</div>
              <div class="col-12">
                <q-input
                  v-model="localForm.callenum"
                  label="Calle y Número"
                  outlined dense
                  class="text-uppercase"
                  @update:model-value="val => onInputUpdate('callenum', val)"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="localForm.colonia"
                  label="Colonia"
                  outlined dense
                  class="text-uppercase"
                  @update:model-value="val => onInputUpdate('colonia', val)"
                />
              </div>
              <div class="col-6">
                <q-input v-model="localForm.codPostal" label="C.P." outlined dense mask="#####" />
              </div>
              <div class="col-4">
                <q-input
                  v-model="localForm.municipio"
                  label="Municipio"
                  outlined dense
                  class="text-uppercase"
                  @update:model-value="val => onInputUpdate('municipio', val)"
                />
              </div>
              <div class="col-4">
                <q-select
                  v-model="localForm.estado"
                  :options="opcionesFiltradas"
                  label="Estado"
                  outlined
                  dense
                  use-input
                  fill-input
                  hide-selected
                  input-debounce="0"
                  @filter="filterFn"
                  class="text-uppercase"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">No se encontraron resultados</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-4">
                <q-input
                  v-model="localForm.ocupacion"
                  label="Ocupación"
                  outlined dense
                  class="text-uppercase"
                  @update:model-value="val => onInputUpdate('ocupacion', val)"
                />
              </div>
            </div>
          </div>

          <div class="col-12 col-md-5">
            <div class="text-overline text-primary q-mb-sm text-center">Documentación (INE)</div>

            <div class="column q-gutter-y-md items-center">

              <div class="document-uploader relative-position" @click="triggerFrente">
                <q-img v-if="displayFrente" :src="displayFrente" class="full-height rounded-borders">
                  <div class="absolute-bottom text-subtitle2 text-center q-pa-xs bg-black-5">Frente</div>
                </q-img>
                <div v-else-if="!loadingFrente" class="column flex-center text-grey-6 full-height">
                  <q-icon name="add_a_photo" size="40px" />
                  <span class="text-caption">Subir INE Frente</span>
                </div>
                <q-inner-loading :showing="loadingFrente">
                  <q-spinner-gears size="50px" color="primary" />
                </q-inner-loading>

                <q-file ref="frenteInputRef" v-model="frenteFile" v-show="false" accept="image/*" @update:model-value="processImage($event, 'ineFrente')" />
              </div>

              <div class="document-uploader relative-position" @click="triggerReverso">
                <q-img v-if="displayReverso" :src="displayReverso" class="full-height rounded-borders">
                  <div class="absolute-bottom text-subtitle2 text-center q-pa-xs bg-black-5">Reverso</div>
                </q-img>
                <div v-else-if="!loadingReverso" class="column flex-center text-grey-6 full-height">
                  <q-icon name="add_a_photo" size="40px" />
                  <span class="text-caption">Subir INE Reverso</span>
                </div>
                <q-inner-loading :showing="loadingReverso">
                  <q-spinner-gears size="50px" color="primary" />
                </q-inner-loading>

                <q-file ref="reversoInputRef" v-model="reversoFile" v-show="false" accept="image/*" @update:model-value="processImage($event, 'ineReverso')" />
              </div>

            </div>

            <div class="col-12 q-mt-md">
              <q-input v-model="localForm.observacion" type="textarea" label="Observaciones internas" outlined dense rows="3" class="text-uppercase" @update:model-value="val => onInputUpdate('observacion', val)" />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn flat label="Cancelar" color="grey-8" v-close-popup rounded />
        <q-btn unelevated color="primary" label="Guardar Cliente" type="submit" class="q-px-xl shadow-5" rounded />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { api } from 'boot/axios'

  const props = defineProps({
    initialData: Object,
    isEdit: Boolean
  })

  const emit = defineEmits(['save'])

  const localForm = ref({ ...props.initialData })
  const clasifOptions = ['NUEVO', 'EXCELENTE', 'BUENO', 'REGULAR', 'MALO']

  // Referencias a los componentes QFile
  const frenteInputRef = ref(null)
  const reversoInputRef = ref(null)
  const frenteFile = ref(null)
  const reversoFile = ref(null)

  const displayFrente = ref(null)
  const displayReverso = ref(null)
  const loadingFrente = ref(false)
  const loadingReverso = ref(false)

  const estadosMexico = [
    'AGUASCALIENTES', 'BAJA CALIFORNIA', 'BAJA CALIFORNIA SUR', 'CAMPECHE', 'CHIAPAS',
    'CHIHUAHUA', 'CIUDAD DE MÉXICO', 'COAHUILA', 'COLIMA', 'DURANGO', 'ESTADO DE MÉXICO',
    'GUANAJUATO', 'GUERRERO', 'HIDALGO', 'JALISCO', 'MICHOACÁN', 'MORELOS', 'NAYARIT',
    'NUEVO LEÓN', 'OAXACA', 'PUEBLA', 'QUERÉTARO', 'QUINTANA ROO', 'SAN LUIS POTOSÍ',
    'SINALOA', 'SONORA', 'TABASCO', 'TAMAULIPAS', 'TLAXCALA', 'VERACRUZ', 'YUCATÁN', 'ZACATECAS'
  ];

  const opcionesFiltradas = ref(estadosMexico)

  const filterFn = (val, update) => {
    if (val === '') {
      update(() => {
        opcionesFiltradas.value = estadosMexico // Si está vacío, mostramos todos
      })
      return
    }

    update(() => {
      const needle = val.toUpperCase()
      // Filtramos la lista original y asignamos el resultado a la reactiva
      opcionesFiltradas.value = estadosMexico.filter(
        v => v.toUpperCase().indexOf(needle) > -1
      )
    })
  }

  // Funciones para disparar el selector de archivos
  const triggerFrente = () => { frenteInputRef.value.pickFiles() }
  const triggerReverso = () => { reversoInputRef.value.pickFiles() }

  const onInputUpdate = (field, val) => {
    if (val && typeof val === 'string') {
      localForm.value[field] = val.toUpperCase()
    }
  }

  const loadSecureImage = async (dbPath) => {
    if (!dbPath) return null;
    if (dbPath.startsWith('data:')) return dbPath;

    try {
      const response = await api.get(`/api/clientes/ines/${dbPath}`, {
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Error cargando imagen privada:', error);
      return null;
    }
  };

  const hydrateImages = async () => {
    displayFrente.value = null
    displayReverso.value = null
    if (props.isEdit && props.initialData) {
      if (props.initialData.ineFrente) {
        loadingFrente.value = true
        displayFrente.value = await loadSecureImage(props.initialData.ineFrente)
        loadingFrente.value = false
      }
      if (props.initialData.ineReverso) {
        loadingReverso.value = true
        displayReverso.value = await loadSecureImage(props.initialData.ineReverso)
        loadingReverso.value = false
      }
    }
  }

  const processImage = (file, target) => {
    if (!file) return;
    const reader = new FileReader()
    reader.onload = (e) => {
      localForm.value[target] = e.target.result;
      if (target === 'ineFrente') displayFrente.value = e.target.result
      if (target === 'ineReverso') displayReverso.value = e.target.result
    };
    reader.readAsDataURL(file)
  }

  const submitForm = () => {
    emit('save', localForm.value)
  }

  watch(() => props.initialData, hydrateImages);
  onMounted(hydrateImages)
</script>

<style scoped>
  .document-uploader {
    width: 100%;
    height: 160px;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    background: #f8fafc;
  }
  .document-uploader:hover {
    border-color: var(--q-primary);
    background: #f1f5f9;
  }
  .bg-black-5 { background: rgba(0, 0, 0, 0.5); }

  /* Fuerza mayúsculas visuales en los inputs */
  .text-uppercase input, .text-uppercase textarea {
    text-transform: uppercase;
  }
</style>
