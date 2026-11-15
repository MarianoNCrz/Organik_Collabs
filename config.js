// ORGANIK COLLABS · configuración única. Todo lo que cambia (fechas, precios, números) se edita SOLO acá.
window.ORGANIK = {
  // Datos del proyecto Firebase (consola > Configuración del proyecto > Tus apps > Web)
  firebase: {
    apiKey: "AIzaSyBkA35LdyAlxXUNmq0KDrketpWERm11j8c",
    authDomain: "organik-collabs.firebaseapp.com",
    projectId: "organik-collabs",
    storageBucket: "organik-collabs.firebasestorage.app",
    messagingSenderId: "237359301179",
    appId: "1:237359301179:web:b4ddb1877548acc1a6921e"
  },
  emailScriptUrl: "https://script.google.com/macros/s/AKfycbxMe3IKvRXhI64qXOPtCOIB0on8fXWjAFG283cb60BA5mBq2aEfgJdg5BoHWWsHCqcB/exec",          // URL /exec del script de envío (cuenta organikxperience@gmail.com)
  whatsapp: "5493812081005",            // WhatsApp de Organik (prueba): 549 + código de área + número, sin + ni espacios
  transferencia: { alias: "ORGANIK.ACCESOS", titular: "Sofia Soledad ALDERETE", cbu: "1430001713040589640019" },   // alias de prueba; titular y CBU se muestran si los completás
  maxPorPersona: 10,
  // Horarios de Argentina (-03:00). La tienda solo muestra las tandas abiertas en este momento.
  tandas: [
    { id: "SuperEarly", nombre: "SuperEarly",       precio: 5000,  desde: "2026-11-14T00:00:00-03:00", hasta: "2026-11-15T23:59:59-03:00" },   // VENTANA DE PRUEBA: volver a 17/11 12:00 → 17/11 23:59:59
    { id: "Early1",     nombre: "Early tanda 1",    precio: 7500,  desde: "2026-11-24T12:00:00-03:00", hasta: "2026-11-24T23:59:59-03:00" },
    { id: "Early2",     nombre: "Early tanda 2",    precio: 10000, desde: "2026-12-01T12:00:00-03:00", hasta: "2026-12-01T23:59:59-03:00" },
    { id: "Tanda1",     nombre: "Entrada tanda 1",  precio: 15000, desde: "2026-12-05T12:00:00-03:00", hasta: "2026-12-12T23:59:59-03:00" },
    { id: "Tanda2",     nombre: "Entrada tanda 2",  precio: 20000, desde: "2026-12-14T12:00:00-03:00", hasta: "2027-01-02T12:00:00-03:00" }
  ]
};
