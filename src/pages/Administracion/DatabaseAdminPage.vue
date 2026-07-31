<template>
  <q-page padding>
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <q-card class="bg-primary text-white">
          <q-card-section>
            <div class="text-h5"><q-icon name="storage" class="q-mr-sm" /> Administración de Base de Datos</div>
            <div class="text-subtitle2">Gestión de respaldos y reinicialización del sistema</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Crear Respaldo -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section>
            <div class="text-h6"><q-icon name="backup" class="q-mr-sm text-primary" /> Crear Respaldo</div>
            <p class="text-caption text-grey-8">Genera un archivo comprimido (.zip) con la estructura y datos actuales del sistema.</p>
          </q-card-section>
          
          <q-card-actions align="center" class="q-pb-md">
            <q-btn 
              color="primary" 
              icon="add_circle" 
              label="Crear Respaldo" 
              @click="crearRespaldo" 
              :loading="isCreating"
              class="full-width"
            >
              <template v-slot:loading>
                <q-spinner-hourglass class="on-left" />
                Generando...
              </template>
            </q-btn>
          </q-card-actions>
        </q-card>

        <!-- Reinicializar Sistema -->
        <q-card class="q-mt-md border-red bg-red-1">
          <q-card-section>
            <div class="text-h6 text-red-9"><q-icon name="warning" class="q-mr-sm" /> Reinicializar Sistema</div>
            <p class="text-caption text-red-10">
              <strong>¡ADVERTENCIA!</strong> Esta acción eliminará toda la información operativa del sistema. 
              Solo se conservarán usuarios, roles y configuraciones. No se puede deshacer.
            </p>
          </q-card-section>

          <q-card-section>
            <q-input 
              v-model="confirmacionReset" 
              label="Escriba CONFIRMAR para habilitar" 
              outlined
              dense
              color="red"
              bg-color="white"
            />
          </q-card-section>
          
          <q-card-actions align="center" class="q-pb-md">
            <q-btn 
              color="negative" 
              icon="delete_forever" 
              label="Reinicializar Sistema" 
              @click="reinicializarSistema"
              :disable="confirmacionReset !== 'CONFIRMAR'"
              :loading="isResetting"
              class="full-width"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Lista de Respaldos -->
      <div class="col-12 col-md-8">
        <q-card>
          <q-card-section>
            <div class="text-h6"><q-icon name="list_alt" class="q-mr-sm text-primary" /> Respaldos Existentes</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-table
              :rows="backups"
              :columns="columns"
              row-key="name"
              :loading="isLoading"
              flat
              bordered
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:body-cell-size="props">
                <q-td :props="props">
                  {{ formatBytes(props.row.size) }}
                </q-td>
              </template>
              <template v-slot:body-cell-actions="props">
                <q-td :props="props" class="q-gutter-sm">
                  <q-btn 
                    flat 
                    dense 
                    round 
                    class="action-btn"
                    color="primary" 
                    icon="download" 
                    @click="descargarRespaldo(props.row.name)"
                    :loading="downloadingFile === props.row.name"
                  >
                    <q-tooltip>Descargar</q-tooltip>
                  </q-btn>
                  <q-btn 
                    flat 
                    dense 
                    round 
                    class="action-btn"
                    color="warning" 
                    icon="restore" 
                    @click="confirmarRestauracion(props.row.name)"
                  >
                    <q-tooltip>Restaurar</q-tooltip>
                  </q-btn>
                  <q-btn 
                    flat 
                    dense 
                    round 
                    class="action-btn"
                    color="negative" 
                    icon="delete" 
                    @click="confirmarEliminacion(props.row.name)"
                  >
                    <q-tooltip>Eliminar</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
              <template v-slot:no-data>
                <div class="full-width row flex-center text-grey q-pa-sm">
                  <q-icon size="2em" name="sentiment_dissatisfied" />
                  <span class="q-ml-sm">No hay respaldos disponibles.</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { DatabaseAdminService } from 'src/services/DatabaseAdminService'

