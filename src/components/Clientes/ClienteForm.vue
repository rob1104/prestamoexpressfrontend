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
  <q-input v-model="localForm.nombre" label="Nombre(s)" outlined dense class="text-uppercase" @update:model-value="calcularRFC" />
</div>
<div class="col-6">
  <q-input v-model="localForm.apellido_paterno" label="Apellido Paterno" outlined dense class="text-uppercase" @update:model-value="calcularRFC" />
</div>
<div class="col-6">
  <q-input v-model="localForm.apellido_materno" label="Apellido Materno" outlined dense class="text-uppercase" @update:model-value="calcularRFC" />
</div>
<div class="col-6">
  <q-input v-model="localForm.fecha_nacimiento" type="date" label="Fecha de Nacimiento" outlined dense @update:model-value="calcularRFC" />
</div>
<div class="col-6">
  <q-select v-model="localForm.estado_origen" :options="estadosMexico" label="Estado de Origen" outlined dense />
</div>
<div class="col-12">
  <q-input
    v-model="localForm.rfc"
    label="RFC con Homoclave"
    outlined dense
    readonly
    bg-color="orange-1"
    hint="Se calcula automáticamente"
    class="text-uppercase text-weight-bolder"
  >
    <template v-slot:prepend><q-icon name="assignment_ind" /></template>
  </q-input>
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
              <div class="col-12">
                <q-input v-model="localForm.email" label="Correo Electrónico" outlined dense type="email" />
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

  if (!props.isEdit) {
    localForm.value.estado_origen = 'TAMAULIPAS'
    localForm.value.estado = 'TAMAULIPAS'
  }

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

  // ClienteForm.vue

const calcularRFC = () => {
  const nombre = (localForm.value.nombre || '').trim().toUpperCase();
  const apPaterno = (localForm.value.apellido_paterno || '').trim().toUpperCase();
  const apMaterno = (localForm.value.apellido_materno || '').trim().toUpperCase();
  const fecha = localForm.value.fecha_nacimiento; // YYYY-MM-DD

  if (!nombre || !apPaterno || !fecha) return;

  // --- 1. GENERACIÓN DE LOS PRIMEROS 10 CARACTERES ---
  let rfc10 = '';

  // Apellido Paterno: Primera letra + primera vocal interna
  rfc10 += apPaterno.substring(0, 1);
  const vocalPaterno = apPaterno.substring(1).match(/[AEIOU]/g);
  rfc10 += vocalPaterno ? vocalPaterno[0] : 'X';

  // Apellido Materno: Primera letra (o X si no tiene)
  rfc10 += apMaterno ? apMaterno.substring(0, 1) : 'X';

  // Nombre: Primera letra
  // (Nota: El algoritmo oficial ignora nombres comunes como MARIA o JOSE si tienen un segundo nombre)
  const nombresFiltro = ["MARIA ", "JOSE ", "MA ", "MA. ", "J ", "J. "];
  let nombreLimpio = nombre;
  nombresFiltro.forEach(prefix => {
    if (nombre.startsWith(prefix)) nombreLimpio = nombre.replace(prefix, "");
  });
  rfc10 += nombreLimpio.substring(0, 1);

  // Fecha: YYMMDD
  const [year, month, day] = fecha.split('-');
  rfc10 += year.substring(2, 4) + month + day;

  // Filtro de "Palabras Inconvenientes" (SAT)
  const malasPalabras = ["BUEI", "BUEY", "CACA", "CACO", "CAGA", "CAGO", "CAKA", "CAKO", "COGE", "COGI", "COJA", "COJE", "COJI", "COJO", "COLA", "CULO", "FALO", "FETO", "GETA", "GUEI", "GUEY", "JETA", "JOTO", "KACA", "KACO", "KAGA", "KAGO", "KAKA", "KAKO", "KOGE", "KOGI", "KOJA", "KOJE", "KOJI", "KOJO", "KOLA", "KULO", "LILO", "LOCA", "LOCO", "LOKA", "LOKO", "MAME", "MAMO", "MEAR", "MEAS", "MEON", "MIAR", "MION", "MOCO", "MOKO", "MULA", "PEDA", "PEDO", "PENE", "PUTA", "PUTO", "QULO", "RATA", "ROBA", "ROBE", "ROBO", "RUIN", "SENO", "TETA", "VACA", "VAGA", "VAGO", "VUEI", "VUEY", "WUEI", "WUEY"];
  if (malasPalabras.includes(rfc10.substring(0, 4))) {
    rfc10 = rfc10.substring(0, 3) + 'X' + rfc10.substring(4);
  }

  // --- 2. CÁLCULO DE LA HOMOCLAVE (Caracteres 11 y 12) ---
  const nombreCompleto = `${apPaterno} ${apMaterno} ${nombre}`;
  const tablaValores = {
    ' ': '00', '0': '00', '1': '01', '2': '02', '3': '03', '4': '04', '5': '05', '6': '06', '7': '07', '8': '08', '9': '09',
    'A': '11', 'B': '12', 'C': '13', 'D': '14', 'E': '15', 'F': '16', 'G': '17', 'H': '18', 'I': '19', 'J': '21', 'K': '22',
    'L': '23', 'M': '24', 'N': '25', 'O': '26', 'P': '27', 'Q': '28', 'R': '29', 'S': '32', 'T': '33', 'U': '34', 'V': '35',
    'W': '36', 'X': '37', 'Y': '38', 'Z': '39', 'Ñ': '10'
  };

  let numString = '0';
  for (let char of nombreCompleto) {
    numString += tablaValores[char] || '00';
  }

  let suma = 0;
  for (let i = 0; i < numString.length - 1; i++) {
    let num1 = parseInt(numString.substring(i, i + 2));
    let num2 = parseInt(numString.substring(i + 1, i + 2));
    suma += num1 * num2;
  }

  const residuo = suma % 1000;
  const cociente = Math.floor(residuo / 34);
  const resto = residuo % 34;
  const tablaHC = "123456789ABCDEFGHIJKLMNPQRSTUVWXYZ"; // No incluye 'O' ni '0' para evitar confusión

  const homoclave1112 = tablaHC.charAt(cociente) + tablaHC.charAt(resto);

  // --- 3. CÁLCULO DEL DÍGITO VERIFICADOR (Carácter 13) ---
  const rfc12 = rfc10 + homoclave1112;
  const tablaDigito = "0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ"; // Índice mapeado al valor SAT
  const mappingSAT = {
    '0':0,'1':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'A':10,'B':11,'C':12,'D':13,'E':14,'F':15,'G':16,'H':17,'I':18,'J':19,'K':20,'L':21,'M':22,'N':23,'&':24,'O':25,'P':26,'Q':27,'R':28,'S':29,'T':30,'U':31,'V':32,'W':33,'X':34,'Y':35,'Z':36,' ':37,'Ñ':38
  };

  let sumaVerificador = 0;
  for (let i = 0; i < 12; i++) {
    let val = mappingSAT[rfc12.charAt(i)] || 0;
    sumaVerificador += val * (13 - i);
  }

  const residuoVerificador = sumaVerificador % 11;
  let digito13 = '';
  if (residuoVerificador === 0) digito13 = '0';
  else if (residuoVerificador === 1) digito13 = 'A';
  else digito13 = (11 - residuoVerificador).toString();

  // RESULTADO FINAL
  localForm.value.rfc = rfc12 + digito13;
  localForm.value.nombre_completo = `${nombre} ${apPaterno} ${apMaterno}`.trim();
};

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
