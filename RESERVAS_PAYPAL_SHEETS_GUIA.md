# Peru Nature: PayPal, reservas y cupones

## PayPal

En `product.html` busca esta línea:

```html
<script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD&components=buttons" data-namespace="paypal"></script>
```

Cambia `client-id=sb` por tu Client ID real de PayPal. Ejemplo:

```html
<script src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID_REAL&currency=USD&components=buttons" data-namespace="paypal"></script>
```

Para pruebas puedes usar Sandbox. Para cobrar de verdad, usa el Client ID de Live/Producción.

## Reservas en Google Sheets

1. Crea una hoja de Google Sheets.
2. Crea estas pestañas: `Reservations`, `Passengers`, `Coupons`.
3. Abre `Extensiones > Apps Script`.
4. Copia el archivo `apps-script/perunature-reservations.gs`.
5. Cambia `SPREADSHEET_ID` por el ID de tu Google Sheet.
6. Publica como Web App.
7. Copia la URL del Web App.
8. En `assets/js/pages/product.js`, busca:

```js
this.reservationEndpoint = "";
```

Y coloca:

```js
this.reservationEndpoint = "TU_URL_WEB_APP";
this.couponEndpoint = "TU_URL_WEB_APP";
```

Con eso, cuando PayPal apruebe el pago, se enviará la reserva a Google Sheets. Si también llenas `couponEndpoint`, el cupón se validará contra la pestaña `Coupons` de Google Sheets.

## Cupones

Ahora existe `assets/data/coupons.json` como sistema simple local. Puedes editar códigos, porcentajes y fecha de caducidad.

Estructura:

```json
{
  "code": "HUARAZ15",
  "percent": 15,
  "expiresAt": "2026-09-30",
  "active": true
}
```

Si `couponEndpoint` está vacío, la web usa `coupons.json`. Si `couponEndpoint` tiene la URL del Web App, intenta validar primero contra la pestaña `Coupons` de Google Sheets y usa el JSON como respaldo.
