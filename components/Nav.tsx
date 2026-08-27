"use client";

// components/Nav.tsx — portado de references/templates/auth.jsx (contenido real: Nav)
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMockUser } from "@/lib/auth";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useMockUser();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/games") return pathname === "/games" || pathname.startsWith("/juego");
    return pathname.startsWith(href);
  };

  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={isActive("/") ? "active" : ""}>
            Inicio
          </Link>
          <Link href="/games" className={isActive("/games") ? "active" : ""}>
            Biblioteca
          </Link>
          <Link href="/salon-de-la-fama" className={isActive("/salon-de-la-fama") ? "active" : ""}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer" />
        <div className="coin-counter">
          <span className="coin" />
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button
            className="btn ghost auth-btn"
            onClick={() => {
              signOut();
              router.push("/games");
            }}
          >
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className="btn auth-btn">
            Iniciar Sesión
          </Link>
        )}
        <button className="btn ghost hamburger" onClick={() => setOpen(true)} aria-label="Menú">
          ≡
        </button>
      </nav>

      <div className={"av-mobile-backdrop" + (open ? " open" : "")} onClick={close} />
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/" className={isActive("/") ? "active" : ""} onClick={close}>
          Inicio
        </Link>
        <Link href="/games" className={isActive("/games") ? "active" : ""} onClick={close}>
          Biblioteca
        </Link>
        <Link
          href="/salon-de-la-fama"
          className={isActive("/salon-de-la-fama") ? "active" : ""}
          onClick={close}
        >
          Salón de la Fama
        </Link>
        <Link href="/auth" className={isActive("/auth") ? "active" : ""} onClick={close}>
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }} />
        <div className="pixel" style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}>
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
