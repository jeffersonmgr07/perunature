# Videos de experiencias · Perú Nature

Guarda los videos en esta carpeta (`assets/videos/`) en formato MP4, preferentemente codificados con H.264 y audio AAC para Safari, Chrome y Android.

El video de Huancaya se encuentra en `huancaya-nor-yauyos.mp4`.

Para añadir un video a cualquier otra experiencia, abre su ficha en `assets/data/tours.json` o `assets/data/tours-peru-catalog.json` y agrega junto al `slug`:

```json
"video": "./assets/videos/nombre-del-tour.mp4"
```

El botón «Ver video» aparecerá en esa ficha al detectar la ruta. Si el tour no tiene un video asignado, el botón permanece oculto para no ofrecer un enlace roto.

Usa únicamente videos para los que tienes autorización de publicación.
