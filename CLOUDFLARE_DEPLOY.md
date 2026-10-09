# Publicar la web de Elyndra en Cloudflare (guía paso a paso)

Guía para alguien que nunca ha usado Cloudflare. Revisada contra la documentación oficial de
Cloudflare el **8 de octubre de 2026**. Los menús del panel cambian a menudo: si un botón tiene
otro nombre, busca el más parecido; los conceptos son los mismos.

## 0. Qué ruta usamos y por qué

Cloudflare tiene dos productos para webs estáticas:

- **Cloudflare Pages**: el de siempre. Sigue funcionando y tiene soporte, pero ya no recibe las
  novedades.
- **Workers con static assets** (archivos estáticos servidos por un Worker): es lo que Cloudflare
  **recomienda hoy para proyectos nuevos**. Despliega desde GitHub con *Workers Builds*, admite
  `_headers`, `_redirects` y una página `404.html`, y si algún día la web necesita algo dinámico, se
  añade en el mismo proyecto.

**Usamos Workers con static assets.** El proyecto ya trae todo lo necesario:

| Archivo | Para qué |
|---|---|
| `wrangler.jsonc` | Nombre del Worker (`elyndra-website`), carpeta `dist`, 404 propia, barras finales automáticas |
| `.nvmrc` | Node 24 (Cloudflare lo lee solo) |
| `dist/_headers` | Lo genera el build: cabeceras de seguridad (CSP, HSTS…) y caché |
| `public/_redirects` | `/favicon.ico` → el icono PNG |
| `404.html` | Página "Señal perdida" con estado 404 |

Datos que vas a necesitar:

| Ajuste | Valor |
|---|---|
| Comando de build | `npm run build` |
| Comando de despliegue | `npx wrangler deploy` |
| Comando para ramas que no son la principal | `npx wrangler versions upload` |
| Carpeta raíz (root directory) | vacía (o `/`) |
| Carpeta de salida | `dist` (ya está en `wrangler.jsonc`, no se escribe en el panel) |
| Versión de Node | 24 (por `.nvmrc`; si hiciera falta, variable `NODE_VERSION` = `24`) |
| Variable de build | `SITE_URL` = la dirección pública de la web, sin barra final |

---

## 1. Sacar la carpeta de OneDrive

La web ya no está dentro del proyecto de la app: vive en
`C:\Users\jefer\OneDrive\Mac\REPOSITORIOS\Elyndra-website`, pero **sigue dentro de OneDrive**.
Conviene moverla a una carpeta normal (OneDrive bloquea y sincroniza miles de archivos de
`node_modules` y ralentiza todo).

> **Importante: `assets-src/` (y dentro, `assets-src/video/`) NO está en git.** Ahí están los
> originales: capturas del dispositivo, archivos de marca y las grabaciones en bruto (unos 27 MB).
> Git y Cloudflare no los necesitan (la web usa lo que ya está en `public/img/` y `public/video/`),
> pero **sin ellos no se pueden regenerar** las imágenes (`npm run assets`) ni los vídeos
> (`npm run video`). Por eso:
>
> - **Se copian a mano**: el `robocopy` de abajo los incluye; un `git clone` **no** los trae.
> - **Guarda una copia de seguridad** de `assets-src/` (disco externo o una carpeta en la nube)
>   antes de borrar nada.

1. Cierra VS Code y cualquier terminal abierta en esa carpeta.
2. Abre **PowerShell** y copia la carpeta a `C:\dev\Elyndra-website`, **sin** `node_modules`,
   `dist` ni `.wrangler` (se regeneran). Esto **sí** copia `assets-src/` con sus vídeos:

   ```powershell
   New-Item -ItemType Directory -Force C:\dev | Out-Null
   robocopy "C:\Users\jefer\OneDrive\Mac\REPOSITORIOS\Elyndra-website" "C:\dev\Elyndra-website" /E /XD node_modules dist .wrangler
   ```

   (`robocopy` termina con un código 1 cuando copia bien; no es un error.) Comprueba que
   `C:\dev\Elyndra-website\assets-src\video` tiene `intro.mp4`, `masha.mp4` y `wheel.mp4`.
