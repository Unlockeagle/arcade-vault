# SPEC 02 — Hero landing en `/` y Biblioteca movida a `/games`

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-08-27
> **Objective:** Mover la Biblioteca de `/` a `/games` y crear una nueva landing en `/` con un hero retro-arcade y fondo animado de monedas y figuras de videojuegos arcade.

---

## Scope

**In:**

- Mover el contenido actual de `app/page.tsx` (Biblioteca) a `app/games/page.tsx`, sirviendo en `/games`.
- Nueva landing en `app/page.tsx` (`/`): server component (sin `"use client"`), pantalla única con hero (título "ARCADE VAULT", tagline) y fondo animado, más un botón CTA que navega a `/games`.
- Fondo animado con 10-15 elementos (monedas y figuras arcade: joystick, control, fantasma, invasor, etc.) usando emoji/caracteres sobre CSS puro (`@keyframes`, sin imágenes), con posiciones/retrasos/tamaños definidos en un array fijo hardcodeado (determinista, sin `Math.random()`) para evitar mismatch de hidratación.
- Animaciones respetan `prefers-reduced-motion: reduce` (quedan estáticas, sin `@keyframes` activo).
- Actualizar todas las referencias internas que hoy apuntan a `/` (destino de la Biblioteca) para que apunten a `/games`:
  - `components/Nav.tsx`: el link "Biblioteca" pasa a `href="/games"`; se agrega un nuevo link "Inicio" con `href="/"`; el logo sigue apuntando a `/`; `isActive` se ajusta para que `/games` (y `/juego/*`) marquen "Biblioteca" activa, y `/` marque "Inicio" activa; el `router.push("/")` de "salir de sesión" pasa a `router.push("/games")`.
  - `app/auth/page.tsx`: los dos `router.push("/")` (login y "jugar como invitado") pasan a `router.push("/games")`.
  - `app/juego/[id]/page.tsx`: el botón "Volver" (`Link href="/"`) pasa a `href="/games"`.
  - `app/salon-de-la-fama/page.tsx`: el botón que hace `router.push("/")` pasa a `router.push("/games")`.
  - `components/GamePlayer.tsx`: el botón que hace `router.push("/")` pasa a `router.push("/games")`.
- CSS nuevo para el hero y el fondo animado agregado a `app/globals.css` (o un archivo dedicado importado desde ahí, siguiendo el patrón de SPEC 01).

**Out of scope (for future specs):**

- Cambios al contenido, filtros o tarjetas de la Biblioteca en sí (se mueve tal cual, sin modificar su lógica).
- Accesos rápidos/tarjetas secundarias en la landing (solo hero + CTA, según lo definido).
- Nuevas imágenes o assets gráficos (los elementos del fondo son emoji/CSS, no imágenes).
- Animaciones con JavaScript (parallax por scroll/mouse, physics de monedas, etc.) — todo es CSS puro.
- Cambios al reproductor mock, auth mock o salón de la fama más allá de actualizar el destino de sus redirects a `/`.

---

## Data model

Esta spec no introduce datos persistentes ni tipos nuevos en `lib/`. Solo agrega una constante local en `app/page.tsx` con la configuración de los elementos animados de fondo:

```ts
// app/page.tsx (constante local, no exportada)
type FloatingIcon = {
  emoji: string; // "🪙" | "👾" | "🕹️" | "👻" | "🎮" ...
  top: string; // ej. "12%"
  left: string; // ej. "80%"
  size: number; // px
  delay: string; // ej. "0.4s"
  duration: string; // ej. "9s"
};

const FLOATING_ICONS: FloatingIcon[] = [
  // 10-15 entradas con valores fijos, mismos en servidor y cliente
];
```

Convenciones:

- Todos los valores de `FLOATING_ICONS` son literales fijos en el código, no generados en runtime, para que el HTML del servidor coincida exactamente con el del cliente.

---

## Implementation plan

