# Peru Nature – Actualización de reservas y SEO

Incluye únicamente los archivos modificados respecto de la última actualización entregada el 5 de noviembre. Subirlos manteniendo las rutas del ZIP.

## PayPal (requiere configuración manual)
El archivo original utilizaba `client-id=sb`, el identificador de Sandbox. Por seguridad se ha retirado.
1. En PayPal Developer, obtén el **Client ID LIVE** de tu aplicación Business.
2. En `assets/js/paypal-config.js`, asigna ese valor a `window.PN_PAYPAL_CLIENT_ID`.
3. **NO actives `PN_PAYPAL_PAYMENTS_ENABLED` todavía.** Antes debes implementar en el backend la creación y captura de órdenes y verificar importe, moneda, estado `COMPLETED`, destinatario y que la orden no haya sido utilizada, consultando PayPal desde el servidor.
4. Una vez superadas pruebas de extremo a extremo, cambiar `window.PN_PAYPAL_PAYMENTS_ENABLED = true`.
5. Nunca pongas el Client Secret en HTML, JavaScript público, GitHub Pages ni un repositorio público.

La interfaz mostrará "Pago online temporalmente no disponible" mientras el sistema esté desactivado; las consultas por WhatsApp siguen disponibles.

## Países
`assets/data/countries.json` contiene 249 países/territorios ISO y sus prefijos telefónicos. Los nombres se traducen mediante `Intl.DisplayNames` según el idioma activo. El sitio tiene selector ES/EN; el componente admite FR/PT y otros idiomas si se añaden al selector del sitio. Algunos territorios comparten prefijos. Los prefijos de destinos especiales deben confirmarse antes de comercialización.

## Imagen del Libro de Reclamaciones
No se recibió como archivo independiente el PNG exacto mencionado; se incluye un **emblema provisional original** `assets/img/libro-reclamaciones.png`. Puedes sustituirlo por tu PNG conservando el mismo nombre sin cambiar código.

## Redes y SEO
El index ya tenía OG image (`assets/img/hero-1.jpg`, 1537x1023). Se mantienen metadatos de compartir y se actualizan títulos y descripciones del index y catálogo. Las URLs dinámicas `product.html?slug=` aún requieren pre-renderizado HTML específico para garantizar tarjetas Open Graph por tour en WhatsApp y Facebook, que no siempre ejecutan JavaScript. El posicionamiento orgánico no es automático: también depende de indexación, rendimiento, contenido y enlaces.
