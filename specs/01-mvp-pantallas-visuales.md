# SPEC 01 — MVP visual de Arcade Vault (5 pantallas, sin lógica de juego real)

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-08-27
> **Objective:** Construir las 5 pantallas visuales de Arcade Vault (Biblioteca, Detalle de juego, Reproductor mock, Auth y Salón de la Fama) en Next.js App Router, replicando el diseño retro-arcade de `references/templates/`, sin implementar ningún juego jugable real.

---

## Por qué este spec existe

`references/templates/` es un prototipo HTML/React (CDN, sin build) que define el lenguaje visual completo de la app (tema neón CRT, tipografías pixel, componentes). Los archivos de esa carpeta tienen su **contenido desplazado por un guardado corrupto**: cada archivo contiene el código que le correspondería al archivo alfabéticamente anterior. Se reconstruyó el mapeo real leyendo bytes crudos:

| Archivo en disco             | Contenido real                                  |
| ----------------------------- | ------------------------------------------------ |
| `app.jsx`                     | HTML shell (`index.html`)                        |
| `nav.jsx`                     | Componente `App` (router raíz)                   |
| `auth.jsx`                    | Componente `Nav`                                  |
| `detalle.jsx`                 | Componente `Auth`                                 |
| _(ningún archivo)_            | Componente `GameDetail` — **perdido, no existe**  |
| `salon.jsx`                   | Componente `GamePlayer` (reproductor)             |
| `styles.css`                  | Componente `HallOfFame` (salón de la fama)        |
| `biblioteca.jsx`               | Datos mock (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) |
| `data.jsx`                    | CSS completo del tema                             |
| `Arcade Vault.html`           | Componente `Library` (biblioteca)                 |

La pantalla de Detalle de juego no tiene fuente de referencia: se reconstruye por inferencia a partir de las clases CSS reales (`.av-detail`, `.detail-cover`, `.detail-tags`, `.stat-strip`, `.leaderboard`, `.lb-row`) y de los campos disponibles en `GAMES` (`long`, `cat`, `best`, `plays`).

---

## Scope

**In:**

- 5 rutas Next.js App Router: Biblioteca (`/`), Detalle de juego (`/juego/[id]`), Reproductor mock (`/juego/[id]/jugar`), Auth (`/auth`), Salón de la Fama (`/salon-de-la-fama`).
- Tema visual completo importado desde el CSS real del template (scanlines, grid CRT, neón, botones clip-path, tarjetas con tilt), adaptado como CSS global del proyecto (no reimplementado en Tailwind).
- Tipografías Press Start 2P (pixel) y JetBrains Mono/Courier Prime (mono) vía `next/font/google`, reemplazando Geist/Geist Mono.
- `Nav` con estado activo por ruta, menú móvil (hamburguesa) y botón de sesión (mock).
- Datos mock de juegos (`GAMES`, `CATS`) y jugadores/puntuaciones (`PLAYERS`, `seededScores`) portados a `lib/data.ts`.
- Auth mock: formulario de login/registro y "jugar como invitado" que guardan `{ name }` en `localStorage` (`av_user`) y navegan a Biblioteca; sin validación real ni backend.
- Reproductor mock con comportamiento interactivo (no juego real): HUD (jugador, puntuación, vidas, nivel), pantalla CRT con "arena" decorativa animada en CSS puro, botón pausa, botón fin, modal de game over con input de iniciales y guardado del score en `localStorage` (`av_scores`).
- Salón de la Fama con podio (top 3) y tabla de puntuaciones por juego (tabs), usando datos generados por `seededScores`; fila destacada "tu mejor marca" si hay usuario logueado (mock, no lee `av_scores` real — igual que el template original).
- Pantalla de Detalle de juego reconstruida: cover, tags, descripción larga, stat strip (mejor puntuación, jugadas, categoría), leaderboard lateral (usa `seededScores`), acciones ("Jugar", "Volver").
- Responsive según los breakpoints ya definidos en el CSS del template (`@media (max-width: 840px/900px/720px)`).

**Out of scope (for future specs):**

