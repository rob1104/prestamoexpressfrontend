import axios from 'axios'
import { useAuthStore } from 'src/stores/auth'

export const PrintService = {
  async imprimirTicketPruebaPython() {
    try {
      // Definimos datos de prueba genéricos para validar la impresora
      const datosPrueba = {
        folio: "TEST-0001",
        total: 150.00,
        productos: [
          { nombre: "Producto de Prueba A", precio: 100.00 },
          { nombre: "Producto de Prueba B", precio: 50.00 }
        ]
      }

      // Enviamos la petición al puente de Python (Flask)
      const response = await axios.post('http://localhost:5000/printtest', datosPrueba)

      return response.data
    } catch (error) {
      console.error("Error al conectar con el puente de impresión:", error)
      // Error amigable para el usuario final
      throw new Error("No se detectó el servidor de impresión. ¿Iniciaste el script de Python?")
    }
  },

  async imprimirBoleta(boletaData) {
    try {
      console.log("Datos recibidos para impresión:", boletaData)
      const payload = {
        folio: boletaData.id,
        // Concatenamos ID y Nombre como aparece en el ticket
        cliente: `${boletaData.cliente_id} ${boletaData.cliente.nombre}`,
        fecha: boletaData.fecha_boleta,
        // Importante: Enviar el vencimiento formateado (ej: 26-mar-2026)
        vencimiento: boletaData.fecha_vencimiento,
        total: boletaData.total_pagar,
        // Metadata adicional para el pie de página
        caja: "CAJA 01",
        cajero: boletaData.user.name,
        fecha_impresion: boletaData.fecha_impresion_formateada,
        header_custom: ["PRESTAMO EXPRESS", "MATRIZ"],
      };

      console.log("Payload a enviar al puente de impresión:", payload)

      await axios.post('http://localhost:5000/print_ticket_tradicional', payload);
    } catch (error) {
      console.error("Error de impresión:", error);
    }
  },

  async imprimirTicketRefrendo(ticketdata) {
    const authStore = useAuthStore()
    const fechaActual = new Date().toLocaleString('es-MX', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })

    // Construir el payload esperado por Python
    const payload = {
      logo_url: null,
      empresa: {
        nombre: 'PRESTAMO EXPRESS',
        sucursal: 'MATRIZ',
      },
      boleta: ticketdata.folio || 'S/F',
      numero_refrendo: ticketdata.no_pago || 'N/A',
      proximo_vencimiento: ticketdata.fecha_vencimiento || 'N/A',
      dias: ticketdata.dias || 'N/A',
      pago_facil: ticketdata.pago_facil || [],

      fecha: fechaActual,
      cajero: authStore.user?.name || 'Sistema',
      cliente_id: ticketdata.cliente_id || '000',
      cliente_nombre: ticketdata.cliente_nombre || 'PÚBLICO GENERAL',
      bolsa: ticketdata.no_bolsa || 'N/A',
      total_pagado: ticketdata.total_pagado || 0,
      footer_custom: '¡Gracias por su pago!'
    }

    try {
      // Enviamos a la nueva ruta en el puerto 5000 (Python)
      const response = await axios.post('http://localhost:5000/print-refrendo', payload)
      return response.data
    } catch (error) {
      console.error("Error al imprimir refrendo:", error)
      throw new Error(error.response?.data?.message || 'Error de comunicación con la impresora térmica.')
    }
  },

  /**
   * Imprime el comprobante secundario de Bonificación por Pago Anticipado
   */
  async imprimirTicketBonificacion(ticketdata) {

    const authStore = useAuthStore()

    const fechaActual = new Date().toLocaleString('es-MX', {
         day: '2-digit', month: 'short', year: 'numeric',
         hour: '2-digit', minute: '2-digit'
    })

    const total_bonificacion = ticketdata.bonificacion || 0;
    // Cálculos para extraer el subtotal e IVA de la bonificación (Asumiendo IVA 16%)
    const subtotal = total_bonificacion / 1.16;
    const iva = total_bonificacion - subtotal;

    const payload = {
      logo_url: null,
      empresa: {
        nombre: 'PRESTAMO EXPRESS',
        sucursal: 'MATRIZ',
      },
      boleta: ticketdata.folio_contrato || '0000',
      numero_refrendo: ticketdata.numero_refrendo || '1',
      cliente_id: ticketdata.cliente?.id || '000',
      cliente_nombre: ticketdata.cliente?.nombre || 'PÚBLICO GENERAL',

      // Montos calculados
      subtotal: subtotal,
      iva: iva,
      total_bonificacion: total_bonificacion,

      cajero: authStore.user?.name || 'ADMINISTRADOR',
      fecha: fechaActual
    }

    try {
      await axios.post('http://localhost:5000/print-bonificacion', payload)
    } catch (error) {
      console.error("Error al imprimir bonificación:", error)
    }
  },

  /**
   * Imprime un comprobante de liquidación / desempeño
   */
  async imprimirTicketLiquidacion(ticketdata) {
    const authStore = useAuthStore()

    // Formatear la fecha igual que en el refrendo (Ej: 25-feb-2026 17:45)
    const fechaActual = new Date().toLocaleString('es-MX', {
         day: '2-digit', month: 'short', year: 'numeric',
         hour: '2-digit', minute: '2-digit'
    })



    const payload = {
      logo_url: null,
      empresa: {
        nombre: 'PRESTAMO EXPRESS',
        sucursal: 'MATRIZ',
      },
      // Datos de la Liquidación
      boleta: ticketdata.folio_contrato || '0000',

      // Datos del Cliente y Bolsa
      cliente_id: ticketdata.cliente?.id || '000',
      cliente_nombre: ticketdata.cliente?.nombre || 'PÚBLICO GENERAL',
      bolsa: ticketdata.no_bolsa || 'N/A',
      numero_refrendo: ticketdata.numero_refrendo || '1',

      // Totales
      total_pagado: ticketdata.total_pagado || 0,
      recibido: ticketdata.recibido || 0,
      cambio: ticketdata.cambio || 0,
      bonificacion: ticketdata.bonificacion || 0,

      cajero: authStore.user?.name || 'ADMINISTRADOR',
      fecha: fechaActual
    }

    try {
      const response = await axios.post('http://localhost:5000/print-liquidacion', payload)
      return response.data
    } catch (error) {
      console.error("Error al imprimir liquidación:", error)
      throw new Error(error.response?.data?.message || 'Error de comunicación con la impresora térmica.')
    }
  }
}
