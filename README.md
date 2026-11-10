# taridepaco.github.io

Portada personal: una isla 3D en píxeles donde cada proyecto es un habitante, más un cuaderno de
investigaciones de datos y un formulario de contacto. Sitio estático, sin build: GitHub Pages sirve
la rama `main` tal cual.

## Añadir contenido

Todo el contenido está en [`js/data.js`](js/data.js):

- **Un número del cuaderno de datos**: una entrada nueva al principio de `notebook`
  (`n`, `date` como `AAAA-MM`, `title`, `url`, `desc` en `es` y `en`).
- **Un proyecto en la isla**: una entrada en `projects` con su `id`, posición `at` y textos.
  Sin `url` se muestra como "En camino". Si `js/island.js` no tiene una figura para ese `id`,
  aparece un cartel genérico; para darle figura propia se añade una función a `BUILD` en ese archivo.
- **Textos de la página**: en `text.es` y `text.en`.

## Sistema de diseño común

[`css/system.css`](css/system.css) contiene los colores, tipografías y piezas (botones, etiquetas,
cajas, selector de idioma, formularios) pensados para todas las páginas de proyecto. No depende de
nada más de este repositorio: para usarlo en otro, se copia el archivo y se enlaza junto a las
fuentes que indica su cabecera. `css/landing.css` es solo de esta portada.

## Estructura

```
index.html
css/system.css     sistema común (portable)
css/landing.css    maquetación de la portada
js/data.js         contenido
js/island.js       la isla (three.js)
js/main.js         idioma, tarjeta, cuaderno y formulario
js/vendor/         three.js r128 (MIT)
```

Para verlo en local basta con abrir `index.html` o servir la carpeta, por ejemplo con
`python3 -m http.server`.

La versión anterior (la landing en formato currículum) está en la rama `archive/v1-curriculum`.
