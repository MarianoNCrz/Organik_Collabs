/**
 * Organik Collabs · conexión con la app de finanzas.
 * Va en el MISMO proyecto de Apps Script que enviar-entradas.gs (+ > Secuencia de comandos, nombre "finanzas").
 *
 * Cada minuto lee las entradas de Firestore (lectura pública) y le avisa a finanzas:
 *   venta online (al marcar PAGADO) · venta en puerta · ingreso · invitado · anulación.
 * La clave de finanzas queda en las "Propiedades del script" y NUNCA va al repo.
 *
 * PASOS (una sola vez):
 *  1. Completá PROJECT_ID (el mismo projectId de config.js).
 *  2. Configuración del proyecto (engranaje) > Propiedades del script > Agregar:
 *       ORGANIK_TICKETS_KEY = la clave que te dio finanzas (opk_...)
 *  3. Ejecutá  probarFinanzas  (tiene que decir "OK 200"). No carga nada.
 *  4. Cuando estén listos para vender de verdad, agregá la propiedad  FINANZAS_ACTIVO = si
 *     y ejecutá  instalarSincronizacion  (crea el aviso automático cada minuto).
 *  Para pausar todo: borrá FINANZAS_ACTIVO o poné "no".
 */
var FIN = {
  URL: "https://organik-collabs.vercel.app/api/puerta/tickets",
  PROJECT_ID: "COMPLETAR",
  API_KEY: "",   // opcional: la apiKey de config.js, solo si Firestore pide clave
  // Solo para entradas viejas que no tengan guardado el precio:
  PRECIOS: { SuperEarly: 10000, Early1: 15000, Tanda1: 20000, Tanda2: 25000 }
};

function sincronizarFinanzas(simular) {
  simular = (simular === true);   // el disparador automático pasa un evento: solo vale "true" explícito
  var P = PropertiesService.getScriptProperties();
  if (!simular && P.getProperty("FINANZAS_ACTIVO") !== "si") return;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) return;
  try {
    var key = P.getProperty("ORGANIK_TICKETS_KEY");
    if (!key) { P.setProperty("fin_res", "Falta ORGANIK_TICKETS_KEY"); return; }
    var docs = leerEntradas_();
    var todas = P.getProperties(), estado = {};
    Object.keys(todas).forEach(function (k) {
      if (k.indexOf("t:") === 0) { var p = todas[k].split(":"); estado[k.slice(2)] = { g: parseInt(p[0], 10) || 0, f: p[1] || "" }; }
    });
    var ventas = [], otros = [], nuevo = {};   // nuevo[id] = {g,f} a guardar si el envío sale ok
    var vistos = {};
    docs.forEach(function (d) {
      var id = d.id, f = d.f; vistos[id] = true;
      var st = estado[id] || { g: 0, f: "" };
      if (st.f.indexOf("a") >= 0) st = { g: st.g + 1, f: "" };   // el id se reutilizó después de anular
      var tk = st.g ? id + "~" + st.g : id;
      var hora = new Date().toISOString();
      if (f.origen === "puerta") {
        if (st.f.indexOf("v") < 0) ventas.push({ ev: { tipo: "venta", ticket: tk, monto: String(f.precio || 0), medio: medio_(f.medio), entro: true, hora: f.creado || hora }, id: id, st: st, add: "vi" });
      } else if (f.origen === "invitado") {
        if (f.ingreso && st.f.indexOf("g") < 0) otros.push({ ev: { tipo: "invitado", ticket: tk, hora: hora }, id: id, st: st, add: "g" });
      } else {
        var monto = f.precio || FIN.PRECIOS[f.tanda];
        if (st.f.indexOf("v") < 0) {
          if (!monto) { P.setProperty("fin_res", "Sin precio para " + id + " (tanda " + f.tanda + ")"); return; }
          ventas.push({ ev: { tipo: "venta", ticket: tk, monto: String(monto), medio: medio_(f.medio || "Transferencia"), hora: f.creado || hora }, id: id, st: st, add: "v" });
        }
        if (f.ingreso && st.f.indexOf("i") < 0) otros.push({ ev: { tipo: "ingreso", ticket: tk, hora: hora }, id: id, st: st, add: "i" });
      }
    });
    // anulaciones: estaba informado y ya no existe
    var anul = [], ids = Object.keys(estado);
    ids.forEach(function (id) {
      var st = estado[id];
      if (!vistos[id] && st.f.indexOf("a") < 0 && (st.f.indexOf("v") >= 0 || st.f.indexOf("g") >= 0))
        anul.push({ ev: { tipo: "anular", ticket: st.g ? id + "~" + st.g : id, motivo: "Anulada en el panel" }, id: id, st: st, add: "a" });
    });
    if (docs.length === 0 && anul.length > 3) { P.setProperty("fin_res", "Pausado: Firestore vacío y habría " + anul.length + " anulaciones. Revisá."); return; }
    if (anul.length > 40) { P.setProperty("fin_res", "Pausado: demasiadas anulaciones (" + anul.length + "). Revisá."); return; }

    var cola = ventas.concat(otros, anul), enviados = 0, errores = [], guardar = {};
    if (simular) {   // SIMULACRO: muestra qué se enviaría, sin enviar ni guardar nada
      var tot = 0, nv = 0; ventas.forEach(function (x) { tot += parseInt(x.ev.monto, 10) || 0; nv++; });
      var resu = "SIMULACRO: " + nv + " ventas por $" + tot + " · " + otros.length + " ingresos/invitados · " + anul.length + " anulaciones";
      Logger.log(resu); cola.slice(0, 15).forEach(function (x) { Logger.log(JSON.stringify(x.ev)); });
      if (cola.length > 15) Logger.log("... y " + (cola.length - 15) + " más");
      return resu;
    }
    for (var i = 0; i < cola.length; i += 400) {
      var lote = cola.slice(i, i + 400);
      var r = UrlFetchApp.fetch(FIN.URL, { method: "post", contentType: "application/json", muteHttpExceptions: true,
        headers: { Authorization: "Bearer " + key }, payload: JSON.stringify({ eventos: lote.map(function (x) { return x.ev; }) }) });
      var code = r.getResponseCode();
      if (code === 401) { P.setProperty("fin_res", "CLAVE INVÁLIDA o revocada (401). Pedí una nueva a finanzas."); P.setProperty("FINANZAS_ACTIVO", "no"); return; }
      if (code === 409) { P.setProperty("fin_res", "El evento está cerrado en finanzas (409)."); return; }
      if (code !== 200) { P.setProperty("fin_res", "Finanzas respondió " + code + ". Reintenta solo."); return; }
      var j = JSON.parse(r.getContentText());
      (j.resultados || []).forEach(function (x, k) {
        var it = lote[k];
        if (x.estado === "ok" || x.estado === "duplicado") {
          var cur = guardar[it.id] || { g: it.st.g, f: it.add === "a" ? it.st.f : it.st.f };
          cur.f = it.add === "a" ? cur.f + "a" : cur.f + it.add; if (it.add === "a") cur.g = it.st.g;
          guardar[it.id] = cur; enviados++;
        } else errores.push(it.ev.tipo + " " + it.ev.ticket + ": " + (x.detalle || "error"));
      });
    }
    var props = {};
    Object.keys(guardar).forEach(function (id) { props["t:" + id] = guardar[id].g + ":" + guardar[id].f; });
    if (Object.keys(props).length) P.setProperties(props);
    P.setProperty("fin_ultimo", new Date().toISOString());
    P.setProperty("fin_res", errores.length ? ("Con avisos: " + errores.slice(0, 3).join(" | ")) : ("OK · " + enviados + " enviados"));
  } catch (e) {
    PropertiesService.getScriptProperties().setProperty("fin_res", "Error: " + e);
  } finally { lock.releaseLock(); }
}

