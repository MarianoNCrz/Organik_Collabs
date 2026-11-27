/**
 * Email automático de "pedido registrado" (se envía apenas el cliente aprieta Comprar).
 * Va en el MISMO proyecto de Apps Script que enviar-entradas.gs (archivo nuevo "registro").
 *
 * 1) En enviar-entradas.gs, dentro de doPost, justo DESPUÉS de la línea  var d = JSON.parse(...);  agregá:
 *        if (d.accion === "registro") return registroPedido_(d);
 * 2) Completá abajo ALIAS, TITULAR y CBU (los mismos de config.js).
 * 3) Nueva versión del despliegue (Implementar > Administrar implementaciones > editar > Nueva versión).
 *
 * Seguridad: esta función es pública (la página no tiene clave), por eso:
 *  - el texto del mail es FIJO; la página solo aporta nombre, código, cantidad, tanda y correo (validados);
 *  - el monto se calcula acá con PRECIOS, no se toma de la página;
 *  - un mail por pedido, máx. 3 por correo por día, y NUNCA gasta la reserva diaria de mails
 *    para las entradas con QR (RESERVA_QR).
 */
var REG = {
  ALIAS: "COMPLETAR",
  TITULAR: "",
  CBU: "",
  WEB: "https://venisalbosqueorganik.netlify.app/",
  TERMINOS: "https://venisalbosqueorganik.netlify.app/terminos.html",
  PRECIOS: { SuperEarly: 10000, Early1: 15000, Tanda1: 20000, Tanda2: 25000 },
  RESERVA_QR: 30,        // mails que siempre quedan libres para enviar los QR
  MAX_POR_CORREO: 3
};

function registroPedido_(d) {
  try {
    var id = String(d.id || ""), correo = String(d.correo || "").trim().toLowerCase();
    var cant = parseInt(d.cantidad, 10), precio = REG.PRECIOS[d.tanda];
    if (!/^OC-[A-Z2-9]{6}$/.test(id) || !/^[^@\s]{1,64}@[^@\s]{1,120}\.[^@\s]{2,}$/.test(correo) || !(cant >= 1 && cant <= 10) || !precio)
      return salida_({ ok: false, error: "datos inválidos" });
    var nombre = String(d.nombre || "").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]/g, "").replace(/\s+/g, " ").trim().slice(0, 40) || "";
    var P = PropertiesService.getScriptProperties(), hoy = Utilities.formatDate(new Date(), "America/Argentina/Tucuman", "yyyyMMdd");
    if (P.getProperty("reg:" + id)) return salida_({ ok: true, duplicado: true });
    if (MailApp.getRemainingDailyQuota() <= REG.RESERVA_QR) return salida_({ ok: false, error: "cupo diario reservado" });
    var kc = "regc:" + hoy + ":" + correo, n = parseInt(P.getProperty(kc) || "0", 10);
    if (n >= REG.MAX_POR_CORREO) return salida_({ ok: false, error: "límite por correo" });
    P.setProperty("reg:" + id, hoy); P.setProperty(kc, String(n + 1));

    var total = precio * cant, $ = function (x) { return "$" + String(x).replace(/\B(?=(\d{3})+(?!\d))/g, "."); };
    var msg = "Hola! Te envío el comprobante de mi compra " + id + ". " + nombre + " · " + cant + " × " + d.tanda + " · Total " + $(total);
    var wa = WHATSAPP + "?text=" + encodeURIComponent(msg);
    var H = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var html = "<div style='font-family:Arial,sans-serif;max-width:520px;color:#111'>" +
      "<img src='" + LOGO_URL + "' alt='Organik' height='34' style='display:block;background:#0b130d;padding:10px 14px;margin-bottom:14px'>" +
      "<p>Hola" + (nombre ? " " + H(nombre) : "") + "! Registramos tu pedido para <b>" + EVENTO + "</b> · " + FECHA + ".</p>" +
      "<div style='border:2px solid #e0a500;background:#fff7e0;padding:12px 14px;margin:14px 0'><b>Tu pedido está PENDIENTE.</b> Todavía no es una entrada: se confirma cuando verifiquemos tu pago.</div>" +
      "<p><b>Código de pedido:</b> " + id + "<br><b>Entradas:</b> " + cant + " × " + H(d.tanda) + "<br><b>Total a transferir:</b> " + $(total) + "</p>" +
      "<p><b>Datos para transferir</b><br>Alias: <b>" + H(REG.ALIAS) + "</b>" + (REG.TITULAR ? "<br>Titular: " + H(REG.TITULAR) : "") + (REG.CBU ? "<br>CBU: " + H(REG.CBU) : "") + "</p>" +
      "<p><b>Qué tenés que hacer (en las próximas 48 horas):</b></p><ol style='padding-left:20px'>" +
      "<li>Transferí " + $(total) + " al alias indicado.</li>" +
      "<li>Enviá el comprobante por WhatsApp con tu código de pedido.</li></ol>" +
      "<p><a href='" + wa + "' style='display:inline-block;background:#8fd14f;color:#0b130d;font-weight:bold;text-decoration:none;padding:14px 22px'>Enviar comprobante por WhatsApp</a></p>" +
      "<p style='font-size:13px;color:#444'>Verificamos los pagos de 10 a 23 hs. Te enviamos las entradas con su código QR por correo dentro de las 12 horas del pago. " +
      "Si pasadas las 48 horas no recibimos el pago, el pedido se cancela y podés volver a comprar otra entrada. " +
      "Si no te llegan nuestros correos, revisá spam y Promociones.</p>" +
      "<p style='font-size:13px'><a href='" + REG.TERMINOS + "'>Términos y Condiciones</a> · <a href='" + INSTAGRAM + "'>Instagram</a> · <a href='" + WHATSAPP + "'>WhatsApp</a></p></div>";
    MailApp.sendEmail({ to: correo, subject: "Organik Collabs · Pedido " + id + " registrado (pendiente de pago)", name: EVENTO,
      body: "Registramos tu pedido " + id + " (PENDIENTE). Transferí " + $(total) + " al alias " + REG.ALIAS + " y enviá el comprobante por WhatsApp dentro de las 48 horas: " + wa,
      htmlBody: html });
    return salida_({ ok: true });
  } catch (e) { return salida_({ ok: false, error: String(e) }); }
}
