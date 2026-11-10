# taridepaco.github.io

Portada personal: una isla 3D en píxeles donde cada proyecto es un habitante, más un cuaderno de
investigaciones de datos y un formulario de contacto. Sitio estático en `web/`, sin dependencias:
`deploy/build.sh` lo construye en `dist/`, que es lo que se publica (ver [DEPLOY.md](DEPLOY.md)).

## Añadir contenido

Todo el contenido está en [`web/js/data.js`](web/js/data.js):

- **Un número del cuaderno de datos**: una entrada nueva al principio de `notebook`
  (`n`, `date` como `AAAA-MM`, `title`, `url`, `desc` en `es` y `en`).
- **Un proyecto en la isla**: una entrada en `projects` con su `id`, posición `at` y textos.
  Sin `url` se muestra como "En camino". Si `web/js/island.js` no tiene una figura para ese `id`,
  aparece un cartel genérico; para darle figura propia se añade una función a `BUILD` en ese archivo.
- **Textos de la página**: en `text.es` y `text.en`.

## Sistema de diseño común

[`web/css/system.css`](web/css/system.css) contiene los colores, tipografías y piezas (botones,
etiquetas, cajas, selector de idioma, formularios) pensados para todas las páginas de proyecto, con
paleta clara y oscura. [`web/js/theme.js`](web/js/theme.js) gestiona el tema: sigue al sistema por
defecto y guarda la elección manual (auto, claro u oscuro). Ninguno de los dos depende de nada más de
este repositorio: para usarlos en otro, se copian los archivos y se enlazan junto a las fuentes que
indica la cabecera del CSS. `web/css/landing.css` es solo de esta portada.

## Despliegue común

Todas las webs de taridepaco se publican igual, y los ficheros que lo hacen salen de aquí, como el
sistema de diseño:

| Fichero | Qué hace |
|---|---|
| [`deploy/build.sh`](deploy/build.sh) | Construye `web/` en `dist/`, con todo salvo `index.html` en `v/<hash>/` para que ninguna caché mezcle versiones. |
| [`deploy/install.sh`](deploy/install.sh) | Instala `dist/` en una máquina: lo copia a `/opt/<nombre>` y activa `deploy/<nombre>.service`. |
| [`.github/workflows/pages.yml`](.github/workflows/pages.yml) | En las PR pasa `deploy/test.sh` (si existe) y `deploy/build.sh`; en `main`, además publica `dist/` en GitHub Pages. |

Cada proyecto los copia sin cambios y pone lo suyo:

- la web en `web/`, con rutas relativas (un proyecto con compilación, como anter, tiene su propio
  `deploy/build.sh`, que también deja el resultado en `dist/`);
- `deploy/<nombre>.service`, la unidad de systemd con su nombre y su puerto;
- `deploy/test.sh`, si tiene pruebas que deben pasar antes de publicar;
- `dist/` en `.gitignore`;
- en GitHub, *Settings → Pages → Source: GitHub Actions*.

Puertos en el servidor propio: Boider 8002, GameOfLifer (`lifer`) 8003, Prey 8004, Anter 8005,
esta portada 8006, MusicTopicEvolution (`music`) 8007.

## Estructura

```
web/index.html
web/css/system.css     sistema común (portable)
web/css/landing.css    maquetación de la portada
web/js/data.js         contenido
web/js/theme.js        tema claro/oscuro (portable)
web/js/island.js       la isla (three.js)
web/js/main.js         idioma, tarjeta, cuaderno y formulario
web/js/vendor/         three.js r128 (MIT)
deploy/                construcción, instalación y unidad de systemd (comunes salvo la unidad)
.github/workflows/     publicación en GitHub Pages (común)
```

Para verlo en local basta con abrir `web/index.html` o servir la carpeta, por ejemplo con
`python3 -m http.server --directory web`.

La versión anterior (la landing en formato currículum) está en la rama `archive/v1-curriculum`.