- Cualquier juego jugable real (Bloque Buster, Caída, Serpentina, etc.).
- Backend, base de datos, autenticación real o API routes.
- Persistencia real de puntuaciones compartida entre usuarios (todo es local al navegador).
- Salón de la Fama leyendo las puntuaciones guardadas realmente en `av_scores` (el template original tampoco lo hace; se mantiene el mismo mock).
- Sonido/efectos de audio.
- Tests automatizados (el repo no tiene framework de testing configurado).

---

## Data model

```ts
// lib/data.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";

export type Game = {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string; // clase CSS del cover generado (ej. "cover-bricks")
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string; // ej. "12.4K"
};

export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;

export type ScoreRow = {
  rank: number;
  name: string;
  score: number;
  date: string; // dd/mm/yyyy
};

// seededScores(seed, count) — generador determinístico, portado tal cual del template
```

```ts
// lib/auth.ts — mock de sesión en localStorage
export type MockUser = { name: string };
// claves: "av_user" (MockUser | null), "av_scores" (Array<{ game: string; score: number; name: string; at: number }>)
```

Convenciones:

- IDs de juego en kebab-case (`bloque-buster`, `caida`, etc.), iguales a los del template.
- Las clases de cover (`cover-bricks`, `cover-tetro`, ...) son puramente CSS, sin imágenes.

---

## Implementation plan

1. Configurar fuentes: reemplazar Geist/Geist Mono por Press Start 2P y JetBrains Mono (`next/font/google`) en `app/layout.tsx`, expuestas como variables CSS (`--font-pixel`, `--font-mono`).
2. Portar el CSS real del template a `app/globals.css` (o un archivo `app/arcade.css` importado desde `globals.css`), ajustando las variables de fuente a las de `next/font`. Verificación manual: `npm run dev` muestra el fondo con grid CRT y scanlines en `/`.
3. Crear `lib/data.ts` con `GAMES`, `CATS`, `PLAYERS` y `seededScores` portados desde el contenido real (hoy bajo `biblioteca.jsx`).
4. Crear `lib/auth.ts` con helpers de lectura/escritura de `av_user` en `localStorage` y un hook `useMockUser()` (client-side).
5. Crear `components/Nav.tsx` (client component) portando el `Nav` real (hoy bajo `auth.jsx`), usando `usePathname()`/`Link` de Next.js en vez del router hash-based.
6. Crear `app/layout.tsx` con `Nav`, fondo (`.av-bg`, `.av-noise`) y footer, envolviendo `{children}`. Verificación: cualquier ruta muestra la nav fija.
7. Implementar `/` (`app/page.tsx`) portando `Library`/`GameCard` (hoy bajo `Arcade Vault.html`): buscador, chips de categoría, grid de tarjetas con tilt on hover, click navega a `/juego/[id]`.
8. Implementar `/auth` (`app/auth/page.tsx`) portando `Auth` (hoy bajo `detalle.jsx`): tabs login/registro, "jugar como invitado", guarda `av_user` y redirige a `/`.
9. Implementar `/salon-de-la-fama` (`app/salon-de-la-fama/page.tsx`) portando `HallOfFame` (hoy bajo `styles.css`): tabs por juego, podio, tabla, fila "tu mejor marca" si hay `av_user`.
10. Implementar `/juego/[id]` (`app/juego/[id]/page.tsx`) — pantalla de Detalle reconstruida: cover, tags, descripción, stat strip, leaderboard (`seededScores`), botones "Jugar" (→ `/juego/[id]/jugar`) y "Volver".
11. Implementar `/juego/[id]/jugar` (`app/juego/[id]/jugar/page.tsx`) portando `GamePlayer` (hoy bajo `salon.jsx`): HUD, CRT con arena decorativa animada, pausa, botón fin, modal de game over con guardado en `av_scores`.
12. Manejar el caso de `id` inexistente en `/juego/[id]` y `/juego/[id]/jugar` con `notFound()` de Next.js.
13. Revisión responsive en los tres breakpoints del CSS original y `npm run lint`.

---

## Acceptance criteria

