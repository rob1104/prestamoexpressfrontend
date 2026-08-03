<template>
  <q-dialog v-model="mostrar" persistent>
    <q-card style="width: 800px; max-width: 95vw;" class="shadow-24">
      <q-card-section class="bg-primary text-white row items-center q-pb-sm">
        <div class="text-h6 text-weight-bold uppercase">
          <q-icon name="point_of_sale" size="sm" class="q-mr-sm" />
          Arqueo de Moneda Nacional
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md bg-grey-1">
        <div class="text-center text-subtitle1 text-primary text-weight-bold q-mb-md">
          DENOMINACION DE BILLETE/ MONEDA
        </div>

        <div class="row q-col-gutter-md">
          <!-- Billetes -->
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-8">Billetes</div>
            <div class="row items-center q-mb-sm" v-for="b in billetes" :key="'b'+b.valor">
              <div class="col-4 text-right q-pr-sm">Billete ${{ b.valor }}:</div>
              <div class="col-4">
                <q-input v-model.number="b.cantidad" type="number" dense outlined bg-color="white" min="0" @update:model-value="calcularTotales" />
              </div>
              <div class="col-4 text-right text-weight-bold">
                ${{ (b.cantidad * b.valor).toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Monedas -->
          <div class="col-12 col-md-6">
            <div class="text-subtitle2 text-weight-bold q-mb-sm text-grey-8">Monedas</div>
            <div class="row items-center q-mb-sm" v-for="m in monedas" :key="'m'+m.valor">
              <div class="col-4 text-right q-pr-sm">
                Moneda {{ m.valor < 1 ? 'c' + (m.valor).toFixed(2) : '$' + m.valor }}:
              </div>
              <div class="col-4">
                <q-input v-model.number="m.cantidad" type="number" dense outlined bg-color="white" min="0" @update:model-value="calcularTotales" />
              </div>
              <div class="col-4 text-right text-weight-bold">
                ${{ (m.cantidad * m.valor).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-section class="bg-grey-2 border-top">
        <div class="row items-center justify-between">
          <div class="text-h6 text-grey-8">
            Total Piezas: <span class="text-black text-weight-bold">{{ totalPiezas }}</span>
          </div>
          <div class="text-h4 text-primary text-weight-bolder">
            ${{ totalImporte.toFixed(2) }}
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-primary">
        <q-btn flat label="Limpiar Datos" color="negative" icon="delete_sweep" @click="limpiarDatos" />
        <q-space />
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn label="Confirmar Arqueo" color="primary" icon="check" @click="confirmarArqueo" :loading="procesando" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import axios from 'axios';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'arqueo-realizado']);
const $q = useQuasar();

const mostrar = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const procesando = ref(false);

const billetes = ref([
  { valor: 1000, cantidad: 0, key: '1000' },
  { valor: 500, cantidad: 0, key: '500' },
  { valor: 200, cantidad: 0, key: '200' },
  { valor: 100, cantidad: 0, key: '100' },
  { valor: 50, cantidad: 0, key: '50' },
  { valor: 20, cantidad: 0, key: '20' }
]);

const monedas = ref([
  { valor: 10, cantidad: 0, key: '10' },
  { valor: 5, cantidad: 0, key: '5' },
  { valor: 2, cantidad: 0, key: '2' },
  { valor: 1, cantidad: 0, key: '1' },
  { valor: 0.50, cantidad: 0, key: '0_50' },
  { valor: 0.20, cantidad: 0, key: '0_20' },
  { valor: 0.10, cantidad: 0, key: '0_10' },
  { valor: 0.01, cantidad: 0, key: '0_01' }
]);

const totalPiezas = ref(0);
const totalImporte = ref(0);

const calcularTotales = () => {
  let piezas = 0;
  let importe = 0;

  billetes.value.forEach(b => {
    piezas += Number(b.cantidad) || 0;
    importe += (Number(b.cantidad) || 0) * b.valor;
  });

  monedas.value.forEach(m => {
    piezas += Number(m.cantidad) || 0;
    importe += (Number(m.cantidad) || 0) * m.valor;
  });

  totalPiezas.value = piezas;
  totalImporte.value = importe;
};

const limpiarDatos = () => {
  billetes.value.forEach(b => b.cantidad = 0);
  monedas.value.forEach(m => m.cantidad = 0);
  calcularTotales();
};

watch(mostrar, (val) => {
  if (val) {
    limpiarDatos();
  }
});

const confirmarArqueo = async () => {
  if (totalImporte.value === 0) {
    $q.notify({ type: 'warning', message: 'El importe total es $0. Ingrese cantidades válidas.' });
    return;
  }

  $q.dialog({
    title: 'Confirmar Arqueo',
    message: `¿Está seguro de registrar este arqueo por un total de $${totalImporte.value.toFixed(2)}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    procesando.value = true;
    try {
      // Construir el desglose
      const desglose = {
        billetes: {},
        monedas: {}
      };
      
      billetes.value.forEach(b => desglose.billetes[b.key] = Number(b.cantidad) || 0);
      monedas.value.forEach(m => desglose.monedas[m.key] = Number(m.cantidad) || 0);

      // Guardar en backend
      const res = await api.post('/api/caja/arqueo', {
        caja_id: 1, // Por ahora fijo a caja 1
        desglose: desglose
      });

      const arqueoData = res.data.arqueo;

      // Enviar a imprimir a Python Bridge
      try {
        await axios.post('http://localhost:5000/print-arqueo', arqueoData);
        $q.notify({ type: 'positive', message: 'Arqueo guardado e impreso correctamente', icon: 'print' });
      } catch (printErr) {
        console.error('Error de impresión:', printErr);
        $q.notify({ type: 'warning', message: 'Arqueo guardado, pero falló la impresión local', icon: 'warning' });
      }

      emit('arqueo-realizado');
      mostrar.value = false;
    } catch (error) {
      console.error(error);
      $q.notify({ type: 'negative', message: 'Error al registrar el arqueo' });
    } finally {
      procesando.value = false;
    }
  });
};
</script>

<style scoped>
.border-top {
  border-top: 1px solid #e0e0e0;
}
</style>
