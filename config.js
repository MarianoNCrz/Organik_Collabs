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
  whatsapp: "5493814666911",            // WhatsApp de Organik (prueba): 549 + código de área + número, sin + ni espacios
  transferencia: { alias: "ORGANIK.ACCESOS", titular: "Sofia Soledad ALDERETE", cbu: "1430001713040589640019" },   // alias de prueba; titular y CBU se muestran si los completás
    maxPorPersona: 10,
  cierreWeb: "2027-01-01T00:00:00-03:00",
  puerta: { precio: 30000 },
  tandas: [
    { id: "SuperEarly", nombre: "SuperEarly", precio: 10000, desde: "2026-11-18T21:00:00-03:00", hasta: "2026-11-22T23:59:59.999-03:00" },
    { id: "Early1",     nombre: "Early tanda 1",   precio: 15000, desde: "2026-11-23T00:00:00-03:00", hasta: "2026-11-29T23:59:59.999-03:00" },
    { id: "Tanda1",     nombre: "Entrada tanda 1", precio: 20000, desde: "2026-11-30T00:00:00-03:00", hasta: "2026-12-13T23:59:59.999-03:00" },
    { id: "Tanda2",     nombre: "Entrada tanda 2", precio: 25000, desde: "2026-12-14T00:00:00-03:00", hasta: "2026-12-31T23:59:59.999-03:00" }
  ]
};
