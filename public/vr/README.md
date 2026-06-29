# Assets temporales del recorrido VR

Los PNG dentro de `public/vr/renders/` son placeholders 2:1 para probar la navegacion. Sustituyelos por renders equirectangulares 360 reales en `.webp`, `.jpg` o `.png` y actualiza el campo `panorama` de cada nodo en `public/vr/data/tour.json`.

Para agregar un nodo nuevo, crea su render en `public/vr/renders/`, agrega un objeto a `nodes` en `tour.json` y enlazalo desde otro nodo con un hotspot `type: "navigation"` y `target` igual al `id` del nodo nuevo.
