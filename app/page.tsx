// app/page.tsx — Landing (SPEC 02): hero retro-arcade con fondo animado de monedas y figuras.
// Server component: sin estado ni eventos, solo CSS animations + Link a /games.
import Link from "next/link";

type FloatingIcon = {
  emoji: string;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
};

// Valores fijos (no Math.random()) para que el HTML de servidor y cliente coincidan exactamente.
const FLOATING_ICONS: FloatingIcon[] = [
  { emoji: "🪙", top: "10%", left: "8%", size: 34, delay: "0s", duration: "8s" },
  { emoji: "👾", top: "18%", left: "82%", size: 42, delay: "0.6s", duration: "10s" },
  { emoji: "🕹️", top: "68%", left: "12%", size: 40, delay: "1.2s", duration: "9s" },
  { emoji: "🪙", top: "76%", left: "88%", size: 28, delay: "0.3s", duration: "7s" },
  { emoji: "👻", top: "6%", left: "48%", size: 36, delay: "1.8s", duration: "11s" },
  { emoji: "🎮", top: "42%", left: "5%", size: 30, delay: "0.9s", duration: "8.5s" },
  { emoji: "🪙", top: "32%", left: "92%", size: 24, delay: "2.1s", duration: "6.5s" },
  { emoji: "👾", top: "84%", left: "40%", size: 32, delay: "1.5s", duration: "9.5s" },
  { emoji: "🕹️", top: "22%", left: "28%", size: 26, delay: "2.4s", duration: "7.5s" },
  { emoji: "🪙", top: "58%", left: "70%", size: 38, delay: "0.4s", duration: "10.5s" },
  { emoji: "👻", top: "90%", left: "68%", size: 30, delay: "1.1s", duration: "8s" },
  { emoji: "🎮", top: "50%", left: "50%", size: 22, delay: "1.9s", duration: "6s" },
];

export default function Home() {
  return (
    <div className="fade-in av-landing">
      <div className="av-landing-bg" aria-hidden="true">
        {FLOATING_ICONS.map((icon, i) => (
          <span
            key={i}
            className="av-floating-icon"
            style={{
              top: icon.top,
              left: icon.left,
              fontSize: icon.size,
              animationDelay: icon.delay,
              animationDuration: icon.duration,
            }}
          >
            {icon.emoji}
          </span>
        ))}
      </div>

      <section className="av-landing-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className="sub">
          TU BIBLIOTECA RETRO DE SIEMPRE <span className="blink">_</span>
        </div>
        <Link href="/games" className="btn lg">
          JUGAR AHORA
        </Link>
      </section>
    </div>
  );
}
