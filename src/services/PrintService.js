import axios from 'axios'

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
  }
}
