import { boot } from 'quasar/wrappers'

export default boot(() => {
  // En lugar de una directiva, usamos un event listener global en document.
  // Esto asegura que funcione en cualquier pantalla, sin importar si usa <q-form> o no.
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      const target = e.target;
      
      // Solo nos interesa si el usuario está escribiendo en un input o select
      if (target.tagName !== 'INPUT' && target.tagName !== 'SELECT') return;

      // Ignorar si es textarea (para saltos de línea) o si el desarrollador puso explícitamente "no-enter"
      if (
        target.tagName.toLowerCase() === 'textarea' || 
        target.classList.contains('no-enter') ||
        target.closest('.no-enter')
      ) {
        return;
      }

      e.preventDefault();

      // Buscar el contenedor lógico más cercano (formulario, tarjeta, modal o simplemente toda la página)
      const container = target.closest('form, .q-card, .q-dialog, .page-container') || document.body;
      
      // Obtener todos los elementos interactivos dentro de ese contenedor
      const focusable = container.querySelectorAll('input:not([type="hidden"]):not([disabled]):not([readonly]), select:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), button[type="submit"], button.btn-next');
      const elements = Array.from(focusable).filter(el => el.tabIndex !== -1);
      
      const index = elements.indexOf(target);
      if (index > -1 && index < elements.length - 1) {
        elements[index + 1].focus();
      }
    }
  });
})