function leerEntradas_() {
  var out = [], tok = "";
  do {
    var url = "https://firestore.googleapis.com/v1/projects/" + FIN.PROJECT_ID + "/databases/(default)/documents/entradas?pageSize=300" +
      (tok ? "&pageToken=" + encodeURIComponent(tok) : "") + (FIN.API_KEY ? "&key=" + FIN.API_KEY : "");
    var r = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) throw new Error("Firestore " + r.getResponseCode() + " " + r.getContentText().slice(0, 120));
    var j = JSON.parse(r.getContentText()); tok = j.nextPageToken || "";
    (j.documents || []).forEach(function (d) {
      var f = {}; Object.keys(d.fields || {}).forEach(function (k) {
        var v = d.fields[k]; f[k] = v.stringValue !== undefined ? v.stringValue : v.integerValue !== undefined ? Number(v.integerValue) :
          v.doubleValue !== undefined ? v.doubleValue : v.booleanValue !== undefined ? v.booleanValue : v.timestampValue !== undefined ? v.timestampValue : null;
      });
      out.push({ id: d.name.split("/").pop(), f: f });
    });
  } while (tok);
  return out;
}

function medio_(m) { m = String(m || "").toLowerCase(); return m.indexOf("efectivo") >= 0 ? "efectivo" : m.indexOf("mercado") >= 0 ? "mercado_pago" : "transferencia"; }

// ---- utilidades para ejecutar a mano desde el editor ----
function probarFinanzas() {
  var key = PropertiesService.getScriptProperties().getProperty("ORGANIK_TICKETS_KEY");
  if (!key) { Logger.log("Falta la propiedad ORGANIK_TICKETS_KEY"); return; }
  var r = UrlFetchApp.fetch(FIN.URL, { method: "post", contentType: "application/json", muteHttpExceptions: true,
    headers: { Authorization: "Bearer " + key }, payload: JSON.stringify({ eventos: [] }) });
  Logger.log((r.getResponseCode() === 200 ? "OK " : "FALLÓ ") + r.getResponseCode() + " " + r.getContentText());
}
function simularFinanzas() {   // ejecutalo ANTES de activar: no envía nada, solo muestra qué se mandaría
  Logger.log(sincronizarFinanzas(true));
}
function instalarSincronizacion() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "sincronizarFinanzas") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("sincronizarFinanzas").timeBased().everyMinutes(1).create();
  Logger.log("Listo: se sincroniza cada minuto (si FINANZAS_ACTIVO = si).");
}
function reiniciarEstadoFinanzas() {   // SOLO si borraron todo para empezar de cero
  var P = PropertiesService.getScriptProperties(), a = P.getProperties();
  Object.keys(a).forEach(function (k) { if (k.indexOf("t:") === 0) P.deleteProperty(k); });
  Logger.log("Estado borrado.");
}
function estadoFinanzas_() {
  var P = PropertiesService.getScriptProperties();
  return { activo: P.getProperty("FINANZAS_ACTIVO") === "si", ultimo: P.getProperty("fin_ultimo") || "", resultado: P.getProperty("fin_res") || "" };
}
