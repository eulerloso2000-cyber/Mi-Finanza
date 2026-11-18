MI FINANZA - PRIMERA VERSION

CONTENIDO
- index.html: pantalla principal
- styles.css: diseño adaptable a celular y computadora
- app.js: registro de movimientos, presupuesto y ahorro
- manifest.webmanifest y sw.js: instalación PWA y uso offline
- icon.svg: icono de la aplicación

COMO ABRIR EN COMPUTADORA
1. Extrae el ZIP en una carpeta.
2. Para probar rápidamente, abre index.html en un navegador moderno.
3. Para instalar como PWA y habilitar el modo offline, publica la carpeta en un hosting HTTPS estático (por ejemplo, GitHub Pages) o ejecútala con un servidor local. El service worker no funciona al abrir directamente file://.

COMO ABRIR EN ANDROID
1. Publica la carpeta en una dirección HTTPS.
2. Abre esa dirección en Chrome en Android.
3. Abre el menú de Chrome y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".

IMPORTANTE SOBRE LOS DATOS
- Esta versión guarda datos localmente en el navegador/dispositivo.
- No existe todavía sincronización automática entre Android y computadora.
- Usa "Copias de seguridad" para exportar un JSON en un dispositivo e importarlo en el otro.
- No guardes claves bancarias, números de tarjeta ni información altamente sensible.
- Conserva copias de seguridad en un lugar privado.

DATOS INICIALES
- Ingreso mensual previsto: S/ 1,550
- Distribución de pago prevista: 40% (S/ 620) y 60% (S/ 930), editable.
- Gastos conocidos: alimentación S/ 200, transporte S/ 100, deudas S/ 180.
- Alquiler, estudios, apoyo familiar y otros gastos quedan pendientes de confirmar.
- Meta de ahorro: S/ 35,000.

La aplicación no realiza movimientos bancarios ni verifica depósitos. Registra manualmente importes reales.
