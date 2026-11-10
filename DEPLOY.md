# Despliegue

La portada es una web estática. `deploy/build.sh` la construye en `dist/`, y ese mismo `dist/` se publica en todos los sitios:

| Dónde | URL | Cómo se actualiza |
|---|---|---|
| GitHub Pages | https://taridepaco.github.io/ | Solo, con cada push a `main` (`.github/workflows/pages.yml`). |
| Servidor propio | `taridepaco.com.es` (por decidir, aún sin publicar) | A mano: `deploy/build.sh && sudo deploy/install.sh`. |

`deploy/build.sh`, `deploy/install.sh` y `.github/workflows/pages.yml` son comunes a todas las webs de taridepaco. Son los originales: el resto de webs los copian de aquí.

## Construir

```sh
deploy/build.sh                                   # web/ → dist/
python3 -m http.server 8000 --directory dist      # para probar el resultado
```

`dist/` no se sube a git. Todo salvo `index.html` va en `v/<hash>/`, un directorio con el nombre del contenido, e `index.html` apunta ahí. Con cada cambio cambian las URLs, así que ninguna caché mezcla dos versiones: GitHub Pages guarda los ficheros 10 minutos y Cloudflare guarda CSS y JS durante horas.

Todas las rutas son relativas, así que `dist/` funciona igual en la raíz de un dominio que bajo una subruta.

## GitHub Pages

- En cada PR, el workflow construye la web pero no la publica.
- En cada push a `main`, o a mano desde *Actions → Pages → Run workflow*, además publica `dist/`.
- Si falla la construcción, no se publica nada.

Configuración, una sola vez: *Settings → Pages → Build and deployment → Source: GitHub Actions*.

## Servidor propio (túnel de Cloudflare en WSL)

```
Navegador ── HTTPS ── Cloudflare ── túnel ──► cloudflared (WSL) ──► http://localhost:8006
                                                                    python3 -m http.server en 127.0.0.1
```

- **Servicio:** `deploy/portada.service`. Usuario de sistema `portada` y aislamiento de systemd.
- **Ficheros servidos:** `/opt/portada`, una copia de `dist/`. Son de root y el servicio solo puede leerlos.
- **Puerto:** `8006`, solo en `127.0.0.1`.

### Instalar o actualizar

Desde WSL, en la raíz del repo:

```sh
git pull
deploy/build.sh && sudo deploy/install.sh
```

`install.sh` crea el usuario y la unidad la primera vez. Después solo sustituye los ficheros y reinicia el servicio.

### Primera vez: túnel y DNS

Sustituye `<túnel>` por el nombre de tu túnel (`cloudflared tunnel list`).

1. Comprueba que el puerto está libre con `ss -ltn | grep ':8006 ' || echo libre`. Si está ocupado, elige otro y cámbialo en `deploy/portada.service` y en la entrada del túnel.
2. Añade la entrada en `/etc/cloudflared/config.yml` **antes** de la regla 404, sin tocar las demás:

   ```yaml
   ingress:
     # ...tus otras entradas...
     - hostname: taridepaco.com.es
       service: http://localhost:8006
     - service: http_status:404
   ```

3. Valida, crea el DNS (como tu usuario, sin sudo) y reinicia el túnel:

   ```sh
   cloudflared tunnel ingress validate --config /etc/cloudflared/config.yml
   cloudflared tunnel route dns <túnel> taridepaco.com.es
   sudo systemctl restart cloudflared
   curl -sI https://taridepaco.com.es/ | head -1
   ```

### Retirar

1. Quita la entrada `portada` de `/etc/cloudflared/config.yml` y ejecuta `sudo systemctl restart cloudflared`.
2. `sudo systemctl disable --now portada && sudo rm /etc/systemd/system/portada.service`
3. `sudo rm -rf /opt/portada && sudo userdel portada`
4. Borra el registro DNS de `taridepaco.com.es` en el panel de Cloudflare.

Los scripts de `deploy/` se quedan en el repo: sirven para volver a instalarlo en esta u otra máquina.
