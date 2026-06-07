# Peru Nature — Reservas, login, hoteles y PayPal

## 1. Archivos principales modificados

- `product.html`
- `assets/js/pages/product.js`
- `assets/data/package-hotels.json`
- `assets/data/tours-peru-catalog.json`
- `assets/js/pages/all-experiences.js`
- `components/header.html`
- `assets/js/app.js`
- `assets/js/i18n.js`
- `assets/css/auth.css`
- `login.html`
- `registro.html`
- `perfil.html`
- `mi-reserva.html`
- `assets/js/pages/customer-auth.js`
- `assets/js/pages/profile.js`
- `assets/js/pages/mi-reserva.js`
- `apps-script/perunature-reservations.gs`

## 2. Flujo de clientes

El login y el registro ahora están separados:

- `login.html`: solo inicio de sesión.
- `registro.html`: solo creación de cuenta.
- `perfil.html`: página privada básica del cliente con datos y reservas asociadas a su correo.
- `mi-reserva.html`: búsqueda pública de travel voucher por código de reserva + apellido, sin iniciar sesión.

En el header, **Ver mi reserva** envía al login si el cliente no ha iniciado sesión. Si ya inició sesión, lo lleva a `perfil.html`.

## 3. Código de reserva

El código se genera con este formato:

```text
PNAT + fecha/hora en hexadecimal
```

Ejemplo:

```text
PNATD3F1C0A2
```

## 4. Hoteles por destino

El archivo `assets/data/package-hotels.json` contiene una base de 3 hoteles por destino:

- Básico
- Intermedio
- Comfort

Los nombres y tarifas son referenciales. Luego puedes reemplazar cada destino con hoteles reales contratados.

## 5. Configurar PayPal frontend

En `product.html`, reemplaza:

```html
client-id=sb
```

por tu Client ID real de PayPal:

```html
client-id=TU_CLIENT_ID_REAL
```

El **Client ID** puede ir en HTML. El **Client Secret** nunca debe ir en HTML.

## 6. Configurar Apps Script

1. Crea una hoja de cálculo en Google Sheets.
2. Copia el ID de la hoja.
3. Abre `apps-script/perunature-reservations.gs`.
4. Reemplaza:

```js
const SPREADSHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';
```

por el ID de tu Google Sheet.

5. En Apps Script, entra a **Project Settings > Script Properties** y agrega:

```text
PAYPAL_CLIENT_ID = tu_client_id
PAYPAL_CLIENT_SECRET = tu_secret_id
PAYPAL_ENV = sandbox
```

Para producción usa:

```text
PAYPAL_ENV = live
```

6. Publica como Web App:

```text
Deploy > New deployment > Web app
Execute as: Me
Who has access: Anyone
```

7. Copia la URL `/exec` y pégala en estos archivos:

```html
<script>
  window.PN_APPS_SCRIPT_URL = "TU_URL_WEB_APP";
</script>
```

Debes pegarla en:

- `product.html`
- `login.html`
- `registro.html`
- `perfil.html`
- `mi-reserva.html`

## 7. Hojas que se crean automáticamente

El Apps Script crea estas hojas:

- `Reservations`
- `Passengers`
- `Customers`
- `Sessions`
- `Coupons`

## 8. Cupones

En la hoja `Coupons`, usa estas columnas:

```text
code | percent | expiresAt | active
```

Ejemplo:

```text
PN10 | 10 | 2026-12-31 | TRUE
```

## 9. Nota sobre sesiones

Al iniciar sesión o registrarse, Apps Script genera un token temporal y lo guarda en la hoja `Sessions`. El navegador guarda los datos públicos del cliente en `localStorage` para precargar el titular en una reserva.

Esta es una base práctica para GitHub Pages + Apps Script. Más adelante, si quieres manejo avanzado de sesiones, recuperación de contraseña, correo de confirmación o seguridad más robusta, conviene pasar el backend a Node.js, Cloudflare Worker, Vercel Functions o Render.

## 10. Nota sobre PayPal + Apps Script

La versión incluida mantiene el botón PayPal funcionando con el SDK del navegador y deja preparada la creación/captura server-side con Apps Script. Si el navegador bloquea lectura de respuestas por CORS en Apps Script, el sistema cae al flujo normal del SDK y guarda la reserva con `no-cors`.
