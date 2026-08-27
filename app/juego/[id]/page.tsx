// app/juego/[id]/page.tsx — Detalle de juego, reconstruida por inferencia
// (no hay fuente en references/templates/: se perdió en la corrupción de archivos;
// ver "Por qué este spec existe" en specs/01-mvp-pantallas-visuales.md).
import Link from "next/link";
import { notFound } from "next/navigation";
import { GAMES, seededScores } from "@/lib/data";

export default async function GameDetailPage(props: PageProps<"/juego/[id]">) {
  const { id } = await props.params;
  const game = GAMES.find((g) => g.id === id);

  if (!game) {
    notFound();
  }

  const leaderboard = seededScores(id.length * 17 + 3, 8);

  return (
    <div className="av-detail fade-in">
      <div>
        <div className="detail-cover">
          <div className={"cover-bg " + game.cover} />
        </div>
        <div className="detail-info">
          <h2 className="neon-cyan">{game.title}</h2>
          <div className="detail-tags">
            <span>{game.cat}</span>
          </div>
          <p>{game.long}</p>
          <div className="stat-strip">
            <div>
              <div className="l">MEJOR PUNTUACIÓN</div>
              <div className="v">{game.best.toLocaleString("es-ES")}</div>
            </div>
            <div>
              <div className="l">JUGADAS</div>
              <div className="v">{game.plays}</div>
            </div>
            <div>
              <div className="l">CATEGORÍA</div>
              <div className="v">{game.cat}</div>
            </div>
          </div>
          <div className="detail-actions">
            <Link href={`/juego/${game.id}/jugar`} className="btn xl pulse">
              JUGAR
            </Link>
            <Link href="/" className="btn ghost">
              VOLVER
            </Link>
          </div>
        </div>
      </div>

      <div className="leaderboard">
        <h3>LEADERBOARD</h3>
        {leaderboard.map((r, i) => (
          <div
            key={r.name + i}
            className={"lb-row" + (i === 0 ? " top1" : i === 1 ? " top2" : i === 2 ? " top3" : "")}
          >
            <div className="rk">#{String(r.rank).padStart(2, "0")}</div>
            <div className="pl">{r.name}</div>
            <div className="sc">{r.score.toLocaleString("es-ES")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