const $q = useQuasar()

const backups = ref([])
const isLoading = ref(false)
const isCreating = ref(false)
const isResetting = ref(false)
const downloadingFile = ref(null)
const confirmacionReset = ref('')

const columns = [
  { name: 'name', required: true, label: 'Nombre del Archivo', align: 'left', field: 'name', sortable: true },
  { name: 'date', align: 'left', label: 'Fecha de Creación', field: 'date', sortable: true },
  { name: 'size', align: 'left', label: 'Tamaño', field: 'size', sortable: true },
  { name: 'actions', align: 'center', label: 'Acciones' }
]

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

const loadBackups = async () => {
  isLoading.value = true
  try {
    backups.value = await DatabaseAdminService.getBackups()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al cargar los respaldos.'
    })
  } finally {
    isLoading.value = false
  }
}

const crearRespaldo = async () => {
  isCreating.value = true
  try {
    const result = await DatabaseAdminService.createBackup()
    $q.notify({
      type: 'positive',
      message: result.message || 'Respaldo creado correctamente.'
    })
    loadBackups()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al crear el respaldo.'
    })
  } finally {
    isCreating.value = false
  }
}

const descargarRespaldo = async (filename) => {
  downloadingFile.value = filename
  try {
    await DatabaseAdminService.downloadBackup(filename)
    $q.notify({
      type: 'positive',
      message: 'Descarga iniciada.'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al descargar el respaldo.'
    })
  } finally {
    downloadingFile.value = null
  }
}

const confirmarEliminacion = (filename) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro que deseas eliminar el respaldo <strong>${filename}</strong>? Esta acción no afecta la base de datos actual.`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Eliminar'
    }
  }).onOk(async () => {
    try {
      const result = await DatabaseAdminService.deleteBackup(filename)
      $q.notify({
        type: 'positive',
        message: result.message || 'Respaldo eliminado.'
      })
      loadBackups()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al eliminar el respaldo.'
      })
    }
  })
}

const confirmarRestauracion = (filename) => {
  $q.dialog({
    title: '¡ADVERTENCIA CRÍTICA!',
    message: `La restauración eliminará toda la información actual de la base de datos y la reemplazará por la del respaldo <strong>${filename}</strong>.<br><br>¿Estás completamente seguro de continuar?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      color: 'warning',
      label: 'Sí, Restaurar'
    }
  }).onOk(async () => {
    $q.loading.show({
      message: 'Restaurando base de datos. Por favor, espere. No cierre la ventana.'
    })
    try {
      const result = await DatabaseAdminService.restoreBackup(filename)
      $q.notify({
        type: 'positive',
        message: result.message || 'Restauración completada.'
      })
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al restaurar.'
      })
    } finally {
      $q.loading.hide()
    }
  })
}

const reinicializarSistema = () => {
  if (confirmacionReset.value !== 'CONFIRMAR') return

  $q.dialog({
    title: '¡ADVERTENCIA CRÍTICA!',
    message: 'Esta acción <strong>ELIMINARÁ</strong> todos los datos operativos del sistema. Solo se conservarán usuarios y configuraciones.<br><br>¿Continuar?',
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      color: 'negative',
      label: 'Reinicializar Definitivamente'
    }
  }).onOk(async () => {
    isResetting.value = true
    $q.loading.show({
      message: 'Reinicializando sistema. Por favor, espere.'
    })
    try {
      const result = await DatabaseAdminService.resetDatabase(confirmacionReset.value)
      $q.notify({
        type: 'positive',
        message: result.message || 'Sistema reinicializado correctamente.'
      })
      confirmacionReset.value = ''
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error.response?.data?.message || 'Error al reinicializar.'
      })
    } finally {
      isResetting.value = false
      $q.loading.hide()
    }
  })
}

onMounted(() => {
  loadBackups()
})
</script>

<style scoped>
.border-red {
  border: 1px solid var(--q-negative);
}
</style>