3. Comprueba que la copia funciona:

   ```powershell
   cd C:\dev\Elyndra-website
   npm ci
   npm run build
   npm run preview
   ```

   Abre <http://localhost:4173>. Si se ve bien, sigue.
4. Cuando la copia funcione **y tengas la copia de seguridad de `assets-src/`**, borra la carpeta
   antigua de OneDrive (desde el Explorador o con
   `Remove-Item -Recurse -Force "C:\Users\jefer\OneDrive\Mac\REPOSITORIOS\Elyndra-website"`).

> Si ya tienes Node 24 instalado, perfecto. Si no: instala la versión LTS desde
> <https://nodejs.org> (o con `nvm-windows`: `nvm install 24` y `nvm use 24`).

---

## 2. Crear el repositorio en GitHub y subir el primer commit

### 2.1 Crear el repositorio vacío

1. Entra en <https://github.com/new>.
2. **Owner**: `jefer02`. **Repository name**: `Elyndra-website` (o el que prefieras).
3. Público o privado, como quieras (Cloudflare funciona con los dos).
4. **No** marques "Add a README", ni `.gitignore`, ni licencia: el proyecto ya los trae.
5. **Create repository**.

### 2.2 Primer commit y subida (lo haces tú)

En PowerShell, dentro de `C:\dev\Elyndra-website`:

```powershell
git init -b main
git add .
git status          # revisa: no debe aparecer node_modules, dist, .env ni assets-src
git commit -m "Elyndra website: first version"
git remote add origin https://github.com/jefer02/Elyndra-website.git
git push -u origin main
```

Alternativa con la CLI de GitHub (crea el repo y sube en un paso, después del commit):
`gh repo create jefer02/Elyndra-website --public --source . --push`

---

## 3. Crear la cuenta de Cloudflare

1. Ve a <https://dash.cloudflare.com/sign-up>, regístrate con tu correo y verifícalo.
2. No hace falta añadir ningún dominio ni tarjeta para empezar: el plan **Free** de Workers basta
   para esta web (los archivos estáticos no cuentan como peticiones de Worker de pago).

---

## 4. Conectar el repositorio (Workers Builds)

1. En el panel de Cloudflare, menú lateral: **Workers & Pages** (en algunas cuentas está dentro de
   **Compute**).
2. **Create application** (o **Create**).
3. En la pestaña **Workers**, elige **Import a repository** (importar un repositorio).
4. **Connect GitHub** (o "GitHub" → autorizar). Se abre GitHub para instalar la app
   **Cloudflare Workers and Pages**. Elige **Only select repositories** y marca solo
   `Elyndra-website`. Acepta.
5. De vuelta en Cloudflare, selecciona el repositorio `jefer02/Elyndra-website`.
6. Configura el proyecto:

   | Campo | Valor |
   |---|---|
   | **Project name** (nombre del Worker) | `elyndra-website` ← **tiene que coincidir** con `"name"` de `wrangler.jsonc` |
   | **Production branch** | `main` |
   | **Build command** | `npm run build` |
   | **Deploy command** | `npx wrangler deploy` |
   | **Non-production branch deploy command** | `npx wrangler versions upload` |
   | **Root directory / Path** | vacío |

7. Abre **Advanced settings → Build variables** (variables de build) y añade:

   | Nombre | Valor |
   |---|---|
   | `SITE_URL` | de momento déjalo vacío o pon `https://elyndra-website.TU-SUBDOMINIO.workers.dev` si ya conoces tu subdominio (lo verás en el paso 5) |

   (No hace falta `NODE_VERSION`: el proyecto trae `.nvmrc` con 24.)
8. **Deploy** / **Save and Deploy**.

---

## 5. Primer despliegue y tu dirección `workers.dev`

1. Cloudflare clona el repo, instala dependencias, ejecuta `npm run build` y luego
   `npx wrangler deploy`. Puedes ver el registro en la pestaña **Deployments** / **Builds**
   (tarda 1–2 minutos).
2. En el registro verás, entre otras, estas líneas, que son normales:
   - `[snapshot] 1 release(s) saved, newest v…` → guardó la lista de versiones de reserva.
   - `SITE_URL is not set…` → aviso si aún no pusiste la variable.
   - La tabla de presupuesto de tamaño con todo en ✓.
