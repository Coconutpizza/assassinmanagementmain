"use client";

import { useState, useEffect } from "react";
import { getAllPlayers, type Player } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

export default function SeasonPage() {
  const { t } = useLanguage();
  const [factions, setFactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await getAllPlayers();
        if (res.success && res.data) {
          const uniqueFactions = new Set<string>();
          res.data.forEach(p => {
            if (p.Faction_Approved && p.Faction && p.Faction !== "Solo") {
              uniqueFactions.add(p.Faction);
            }
          });
          setFactions(Array.from(uniqueFactions).sort());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>
          {t.season.title}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
          {t.season.subtitle}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        {/* Season 1 (ACTIVE) */}
        <div className="card" style={{ borderLeft: "4px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>{t.season.s1Title}</h2>
            <span className="badge badge-indigo">ACTIVE</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            {t.season.s1Desc}
          </p>

          <div style={{ background: "var(--bg)", borderRadius: 6, padding: "1.5rem", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "1rem" }}>
              {t.season.approvedFactions}
            </h3>
            
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                <span className="spinner" /> {t.season.loading}
              </div>
            ) : factions.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>{t.season.noFactions}</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {factions.map(f => (
                  <span key={f} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", padding: "0.4rem 0.8rem", borderRadius: 4, fontSize: "0.85rem", fontWeight: 500 }}>
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Season 2 (PENDING) */}
        <div className="card" style={{ opacity: 0.7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, color: "var(--text-muted)" }}>{t.season.s2Title}</h2>
            <span className="badge badge-gray">PENDING</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            {t.season.s2Desc}
          </p>
        </div>

        {/* Season 3 (PENDING) */}
        <div className="card" style={{ opacity: 0.7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, color: "var(--text-muted)" }}>{t.season.s3Title}</h2>
            <span className="badge badge-gray">PENDING</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            {t.season.s3Desc}
          </p>
        </div>

      </div>
    </div>
  );
}
