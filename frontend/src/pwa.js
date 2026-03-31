import { registerSW } from 'virtual:pwa-register';

// Solo registrar SW si existe y estamos en producción o forzado
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('SW registrado con éxito:', registration.scope);
      })
      .catch((error) => {
        console.error('Error al registrar el SW:', error);
      });
  });
}