3. Al terminar, la web está en:

   **`https://elyndra-website.<tu-subdominio>.workers.dev`**

   El subdominio de tu cuenta aparece en **Workers & Pages** (a la derecha, "Your subdomain"); se
   puede cambiar con **Change**.
4. Ahora pon esa dirección en la variable `SITE_URL` (Worker → **Settings → Build →
   Build variables**, o donde la pusiste en el paso 4) **sin barra final**, por ejemplo
   `https://elyndra-website.jefer02.workers.dev`, y vuelve a desplegar (**Deployments → Retry
   build**, o haz cualquier push). Con `SITE_URL` el build genera `sitemap.xml`, enlaces canónicos y
   la imagen para redes sociales con dirección completa.
5. Comprueba:
   - La portada, `/es/`, `/privacy/` y una dirección inventada (debe salir la 404).
   - Que el botón de descarga muestra la versión y el SHA-256.
   - Desde el móvil: el botón descarga el APK directamente desde GitHub.

---

## 6. Dominio propio y HTTPS (opcional)

Necesitas un dominio (por ejemplo `elyndra.app`). Puedes comprarlo en el propio Cloudflare
(**Domain Registration → Register Domains**, a precio de coste) o en otro registrador.

1. Si lo compraste fuera: en Cloudflare, **Add a domain** (añadir un sitio), elige el plan **Free**
   y cambia los **nameservers** en tu registrador por los dos que te indica Cloudflare. Espera a
   que la zona salga **Active** (minutos u horas).
2. Ve a **Workers & Pages → elyndra-website → Settings → Domains & Routes → Add →
   Custom domain**.
3. Escribe el dominio (`elyndra.app`) y pulsa **Add Custom Domain**. Repite con `www.elyndra.app`
   si lo quieres. Cloudflare crea el registro DNS y el **certificado HTTPS automáticamente**.
4. Cambia `SITE_URL` a `https://elyndra.app` y vuelve a desplegar.
5. La dirección `workers.dev` sigue funcionando; las etiquetas canónicas apuntan al dominio bueno.
   Si quieres, puedes desactivarla en **Settings → Domains & Routes**.

> No se puede crear un dominio propio sobre un nombre que ya tenga un registro CNAME: bórralo antes.

---

## 7. Redesplegar y volver atrás

- **Cada `git push` a `main` despliega solo.** Los pushes a otras ramas suben una versión de
  prueba sin tocar la web pública (con su propia URL de vista previa).
- **Volver a una versión anterior (rollback):** **Workers & Pages → elyndra-website →
  Deployments**, en la versión buena pulsa **⋯ → Rollback**. Desde la terminal:
  `npx wrangler rollback`. Se puede volver a cualquiera de las 100 últimas versiones.
- **Repetir un build** sin cambiar código: **Deployments → Retry build** (útil para refrescar la
  lista de versiones de reserva).

---

## 8. Alternativa: subir a mano con Wrangler (sin GitHub)

Útil para pruebas o si no quieres conectar el repositorio.

```powershell
cd C:\dev\Elyndra-website
npx wrangler login                      # abre el navegador para autorizar
$env:SITE_URL = "https://elyndra-website.TU-SUBDOMINIO.workers.dev"
npm run build
npx wrangler deploy
```

(Atajo: `npm run deploy` hace el build y el despliegue.) `wrangler` va fijado en el proyecto
(4.149.0) y tiene la telemetría desactivada en `wrangler.jsonc`.

Para probar en local con el motor real de Cloudflare (cabeceras, 404, redirecciones):
`npm run build` y luego `npm run cf:dev` → <http://localhost:8787>.

---

## 9. Cómo aparecen las versiones nuevas de la app

**No hay que hacer nada en la web.** Cuando publicas una release en
`github.com/jefer02/Elyndra/releases` (siguiendo `docs/RELEASING.md` de la app):

1. El navegador de cada visitante pide la lista de versiones a la API pública de GitHub al abrir la
   página (con una caché de 15 minutos por pestaña).