- [ ] `npm run dev` levanta sin errores y `/` muestra la Biblioteca con buscador, chips de categoría y grid de 8 juegos.
- [ ] Escribir en el buscador o cambiar de chip filtra la grilla sin recargar la página.
- [ ] Click en una tarjeta navega a `/juego/[id]` con el `id` correspondiente.
- [ ] `/juego/[id]` muestra cover, categoría, descripción larga, stat strip y leaderboard del juego.
- [ ] Botón "Jugar" en Detalle navega a `/juego/[id]/jugar`.
- [ ] En `/juego/[id]/jugar` la puntuación aumenta automáticamente cada ~220ms mientras no está en pausa ni terminado.
- [ ] Botón "Pausa" detiene el incremento de puntuación y lo reanuda al volver a pulsarlo.
- [ ] Botón "Fin" abre el modal de game over con la puntuación final.
- [ ] Guardar la puntuación en el modal la persiste en `localStorage` bajo `av_scores` y muestra el mensaje de confirmación.
- [ ] `/auth` permite loguearse (mock) o entrar como invitado, y redirige a `/`.
- [ ] Tras loguearse (mock), la Nav muestra el nombre de usuario en vez de "Iniciar Sesión".
- [ ] `/salon-de-la-fama` muestra podio (top 3) y tabla de puntuaciones, cambiando de datos al seleccionar otro juego en las tabs.
- [ ] Navegar a `/juego/id-inexistente` muestra la página 404 de Next.js.
- [ ] `npm run lint` pasa sin errores.
- [ ] El layout responde correctamente en viewport móvil (nav colapsa a hamburguesa, grids pasan a una columna).

---

## Decisions

- **Sí:** portar el CSS del template casi tal cual como CSS global, en vez de reimplementar con utilities de Tailwind. Los efectos (CRT, scanlines, clip-path, tilt) son intrincados y reimplementarlos en Tailwind arriesga fidelidad visual sin aportar valor en un MVP puramente visual.
- **No:** Tailwind para los estilos existentes del template. Se puede seguir usando Tailwind para código nuevo que no tenga ya un equivalente en el CSS portado.
- **Sí:** rutas reales de Next.js App Router (`/juego/[id]`, etc.) en vez del router hash-based (`#{"name":...}`) del prototipo. Es el patrón nativo de Next.js y evita reinventar navegación/back-button.
- **Sí:** reconstruir la pantalla de Detalle por inferencia a partir del CSS real y los datos de `GAMES`, ya que su código fuente se perdió en la corrupción de archivos.
- **Sí:** mantener el mock de auth con `localStorage` (`av_user`) sin backend — coherente con "solo la parte visual, ningún juego" y evita alcance fuera de spec (no hay spec de autenticación real todavía).
- **Sí:** incluir el comportamiento interactivo completo del reproductor (contador de puntaje, pausa, modal, guardado local) aunque no haya juego real — es decorativo/mock, no lógica de juego.
- **No:** hacer que el Salón de la Fama lea `av_scores` real. El template original tampoco lo hace (usa datos generados por semilla); cambiarlo es una mejora fuera de este spec.
- **Sí:** Press Start 2P + JetBrains Mono vía `next/font/google`, reemplazando Geist — son parte central de la identidad visual retro del template.

---

## Risks

| Riesgo                                                                 | Mitigación                                                                                   |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| La pantalla de Detalle reconstruida no coincide exactamente con el original perdido | Se basa en clases CSS reales y estructura consistente con el resto de pantallas; ajustable tras revisión visual del usuario. |
| `localStorage` no disponible (modo privado/SSR)                          | Acceso siempre en client components, con try/catch como en el template original; si falla, la sesión/score simplemente no persiste. |
| Next.js 16 (Cache Components / typed routes) puede exigir `<Suspense>` o tipado distinto al esperado | Leer `AGENTS.md` y `node_modules/next/dist/docs/01-app/` antes de escribir cada ruta, como indica el CLAUDE.md del proyecto. |

---

## What is **not** in this spec

- Ningún juego jugable real (mecánica, colisiones, physics).
- Backend, API routes o autenticación real.
- Sincronización de puntuaciones entre usuarios/dispositivos.
- Audio/efectos de sonido.
- Tests automatizados.

Cada uno de estos, si se implementa, va en su propio spec.
