<template>
  <q-page class="q-pa-md bg-blue-grey-1">
    <div class="text-h5 text-weight-bolder text-primary q-mb-md uppercase">
      Catálogos de Joyería
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="shadow-1">
          <q-card-section class="bg-primary text-white row items-center justify-between q-py-sm">
            <div class="text-h6 text-weight-bold">Categorías (Oro, Plata...)</div>
            <q-btn icon="add" color="white" text-color="primary" round dense size="sm" @click="agregar('categorias')" />
          </q-card-section>

          <q-markup-table dense flat class="bg-white">
            <thead>
              <tr><th class="text-left">Nombre</th><th class="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              <tr v-for="cat in categorias" :key="cat.id">
                <td class="text-weight-bold">{{ cat.nombre }}</td>
                <td class="text-right">
                  <q-btn flat round dense color="blue-8" icon="edit" size="sm" @click="editar('categorias', cat)" />
                  <q-btn flat round dense color="red-8" icon="delete" size="sm" @click="eliminar('categorias', cat.id)" />
                </td>
              </tr>
              <tr v-if="categorias.length === 0"><td colspan="2" class="text-center text-grey">Sin registros</td></tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="shadow-1">
          <q-card-section class="bg-indigo-9 text-white row items-center justify-between q-py-sm">
            <div class="text-h6 text-weight-bold">Clasificaciones (Anillo, Cadena...)</div>
            <q-btn icon="add" color="white" text-color="indigo-9" round dense size="sm" @click="agregar('clasificaciones')" />
          </q-card-section>

          <q-markup-table dense flat class="bg-white">
            <thead>
              <tr><th class="text-left">Nombre</th><th class="text-right">Acciones</th></tr>
            </thead>
            <tbody>
              <tr v-for="clasif in clasificaciones" :key="clasif.id">
                <td class="text-weight-bold">{{ clasif.nombre }}</td>
                <td class="text-right">
                  <q-btn flat round dense color="blue-8" icon="edit" size="sm" @click="editar('clasificaciones', clasif)" />
                  <q-btn flat round dense color="red-8" icon="delete" size="sm" @click="eliminar('clasificaciones', clasif.id)" />
                </td>
              </tr>
              <tr v-if="clasificaciones.length === 0"><td colspan="2" class="text-center text-grey">Sin registros</td></tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useQuasar } from 'quasar'
  import { api } from 'boot/axios'

  const $q = useQuasar()
  const categorias = ref([])
  const clasificaciones = ref([])

  const cargarDatos = async () => {
    $q.loading.show()
    try {
      const resCat = await api.get('/api/catalogos-joyeria/categorias')
      categorias.value = resCat.data
      const resClas = await api.get('/api/catalogos-joyeria/clasificaciones')
      clasificaciones.value = resClas.data
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Error al cargar los catálogos' })
    }
    $q.loading.hide()
  }

  const agregar = (tipo) => {
    const titulo = tipo === 'categorias' ? 'Nueva Categoría' : 'Nueva Clasificación'
    $q.dialog({
      title: titulo,
      message: 'Ingrese el nombre:',
      prompt: { model: '', type: 'text', outlined: true, class: 'text-uppercase' },
      cancel: true,
      persistent: true
    }).onOk(async (data) => {
      if (!data.trim()) return
      try {
        await api.post(`/api/catalogos-joyeria/${tipo}`, { nombre: data.trim() })
        $q.notify({ type: 'positive', message: 'Guardado correctamente' })
        cargarDatos()
      } catch (e) {
        $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al guardar' })
      }
    })
  }

  const editar = (tipo, item) => {
    const titulo = tipo === 'categorias' ? 'Editar Categoría' : 'Editar Clasificación'
    $q.dialog({
      title: titulo,
      message: 'Modifique el nombre:',
      prompt: { model: item.nombre, type: 'text', outlined: true, class: 'text-uppercase' },
      cancel: true,
      persistent: true
    }).onOk(async (data) => {
      if (!data.trim() || data.trim() === item.nombre) return
      try {
        await api.put(`/api/catalogos-joyeria/${tipo}/${item.id}`, { nombre: data.trim() })
        $q.notify({ type: 'positive', message: 'Actualizado correctamente' })
        cargarDatos()
      } catch (e) {
        $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al actualizar' })
      }
    })
  }

  const eliminar = (tipo, id) => {
    $q.dialog({
      title: 'Confirmar',
      message: '¿Está seguro de eliminar este registro?',
      cancel: true,
      persistent: true
    }).onOk(async () => {
      try {
        await api.delete(`/api/catalogos-joyeria/${tipo}/${id}`)
        $q.notify({ type: 'positive', message: 'Eliminado correctamente' })
        cargarDatos()
      } catch (e) {
        $q.notify({ type: 'negative', message: 'Error al eliminar' })
      }
    })
  }

  onMounted(cargarDatos)
</script>