2. Muestra la más nueva publicada, **incluidas las pre-releases** (con la etiqueta *Beta*), y enlaza
   el APK adecuado: `…-arm64-v8a.apk` si el navegador sabe que el móvil es arm64, si no
   `…-universal.apk`.
3. Si GitHub limita las peticiones (60 por hora y por IP sin autenticar) o no responde, la web usa
   la lista guardada en el último build (`/data/releases.json`) y lo indica. Si tampoco está, enlaza
   a la página de Releases.

Redesplegar solo sirve para refrescar esa lista de reserva y el texto que ven quienes navegan sin
JavaScript. **El APK nunca se sube a Cloudflare.**

### Cambiar las capturas o los vídeos

Se hace **en tu PC**, no en Cloudflare (allí no hay `assets-src/` ni ffmpeg):

1. Pon los originales en `assets-src/screenshots/`, o las grabaciones (`adb screenrecord`, en
   horizontal) en `assets-src/video/` con el nombre `wheel.mp4` o `masha.mp4` (`intro.mp4` se guarda
   ahí para más adelante, pero hoy no se codifica ni se publica).
2. Capturas: `npm run assets`. Vídeos: `npm run video` (necesita ffmpeg: `winget install
   Gyan.FFmpeg`; si la terminal no lo encuentra, ábrela de nuevo o usa
   `$env:FFMPEG = "C:\ruta\a\ffmpeg.exe"`). El script recorta la barra de ZUI y falla si algún
   archivo pasa de 2,6 MB.
3. `npm run build` para comprobar los presupuestos de tamaño, y sube con git lo que cambió en
   `public/img/` o `public/video/`.
4. Actualiza tu copia de seguridad de `assets-src/`.

---

## 10. Problemas frecuentes

| Síntoma | Solución |
|---|---|
| El build falla con un error sobre el nombre del Worker | El nombre del proyecto en Cloudflare debe ser exactamente `elyndra-website`, igual que `"name"` en `wrangler.jsonc`. Cambia uno de los dos. |
| `tsc: not found`, `vite: not found` | Cloudflare no instaló dependencias: comprueba que `package-lock.json` está en el repo. En local, `npm ci`. |
| Error de versión de Node / sintaxis rara | Debe usar Node 24. Mira la primera parte del registro; si no lee `.nvmrc`, añade la variable `NODE_VERSION` = `24`. |
| `[snapshot] WARNING: could not reach the GitHub API` | No es grave: el build sigue con la lista anterior. La web lee GitHub en vivo igualmente. |
| `SITE_URL is not set` | Añade la variable de build (paso 5.4) y vuelve a desplegar. |
| No hay `sitemap.xml` | Igual: falta `SITE_URL`. |
| La web muestra la versión vieja tras desplegar | Recarga sin caché (Ctrl+F5). Los HTML no se cachean; los archivos de `/assets/` llevan hash y cambian de nombre. |
| "Could not load the release list" | GitHub no respondió y no hay lista de reserva. Comprueba <https://api.github.com/repos/jefer02/Elyndra/releases>. El enlace a Releases sigue funcionando. |
| El botón descarga el universal en un móvil arm64 | Pasa cuando la release no trae `…-arm64-v8a.apk` (la v1.0.0 solo trae el universal) o el navegador no dice el procesador. Sube los dos APK en cada release. |
| Un recurso bloqueado en la consola por la CSP | La política está en `vite.config.ts` (`headersFile`). Si añades scripts en línea o recursos externos, tienes que añadirlos ahí. |
| El dominio propio no carga | Espera a que la zona esté **Active** y revisa que no exista un CNAME previo con ese nombre. |
| `npm ci` lentísimo o errores `EPERM` | La carpeta sigue dentro de OneDrive: muévela (paso 1). |

Documentación oficial consultada:
[Migrar de Pages a Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) ·
[Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) ·
[Configuración de build](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) ·
[Imagen de build (Node 24)](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/) ·
[Cabeceras](https://developers.cloudflare.com/workers/static-assets/headers/) ·
[404 y barras finales](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/) ·
[Dominios propios](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) ·
[workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/) ·
[Rollbacks](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/)
