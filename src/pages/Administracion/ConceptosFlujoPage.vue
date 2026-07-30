<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">
        <q-icon name="category" class="q-mr-sm" />
        Conceptos de Flujo de Caja
      </div>
      <q-btn color="primary" icon="add" label="Nuevo Concepto" @click="abrirDialogo(null)" />
    </div>

    <q-card class="shadow-2">
      <q-table
        :rows="conceptos"
        :columns="columnas"
        row-key="id"
        :loading="loading"
        flat
        bordered
      >
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip
              :color="props.row.tipo === 'ENTRADA' ? 'positive' : 'negative'"
              text-color="white"
              dense
              class="text-weight-bold"
            >
              {{ props.row.tipo }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-toggle
              v-model="props.row.activo"
              checked-icon="check"
              unchecked-icon="clear"
              color="green"
              keep-color
              @update:model-value="toggleActivo(props.row)"
              :false-value="0"
              :true-value="1"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn flat round dense color="primary" icon="edit" @click="abrirDialogo(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat round dense color="negative" icon="delete" @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo Crear/Editar -->
    <q-dialog v-model="dialogoVisible" persistent>
      <q-card style="width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ form.id ? 'Editar Concepto' : 'Nuevo Concepto' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-input
            v-model="form.nombre"
            label="Nombre del Concepto *"
            outlined
            dense
            class="q-mb-md"
            :rules="[val => !!val || 'El nombre es requerido']"
          />
          <q-select
            v-model="form.tipo"
            :options="['ENTRADA', 'SALIDA']"
            label="Tipo de Movimiento *"
            outlined
            dense
            class="q-mb-md"
            :rules="[val => !!val || 'El tipo es requerido']"
          />
          <q-toggle v-model="form.activo" label="Activo" color="positive" :false-value="0" :true-value="1" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Guardar" @click="guardarConcepto" :loading="guardando" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const conceptos = ref([])
const loading = ref(false)
const guardando = ref(false)
const dialogoVisible = ref(false)

const form = ref({
  id: null,
  nombre: '',
  tipo: 'SALIDA',
  activo: 1
})

const columnas = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center', sortable: true },
  { name: 'activo', label: 'Activo', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

onMounted(() => {
  cargarConceptos()
})

const cargarConceptos = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/flujo-conceptos')
    conceptos.value = res.data
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al cargar conceptos' })
  } finally {
    loading.value = false
  }
}

const abrirDialogo = (row) => {
  if (row) {
    form.value = { ...row }
  } else {
    form.value = { id: null, nombre: '', tipo: 'SALIDA', activo: 1 }
  }
  dialogoVisible.value = true
}

const guardarConcepto = async () => {
  if (!form.value.nombre || !form.value.tipo) {
    $q.notify({ type: 'warning', message: 'Complete los campos requeridos' })
    return
  }

  guardando.value = true
  try {
    if (form.value.id) {
      await api.put(`/api/flujo-conceptos/${form.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Concepto actualizado' })
    } else {
      await api.post('/api/flujo-conceptos', form.value)
      $q.notify({ type: 'positive', message: 'Concepto creado' })
    }
    dialogoVisible.value = false
    cargarConceptos()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error al guardar' })
  } finally {
    guardando.value = false
  }
}

const toggleActivo = async (row) => {
  try {
    await api.put(`/api/flujo-conceptos/${row.id}`, { activo: row.activo })
    $q.notify({ type: 'positive', message: 'Estado actualizado' })
  } catch (error) {
    row.activo = row.activo === 1 ? 0 : 1 // revert
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

const confirmarEliminar = (row) => {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Está seguro de eliminar el concepto "${row.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/api/flujo-conceptos/${row.id}`)
      $q.notify({ type: 'positive', message: 'Concepto eliminado' })
      cargarConceptos()
    } catch (error) {
      if (error.response && error.response.status === 409) {
        $q.notify({ type: 'warning', message: error.response.data.message })
      } else {
        $q.notify({ type: 'negative', message: 'Error al eliminar' })
      }
    }
  })
}
</script>
