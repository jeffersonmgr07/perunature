# Peru Nature - actualización estructural inspirada en MyCuzcoTrip

## Cambios principales

- Header actualizado: se retiró “Inicio” y se agregó navegación orientada a venta: Destinos, Paquetes, Tours, Estilos de viaje, Mi reserva e Iniciar sesión o registrarse.
- Se añadió selector de idioma ES / EN en el header, como primera capa multidioma.
- Footer reestructurado para parecerse al patrón de MyCuzcoTrip: bloque de marca, caja de contacto, acordeones por secciones, destinos, centro de ayuda, legales, métodos de pago y redes.
- Home actualizado con textos para cliente final. Se retiraron referencias internas a desarrollo, base de datos o conexión futura.
- Los textos principales de “Explora Perú” se configuraron para mostrarse en una sola línea en desktop y adaptarse en móvil.
- Product page: galería superior reducida para no ocupar tanta pantalla.
- Product page: panel lateral de reserva renovado con fecha, horario, adultos, niños, cupón, resumen de precio y botón de reserva por WhatsApp.
- Cupón demo activo: PERUNATURE10 aplica 10% de descuento en el cálculo estimado.
- Se corrigió la carga dinámica de header/footer en product.html, que antes usaba IDs distintos.
- Se agregaron páginas base para evitar enlaces rotos: mi-reserva.html, login.html y quote-packages.html.

## Archivos clave modificados

- components/header.html
- components/footer.html
- index.html
- product.html
- all-experiences.html
- documentary-tours.html
- assets/js/app.js
- assets/js/i18n.js
- assets/js/pages/product.js
- assets/css/header.css
- assets/css/footer.css
- assets/css/layout.css
- assets/css/product-page.css

## Nota

Esta es una primera capa multidioma para interfaz estática y componentes comunes. La siguiente fase recomendada es traducir el catálogo JSON de tours/paquetes y hacer que product/listing rendericen contenido según idioma seleccionado.
