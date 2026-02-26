<template>
  <q-card flat class="resumen-compact-card">
    <q-card-section class="q-pa-md">
      <div class="row items-center q-mb-md opacity-60">
        <q-icon name="payments" size="xs" class="q-mr-xs" />
        <div class="text-overline text-weight-bold tracking-widest">Totales de Operación</div>
      </div>

      <div class="column q-gutter-y-sm">

        <div class="financial-row principal">
          <span class="label">Valor Préstamo:</span>
          <div class="value-container">
            <span class="currency">$</span>
            <span class="amount">{{ formatMoney(resumen.prestamo) }}</span>
          </div>
        </div>

        <div class="financial-row secondary">
          <span class="label">Valor Comercial:</span>
          <div class="value-container">
            <span class="currency">$</span>
            <span class="amount">{{ formatMoney(resumen.valor_comercial) }}</span>
          </div>
        </div>

        <q-separator class="q-my-xs opacity-10" />

        <div class="financial-row secondary">
          <span class="label">% de Comisión:</span>
          <div class="value-container">
            <span class="amount">{{ resumen.p_interes }}</span>
            <span class="suffix">%</span>
          </div>
        </div>

        <div class="financial-row secondary">
          <span class="label">Comisiones:</span>
          <div class="value-container">
            <span class="currency">$</span>
            <span class="amount">{{ formatMoney(resumen.comision) }}</span>
          </div>
        </div>

        <div class="financial-row total-highlight q-mt-md">
          <span class="label">Total a Pagar:</span>
          <div class="value-container">
            <span class="currency">$</span>
            <span class="amount">{{ formatMoney(resumen.total_pagar) }}</span>
          </div>
        </div>
      </div>

      <div class="row justify-center q-mt-lg">
        <q-badge color="orange-2" text-color="orange-10" class="q-px-md q-py-xs text-weight-bolder rounded-borders">
          VENCE EL: {{ (resumen.fecha_vencimiento || '---').toUpperCase() }}
        </q-badge>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
  const props = defineProps({
    resumen: { type: Object, required: true }
  })

  const formatMoney = (val) => {
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
</script>

<style lang="scss" scoped>
  .resumen-compact-card {
    background: transparent;
  }

  .financial-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;

    .label {
      font-size: 0.85rem;
      color: #334155;
      font-weight: 500;
    }

    .value-container {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 8px;
      min-width: 110px;
      text-align: right;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); // Efecto de profundidad

      .currency { font-size: 0.75rem; font-weight: 700; margin-right: 2px; color: #64748b; }
      .amount { font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; font-weight: 800; color: #0f172a; }
      .suffix { font-size: 0.8rem; font-weight: 700; margin-left: 2px; color: #64748b; }
    }

    &.principal .amount {
      color: #1e293b;
      font-size: 1.1rem;
    }

    &.total-highlight {
      .label { font-weight: 900; color: #1e3a8a; text-transform: uppercase; font-size: 0.9rem; }
      .value-container {
        border: 2px solid #1e3a8a;
        background: #f8fafc;
        .amount { color: #1e3a8a; font-size: 1.1rem; }
      }
    }
  }

  .tracking-widest { letter-spacing: 0.15em; }
</style>