1. Crear `app/games/page.tsx` con el contenido íntegro actual de `app/page.tsx` (Biblioteca), sin cambios de lógica. Verificación: `/games` muestra la Biblioteca igual que `/` antes del cambio.
2. Reescribir `app/page.tsx` como server component con la nueva landing: hero (`h1` "ARCADE VAULT", tagline), fondo animado con `FLOATING_ICONS`, botón CTA `Link` a `/games`. Verificación: `/` muestra el hero, `npm run dev` sin errores en consola.
3. Agregar el CSS del hero/fondo animado a `app/globals.css` (clases nuevas, ej. `.av-landing-hero`, `.av-floating-icon`, `@keyframes av-float`), incluyendo el bloque `@media (prefers-reduced-motion: reduce)` que desactiva la animación. Verificación manual: los iconos flotan en `/`; con "reducir movimiento" activado en el SO, quedan estáticos.
4. Actualizar `components/Nav.tsx`: nuevo link "Inicio" (`/`), link "Biblioteca" apunta a `/games`, `isActive` ajustada, `router.push("/")` de logout pasa a `/games`. Verificación: la Nav marca "Inicio" activo en `/` y "Biblioteca" activo en `/games` y en `/juego/*`.
5. Actualizar los cuatro `router.push("/")` / `Link href="/"` restantes (`app/auth/page.tsx` ×2, `app/juego/[id]/page.tsx`, `app/salon-de-la-fama/page.tsx`, `components/GamePlayer.tsx`) para apuntar a `/games`. Verificación: login, "jugar como invitado", "Volver" en Detalle, botón en Salón de la Fama y botón en el modal de game over navegan todos a `/games`.
6. `npm run lint` y revisión responsive de la nueva landing en los breakpoints existentes del CSS del proyecto.

---

## Acceptance criteria

- [ ] `/games` muestra la Biblioteca (buscador, chips, grid de juegos) exactamente como antes mostraba `/`.
- [ ] `/` muestra la nueva landing: título "ARCADE VAULT", tagline y fondo animado, sin buscador ni grid de juegos.
- [ ] El fondo de `/` muestra entre 10 y 15 elementos (monedas y figuras arcade) animados con CSS puro.
- [ ] Con `prefers-reduced-motion: reduce` activado en el sistema, los elementos del fondo de `/` no se mueven.
- [ ] El botón CTA de la landing navega a `/games`.
- [ ] En la Nav, "Inicio" está activo en `/` y "Biblioteca" está activo en `/games` y en `/juego/[id]`.
- [ ] Iniciar sesión, registrarse o "jugar como invitado" en `/auth` redirige a `/games`.
- [ ] El botón "Volver" en `/juego/[id]` navega a `/games`.
- [ ] El botón de volver en `/salon-de-la-fama` navega a `/games`.
- [ ] El botón del modal de game over en el reproductor navega a `/games`.
- [ ] Cerrar sesión desde la Nav redirige a `/games`.
- [ ] `npm run lint` pasa sin errores.
- [ ] El layout de `/` responde correctamente en viewport móvil.

---

## Decisions

- **Sí:** mover la Biblioteca a `/games` copiando el archivo tal cual, sin tocar su lógica interna — minimiza el riesgo de romper algo que ya funciona (SPEC 01).
- **Sí:** todas las referencias internas que hoy navegan a `/` (redirects de auth, "Volver", botones de "fin de partida"/"salir") pasan a `/games`, porque esos flujos siguen queriendo llevar a la Biblioteca, no a la landing.
- **Sí:** el logo de la Nav sigue apuntando a `/` (la nueva home), no a `/games` — es el comportamiento estándar de un logo.
- **Sí:** server component para la landing (`app/page.tsx` sin `"use client"`) — no hay estado ni eventos, solo CSS animations y un `Link`, así que puede renderizarse en servidor.
- **Sí:** elementos del fondo animado como emoji/caracteres vía CSS puro, coherente con la convención de SPEC 01 de "sin imágenes" (covers como clases CSS).
- **Sí:** posiciones/retrasos de los elementos en un array fijo hardcodeado, no generados con `Math.random()` en cada render — evita mismatch de hidratación SSR/cliente.
- **No:** accesos rápidos o tarjetas secundarias en la landing — se mantiene la landing mínima (hero + CTA) según lo definido en la fase de preguntas.
- **No:** SVGs propios para los iconos del fondo — el emoji cubre el requisito visual sin agregar código extra en un MVP.

---

## What is **not** in this spec

- Cambios al contenido o lógica de la Biblioteca, más allá de moverla de ruta.
- Accesos rápidos, tarjetas o secciones adicionales en la landing.
- Nuevos assets de imagen o SVG propios.
- Animaciones basadas en JavaScript (parallax, física).
- Cualquier cambio a Auth real, reproductor o Salón de la Fama fuera de actualizar sus redirects.

Cada uno de estos, si se implementa, va en su propio spec.
