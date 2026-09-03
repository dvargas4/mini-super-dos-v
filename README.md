# Catálogo de Mini Súper Dos V

Sitio independiente conectado al catálogo semanal de Google Sheets. El código se publica una sola vez. Después, los cambios cotidianos se hacen directamente en la hoja y aparecen en la página al abrirla o, si ya está abierta, en un máximo de cinco minutos.

## Publicarlo en GitHub Pages

No necesitas instalar programas ni modificar el código.

1. Entra a [github.com/new](https://github.com/new) e inicia sesión.
2. Escribe un nombre para el repositorio, por ejemplo `mini-super-dos-v`.
3. Selecciona `Public` y crea el repositorio sin agregar README, licencia ni `.gitignore`.
4. Descomprime el archivo ZIP de este proyecto.
5. En el repositorio, selecciona `Add file` y después `Upload files`.
6. Arrastra todos los archivos y la carpeta `assets` que están dentro de `Mini-Super-Dos-V-GitHub`. El archivo `index.html` debe quedar en la raíz del repositorio, no dentro de otra carpeta.
7. Escribe un mensaje como `Publicar catálogo` y confirma con `Commit changes`.
8. Entra a `Settings`, abre `Pages` y busca `Build and deployment`.
9. En `Source`, elige `Deploy from a branch`.
10. Selecciona la rama `main`, la carpeta `/(root)` y presiona `Save`.

GitHub mostrará la dirección pública cuando termine. Normalmente tendrá esta estructura:

```text
https://TU-USUARIO.github.io/mini-super-dos-v/
```

La página publicada no depende de ChatGPT. Para cambiar diseño o funciones, reemplaza en GitHub los archivos modificados y confirma otro `Commit changes`. Para cambiar precios, nombres, fotos o formas de venta, edita únicamente el Google Sheets conectado.

## Archivos incluidos

- `index.html`: estructura de la página.
- `styles.css`: colores, tamaños y diseño adaptable.
- `app.js`: catálogo, carrito, formulario y pedido por WhatsApp.
- `catalog.js`: conexión con Google Sheets, WhatsApp y configuración de la tienda.
- `photos.js`: fotografías de respaldo.
- `assets/logo.jpg`: logotipo circular de Mini Súper Dos V.
- `.nojekyll`: indica a GitHub Pages que publique los archivos directamente.

## Hoja conectada

La conexión ya está configurada en `catalog.js` con la hoja de Mini Súper Dos V.

Si al subir el Excel Google creó una hoja nueva con una dirección diferente, abre `catalog.js` y sustituye el valor de `googleSheetCsvUrl` por el enlace compartido de esa nueva hoja. Si importaste el archivo dentro de la hoja original y conservaste su misma dirección, no tienes que cambiar nada.

La página utiliza estas columnas:

| Columna | Contenido | Qué ocurre en la página |
| --- | --- | --- |
| A | Nombre del producto | Crea la tarjeta del producto |
| H | Precio de venta | Muestra el precio semanal con la unidad indicada en J |
| I | URL de la foto | Sustituye la fotografía de respaldo |
| J | Forma de venta | Controla si se vende por pieza, peso o de ambas formas |
| K, opcional | Categoría | Permite clasificar productos nuevos |
| L, opcional | Activo | `No` oculta el producto sin borrar la fila |

No cambies el orden de A, H, I y J. Los encabezados recomendados son `NOMBRE`, `PRECIO DE VENTA * KG`, `URL DE FOTO DE PRODUCTO` y `FORMA DE VENTA`.

## Cambiar precios

Edita el valor de la columna H. Puedes escribir solamente un número, por ejemplo `25`. Si en J aparece `PZ`, se mostrará como `$25.00 / pz`; con `PESO` o `AMBOS`, se mostrará como `$25.00 / kg`.

Todos los precios aparecen con la leyenda `PRECIO SEMANAL`. La página no altera el importe ni lo convierte a medio kilo.

## Forma de venta

Escribe una de estas opciones en la columna J:

- `PZ`: únicamente permite pedir piezas completas y anuncia el precio por pieza.
- `PESO`: permite pedir en gramos o kilogramos y anuncia el precio por kg.
- `AMBOS`: permite elegir entre pieza, gramos o kilogramos.

Si la columna J queda vacía, la página conserva el funcionamiento general con `PZ`, `G` y `KG`. Sandía y Sandía baby ya están configuradas como `PZ`, incluso mientras sus celdas de la columna J permanezcan vacías.

## Agregar, quitar o renombrar productos

- Para agregar un producto, escribe su nombre en una nueva fila de la columna A.
- Para quitarlo, borra el nombre de la columna A o elimina la fila completa.
- Para ocultarlo temporalmente, escribe `No` en la columna L.
- Para renombrarlo, cambia el texto de la columna A.
- Los productos conocidos conservan su categoría. Los nuevos aparecen en `Otros`, salvo que escribas una categoría en la columna K.

La tarjeta y cualquier copia antigua de ese producto en el carrito se eliminan en la siguiente actualización.

## Fotografías

La página incluye fotografías reales de respaldo. Las imágenes se muestran únicamente dentro del catálogo: no tienen enlaces, no redirigen a otra página y no muestran el nombre del autor. Para usar una foto propia o reemplazar una imagen:

1. Sube la fotografía a un lugar público.
2. Copia su enlace directo que empiece con `https://`.
3. Pégalo en la columna I de la fila correspondiente.

Si la celda está vacía o el enlace deja de funcionar, la página usa la fotografía de respaldo o un ícono del producto.

## Orden del catálogo

Las categorías aparecen en este orden: frutas; verduras y hierbas; chiles y pimientos; quesos y refrigerados; semillas, granos y secos; abarrotes y condimentos; otros.

Dentro de cada categoría, los productos se muestran alfabéticamente de la A a la Z. El buscador encuentra productos en todo el catálogo.

## Pedidos

Al presionar `Agregar al carrito`, el cliente elige primero la cantidad, la unidad (`KG`, `G` o `PZ`) y una nota opcional sobre color, tamaño, madurez o presentación. Después de agregarlo, la tarjeta muestra un resumen compacto con las opciones `Editar` y `🗑 Eliminar`. También puede agregar un producto que no aparezca en la lista.

Antes de abrir WhatsApp se solicitan nombre completo, dirección, referencia y forma de pago. El mensaje queda preparado con todos los datos y productos. El pedido debe confirmarse vía WhatsApp.

Las formas de pago disponibles son transferencia, tarjeta y efectivo.

En el último paso aparece la lista final. El cliente puede cambiar cantidades, elegir `PZ`, `G` o `KG`, modificar notas, quitar productos y volver al catálogo para agregar otro antes de enviar.

La entrega es el sábado, a más tardar a las 11:30 a. m.

## WhatsApp de la tienda

El número de WhatsApp ya está configurado en `catalog.js` con el código de país de México:

```js
whatsapp: "522206477892",
```

## Seguridad de Google Sheets

La página solo necesita permiso de lectura. Después de terminar la configuración, cambia el acceso general de la hoja de `Editor` a `Lector`. Tú seguirás pudiendo editarla desde tu cuenta, pero una persona con el enlace no podrá cambiar precios ni borrar productos.
