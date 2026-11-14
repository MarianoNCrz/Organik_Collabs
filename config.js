// ORGANIK COLLABS · configuración única. Todo lo que cambia (fechas, precios, números) se edita SOLO acá.
window.ORGANIK = {
  // Datos del proyecto Firebase (consola > Configuración del proyecto > Tus apps > Web)
  firebase: {
    apiKey: "COMPLETAR",
    authDomain: "COMPLETAR.firebaseapp.com",
    projectId: "COMPLETAR",
    storageBucket: "COMPLETAR.firebasestorage.app",
    messagingSenderId: "COMPLETAR",
    appId: "COMPLETAR"
  },
  emailScriptUrl: "COMPLETAR",          // URL /exec del script de envío (cuenta organikxperience@gmail.com)
  whatsapp: "5493816129812",            // WhatsApp de Organik (prueba): 549 + código de área + número, sin + ni espacios
  transferencia: { alias: "organik.collabs", titular: "", cbu: "" },   // alias de prueba; titular y CBU se muestran si los completás
  maxPorPersona: 10,
  // Horarios de Argentina (-03:00). La tienda solo muestra las tandas abiertas en este momento.
  tandas: [
    { id: "SuperEarly", nombre: "SuperEarly",       precio: 5000,  desde: "2026-11-17T12:00:00-03:00", hasta: "2026-11-17T23:59:59-03:00" },
    { id: "Early1",     nombre: "Early tanda 1",    precio: 7500,  desde: "2026-11-24T12:00:00-03:00", hasta: "2026-11-24T23:59:59-03:00" },
    { id: "Early2",     nombre: "Early tanda 2",    precio: 10000, desde: "2026-12-01T12:00:00-03:00", hasta: "2026-12-01T23:59:59-03:00" },
    { id: "Tanda1",     nombre: "Entrada tanda 1",  precio: 15000, desde: "2026-12-05T12:00:00-03:00", hasta: "2026-12-12T23:59:59-03:00" },
    { id: "Tanda2",     nombre: "Entrada tanda 2",  precio: 20000, desde: "2026-12-14T12:00:00-03:00", hasta: "2027-01-02T12:00:00-03:00" }
  ]
};
