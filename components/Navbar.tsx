"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();

  const links = [
    { href: "/", label: t.nav.register },
    { href: "/season", label: t.nav.season },
    { href: "/leaderboard", label: t.nav.leaderboard },
    { href: "/rules", label: t.nav.rules },
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/admin", label: t.nav.admin },
  ];

  return (
    <nav className="nav">
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#e2e8f0", letterSpacing: "-0.02em" }}>
            SeniorAssassin
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: 4,
                  fontSize: "0.80rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  background: active ? "var(--bg-card)" : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                  border: active ? "1px solid var(--border)" : "1px solid transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {l.label}
              </Link>
            );
          })}
          
          <div style={{ width: 1, height: "1.2rem", background: "var(--border)", margin: "0 0.5rem" }} />

          <button
            className="btn btn-outline"
            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", borderRadius: 4 }}
            onClick={() => setLang(lang === "EN" ? "FR" : "EN")}
          >
            {lang}
          </button>
        </div>
      </div>
    </nav>
  );
}
