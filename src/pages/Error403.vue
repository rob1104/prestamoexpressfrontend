<template>
  <q-div class="forbidden-page flex flex-center q-pa-md">
    <div class="absolute-full overflow-hidden bg-slate-100">
      <div class="abstract-circle circle-1"></div>
      <div class="abstract-circle circle-2"></div>
    </div>

    <q-card class="forbidden-card shadow-24 text-center">
      <q-card-section class="q-pa-xl">
        <div class="relative-position q-mb-lg flex flex-center">
          <div class="icon-bg-pulse absolute-center"></div>
          <q-avatar size="120px" class="bg-white shadow-10 border-elegant">
            <q-icon name="security" size="60px" color="primary" />
            <q-badge floating color="negative" rounded class="status-badge">
              <q-icon name="lock" size="14px" color="white" />
            </q-badge>
          </q-avatar>
        </div>

        <div class="text-h2 text-weight-bolder text-primary q-mb-xs tracking-tighter">
          403
        </div>
        <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-md">
          Acceso no autorizado
        </div>

        <div class="divider-elegant q-mx-auto q-mb-lg"></div>

        <p class="text-subtitle1 text-blue-grey-7 q-mb-xl px-md line-height-relaxed">
          Tu perfil actual no cuenta con los privilegios necesarios para acceder a <span class="text-weight-bold text-primary">esta sección</span>.
          <br>
          <span class="text-caption">Si necesitas acceso, solicita una actualización de rol a tu supervisor.</span>
        </p>

        <div class="row justify-center q-gutter-md">
          <q-btn
            flat
            color="primary"
            label="Regresar"
            icon="chevron_left"
            rounded
            class="q-px-lg text-weight-bold btn-hover-soft"
            @click="$router.go(-1)"
          />
          <q-btn
            unelevated
            color="primary"
            label="Ir al Inicio"
            icon="dashboard"
            rounded
            class="q-px-xl text-weight-bold shadow-8 btn-premium"
            to="/"
          />
        </div>
      </q-card-section>

      <q-card-section class="bg-grey-1 q-py-sm border-top-soft">
        <div class="row items-center justify-center q-gutter-x-sm text-grey-6" style="font-size: 0.7rem">
          <q-icon name="shield" size="14px" />
          <span class="text-uppercase tracking-widest text-weight-bold">SICAE Security Stack</span>
          <span class="text-grey-4">|</span>
          <span class="font-mono">REF: {{ trackingId }}</span>
        </div>
      </q-card-section>
    </q-card>
  </q-div>
</template>

<script setup>
  import { computed } from 'vue'

  const trackingId = computed(() =>
    Math.random().toString(36).substr(2, 9).toUpperCase()
  )
</script>

<style lang="scss" scoped>
  .forbidden-page {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
  }

  .forbidden-card {
    width: 100%;
    max-width: 540px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.6);
  }

  .border-elegant {
    border: 4px solid #f1f5f9;
  }

  .status-badge {
    padding: 6px;
    top: 10px;
    right: 10px;
    border: 3px solid white;
  }

  .icon-bg-pulse {
    width: 140px;
    height: 140px;
    background: rgba(var(--q-primary), 0.05);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }

  .divider-elegant {
    width: 60px;
    height: 4px;
    background: var(--q-primary);
    border-radius: 10px;
    opacity: 0.3;
  }

  .tracking-tighter { letter-spacing: -2px; }
  .tracking-widest { letter-spacing: 1px; }
  .line-height-relaxed { line-height: 1.6; }

  .btn-premium {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%) !important;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 20px rgba(30, 58, 138, 0.3) !important;
    }
  }

  .btn-hover-soft {
    &:hover {
      background: rgba(30, 58, 138, 0.05);
    }
  }

  /* Decoraciones de fondo */
  .abstract-circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(to bottom right, rgba(30, 58, 138, 0.05), transparent);
    z-index: 0;
  }
  .circle-1 { width: 400px; height: 400px; top: -100px; left: -100px; }
  .circle-2 { width: 300px; height: 300px; bottom: -50px; right: -50px; }

  .border-top-soft {
    border-top: 1px solid rgba(0,0,0,0.05);
  }
</style>
