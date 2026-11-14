# Organik Collabs · venta de entradas con QR

## Cómo funciona
1. El cliente entra a la **tienda** (`index.html`), elige la tanda abierta, completa sus datos y paga por transferencia.
2. Su pedido queda guardado como **Pendiente** en Firebase. Los datos del cliente solo los puede ver el panel.
3. Vos revisás que la plata entró y, en el **panel** (`/admin/`), tocás **Marcar PAGADO y enviar entradas**. El panel crea las entradas (`DNI_0`, `DNI_1`...) y manda el mail desde organikxperience@gmail.com con un QR por entrada.
4. En la puerta, la **app de control** (`/control/`) escanea cada QR. Cada entrada se puede usar una sola vez.

## Carpetas
```
index.html            tienda de entradas (pública)
config.js             ÚNICO archivo que se edita: Firebase, WhatsApp, links de pago, tandas y precios
admin/index.html      panel de ventas (login con Google)
control/index.html    app de la puerta (celular)
assets/logo-organik.png
firestore.rules       reglas de seguridad (se pegan en la consola de Firebase)
apps-script/enviar-entradas.gs   script de correo (se pega en script.google.com, NO queda con la clave real en GitHub)
```

## Puesta en marcha (una sola vez)

### A. Firebase (proyecto nuevo, recomendado)
1. console.firebase.google.com > Agregar proyecto > `organik-collabs` (sin Analytics).
2. Firestore Database > Crear base de datos > **modo producción**, ubicación `southamerica-east1`.
3. Pestaña **Reglas** > pegá el contenido de `firestore.rules` > Publicar. Revisá que los dos mails de `esAdmin()` sean los correctos.
4. Authentication > Comenzar > Método de acceso > **Google** > Habilitar > Guardar. En Configuración > **Dominios autorizados** agregá `marianoncrz.github.io`.
5. Configuración del proyecto (engranaje) > Tus apps > `</>` Web > registrá la app y copiá el `firebaseConfig` en `config.js`.

### B. Correo (con la cuenta organikxperience@gmail.com)
1. Entrá a script.google.com con esa cuenta > Nuevo proyecto > pegá `enviar-entradas.gs`.
2. Cambiá `CLAVE` (y `WHATSAPP` cuando pasen al número real).
3. Implementar > Nueva implementación > Aplicación web > Ejecutar como **Yo** > Acceso **Cualquier usuario** > autorizá.
4. Copiá la URL `/exec` en `config.js` (`emailScriptUrl`). La clave se escribe después en el panel, sección "Envío de emails".

### C. config.js
Ya tiene el alias y el WhatsApp de prueba. Cuando pasen a los reales, cambiá `whatsapp` y `transferencia` (alias, titular, CBU) y revisá las tandas.

### D. GitHub Pages
Subí todo al repo > Settings > Pages > Deploy from a branch > `main` / `(root)`.
Direcciones: `https://marianoncrz.github.io/Organik_Collabs/` (tienda), `/admin/` y `/control/`.

## Prueba general (antes de vender)
1. La tienda solo muestra tandas abiertas. Para probar antes del 17/11, cambiá en `config.js` el `desde` de SuperEarly a una fecha pasada y el `hasta` a una futura. Después volvé a dejarlo como estaba.
2. Comprá 2 entradas con tu correo > en `/admin/` tocá **Marcar PAGADO** > llegan 2 QR al mail.
3. En `/control/` escaneá los dos QR (verde) y uno de nuevo (amarillo).
4. Borrá los pedidos y entradas de prueba desde la consola de Firebase.

## Notas
- Solo se cobra por transferencia: el cliente transfiere, manda el comprobante por WhatsApp y vos tildás PAGADO en el panel cuando la plata entró.
- Eliminá del repo el archivo `qr_sents.json` si contiene la clave del script anterior.
