# Peru Nature – Actualización Huaraz 4D/3N

## Archivos modificados
- `assets/data/tours-peru-catalog.json`
  - Se dejó Huaraz con tres paquetes 4D/3N:
    1. `santa-cruz-trek-parque-nacional-huascaran-4-dias-3-noches`
    2. `huaraz-clasico-caminatas-cortas-4-dias-3-noches`
    3. `huaraz-lagunas-trekking-laguna-69-4-dias-3-noches`
  - Se retiró el paquete duplicado antiguo `santa-cruz-trek-4-dias-cordillera-blanca` para que no aparezcan dos Santa Cruz casi iguales al filtrar Huaraz.
  - Los itinerarios ahora tienen detalles por día, notas, comidas referenciales y distancias/caminatas referenciales.

- `assets/data/package-hotels.json`
  - Nuevo JSON de hoteles por destino.
  - Contiene opciones referenciales para Huaraz con tarifas por habitación/noche:
    - Hotel estándar céntrico
    - Hotel comfort vista montaña
    - Hotel boutique andino

- `product.html`
  - El botón principal cambió de “Reservar por WhatsApp” a “Iniciar reserva”.
  - Se agregó modal de reserva con fecha, horario, pasajeros, hotel, habitaciones, resumen, PayPal, WhatsApp e impresión.
  - Se agregó SDK de PayPal en modo sandbox con `client-id=sb`. Para producción reemplazarlo por el Client ID real.

- `assets/js/pages/product.js`
  - Nueva lógica de reserva con código `OP-NAT-XXXXXX-XXXX`.
  - Cálculo de adultos, niños, hotel, combinaciones de habitaciones y total.
  - Render dinámico de PayPal Buttons.
  - Impresión de itinerario con formato tipo cotización.

- `assets/css/product-page.css`
  - Estilos adicionales para modal, hoteles, habitaciones, pasajeros, PayPal e impresión visual.
  - No se cambiaron los estilos existentes de cards, colores ni estructura del catálogo.

## Imágenes sugeridas para subir
Subir las imágenes dentro de `assets/img/tours/` con estos nombres para que los nuevos paquetes se vean completos:

- `huaraz-clasico-caminatas-cortas-cover.jpg`
- `huaraz-llanganuco-img1.jpg`
- `huaraz-pastoruri-img1.jpg`
- `huaraz-chavin-img1.jpg`
- `huaraz-laguna-69-paquete-cover.jpg`
- `laguna-69-img1.jpg`
- `llanganuco-yungay-img1.jpg`
- `pastoruri-img1.jpg`
- `santa-cruz-trek-parque-nacional-huascaran-4-dias-3-noches-cover.jpg`
- `santa-cruz-trek-img1.jpg`
- `santa-cruz-trek-img2.jpg`
- `santa-cruz-trek-img3.jpg`

Si una imagen no existe, el sistema usa `tour-placeholder.jpg` automáticamente.

## Pendientes para producción
- Cambiar `client-id=sb` por el Client ID real de PayPal.
- Validar tarifas base, ingresos al Parque Nacional Huascarán y hoteles con operador local antes de publicar tarifa final.
- Si se desea guardar reservas reales, conectar el modal a Google Apps Script, Sheets, Supabase o backend.
