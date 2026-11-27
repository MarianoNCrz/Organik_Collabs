/**
 * Organik Collabs · envío de entradas por email.
 * Se pega en script.google.com ENTRANDO CON organikxperience@gmail.com (de esa cuenta salen los mails).
 * NO se sube a GitHub con la clave real.
 *
 * 1. Cambiá CLAVE por una frase larga inventada por vos.
 * 2. Implementar > Nueva implementación > tipo "Aplicación web"
 *      Ejecutar como: Yo   |   Quién tiene acceso: Cualquier usuario
 * 3. Autorizá los permisos y copiá la URL /exec en config.js (emailScriptUrl).
 * 4. La clave se escribe una vez en el panel de ventas (Envío de emails).
 */
var CLAVE     = "CAMBIAR-ESTA-CLAVE";
var REMITENTE = "Organik Collabs";
var EVENTO    = "Organik Collabs";
var FECHA     = "Sábado 02 de Enero del 2027";
var LOGO_URL  = "https://marianoncrz.github.io/Organik_Collabs/assets/logo-organik.png";
var INSTAGRAM = "https://instagram.com/organik.music";
var WHATSAPP  = "https://wa.me/5493814666911";   // mismo número que en config.js

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.accion === "registro") return registroPedido_(d);   // email automático de pedido registrado (registro.gs)
    if (d.clave !== CLAVE) return salida_({ ok: false, error: "Clave incorrecta" });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email || "")) return salida_({ ok: false, error: "Email inválido: " + d.email });
    var qrs = d.qrs || [];
    if (!qrs.length || qrs.length > 10) return salida_({ ok: false, error: "Cantidad de QR inválida" });
    if (MailApp.getRemainingDailyQuota() < 1) return salida_({ ok: false, error: "Se agotó el límite diario de Google" });

    var uno = qrs.length === 1, inline = {}, blobs = [], imgs = "";
    qrs.forEach(function (q, i) {
      var b = Utilities.newBlob(Utilities.base64Decode(q.png), "image/png", "Organik_entrada_" + (i + 1) + ".png");
      blobs.push(b); inline["qr" + i] = b;
      imgs += "<div style='margin:0 0 18px'>" + (uno ? "" : "<p style='margin:0 0 6px;color:#8fd14f'><b>Entrada " + (i + 1) + " de " + qrs.length + "</b></p>") +
        "<img src='cid:qr" + i + "' width='220' height='220' alt='QR de ingreso' style='display:block;background:#fff'></div>";
    });

    var html = "<div style='font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#0f1a12;color:#f6f1e4;padding:32px;border-radius:12px'>" +
      "<h1 style='font-weight:300;font-size:26px;margin:0 0 16px'>Hola " + esc_(d.nombre) + "!</h1>" +
      "<p>Recibiste " + (uno ? "tu entrada" : "tus entradas") + " para <b>" + EVENTO + "</b> " + FECHA + ".</p>" +
      imgs +
      "<p>Recordá llevar tu DNI y el código QR para el ingreso.</p>" +
      "<p>" + (uno ? "Te esperamos." : "Los esperamos.") + "</p>" +
      "<p style='margin:28px 0 10px'><img src='" + LOGO_URL + "' width='160' alt='Organik'></p>" +
      "<p style='color:#a9b3a3;font-size:13px'>Recordá: si tenés alguna duda, podés comunicarte a cualquiera de nuestros canales habilitados:<br>" +
      "<a href='" + INSTAGRAM + "' style='color:#8fd14f'>Instagram</a> · <a href='" + WHATSAPP + "' style='color:#8fd14f'>WhatsApp</a></p></div>";

    MailApp.sendEmail({
      to: d.email,
      subject: (uno ? "Tu entrada" : "Tus entradas") + " para " + EVENTO + " · 2 de enero",
      body: "Hola " + d.nombre + "! Te adjuntamos " + (uno ? "tu entrada" : "tus entradas") + " con su código QR. Recordá llevar tu DNI.",
      htmlBody: html, name: REMITENTE, attachments: blobs, inlineImages: inline
    });
    return salida_({ ok: true, restante: MailApp.getRemainingDailyQuota() });
  } catch (err) { return salida_({ ok: false, error: String(err) }); }
}

function doGet() { return salida_({ ok: true, mensaje: "Envío de entradas activo", cuenta: Session.getEffectiveUser().getEmail(), restante: MailApp.getRemainingDailyQuota(), finanzas: (typeof estadoFinanzas_ === "function" ? estadoFinanzas_() : null) }); }
function salida_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function esc_(s) { return String(s || "").replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
