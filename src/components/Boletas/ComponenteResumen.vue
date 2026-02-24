<template>
  <q-card flat bordered class="resumen-premium-card shadow-12">
    <q-card-section class="bg-primary text-white q-pa-md header-gradient">
      <div class="row items-center no-wrap">
        <q-icon name="analytics" size="sm" class="q-mr-sm" />
        <div class="column">
          <div class="text-subtitle2 text-weight-bolder uppercase tracking-widest">Resumen Financiero</div>
          <div class="text-caption opacity-80">Cálculos automáticos</div>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-lg q-gutter-y-md">
      <div class="financial-block principal">
        <div class="text-overline text-primary text-weight-bold">Monto del Préstamo</div>
        <div class="row justify-between items-baseline">
          <span class="text-h4 text-weight-bolder text-slate-900">$ {{ formatMoney(resumen.prestamo) }}</span>
          <q-badge outline color="primary" label="CAPITAL" class="q-px-sm" />
        </div>
      </div>

      <q-separator inset class="q-my-sm opacity-50" />

      <div class="column q-gutter-y-xs">
        <div class="detail-row">
          <span class="label">Valor Comercial:</span>
          <span class="value text-weight-bold text-slate-700">$ {{ formatMoney(resumen.valor_comercial) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Tasa de Interés:</span>
          <span class="value text-primary text-weight-bold">{{ resumen.p_interes }}% Mensual</span>
        </div>
      </div>

      <div class="bg-slate-50 q-pa-md rounded-borders border-subtle q-mt-md">
        <div class="detail-row small">
          <span class="label">Comisión por Servicio:</span>
          <span class="value">$ {{ formatMoney(resumen.comision) }}</span>
        </div>
        <div class="detail-row small">
          <span class="label">I.V.A. (16%):</span>
          <span class="value">$ {{ formatMoney(resumen.iva_comision) }}</span>
        </div>
      </div>

      <div class="total-final-container q-mt-xl q-pa-md text-center">
        <div class="text-overline text-slate-500 uppercase">Total a Liquidar</div>
        <div class="text-h2 text-weight-bolder text-primary">
          $ {{ formatMoney(resumen.total_pagar) }}
        </div>
        <div class="text-caption text-grey-6 q-mt-xs italic">
          * Fecha Vence: {{ resumen.fecha_vencimiento || '---' }}
        </div>
      </div>
    </q-card-section>

    <q-card-actions class="q-pa-lg">
      <q-btn
        unelevated
        color="primary"
        size="lg"
        class="full-width btn-confirmar-premium"
        @click="$emit('confirmar')"
      >
        <div class="row items-center justify-between full-width q-px-md text-weight-bolder">
          <span>F6 CONFIRMAR</span>
          <q-icon name="arrow_forward" />
        </div>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup>
  const props = defineProps({
    resumen: { type: Object, required: true }
  })
  const emit = defineEmits(['confirmar'])

  const formatMoney = (val) => {
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
</script>

<style lang="scss" scoped>
  .resumen-premium-card {
    border-radius: 20px;
    background: white;
    border: 1px solid #e2e8f0;
  }
  .header-gradient { background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%); }
  .detail-row {
    display: flex; justify-content: space-between; font-size: 0.95rem;
    &.small { font-size: 0.85rem; padding: 2px 0; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #1e293b; }
  }
  .border-subtle { border: 1px solid #e2e8f0; }
  .total-final-container {
    background: #f8fafc; border-radius: 15px; position: relative;
    &::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 40px; height: 4px; background: #1976D2; border-radius: 0 0 4px 4px; }
  }
  .btn-confirmar-premium {
    border-radius: 12px; height: 60px; box-shadow: 0 10px 15px -3px rgba(25, 118, 210, 0.3);
    transition: all 0.3s ease;
    &:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(25, 118, 210, 0.4); }
  }
  .tracking-widest { letter-spacing: 0.12em; }
  .tracking-tighter { letter-spacing: -0.05em; }
</style>
