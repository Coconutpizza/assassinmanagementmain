"use client";

import { useState } from "react";
import { getPlayer, type Player } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [nameInput, setNameInput] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPlayer(null);
    if (!nameInput.trim()) return;

    setLoading(true);
    try {
      const res = await getPlayer(nameInput.trim());
      if (!res.success || !res.data) {
        setError(res.error ?? t.dashboard.notFound);
      } else {
        setPlayer(res.data);
      }
    } catch {
      setError(t.dashboard.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Header */}
        <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{t.dashboard.title}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.4rem", fontSize: "0.9rem" }}>{t.dashboard.subtitle}</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLookup} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <input
            className="input"
            type="text"
            placeholder={t.dashboard.inputPlaceholder}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ whiteSpace: "nowrap" }}>
            {loading ? <span className="spinner" /> : t.dashboard.lookup}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: 8, padding: "0.75rem 1rem", color: "#fca5a5", fontSize: "0.875rem", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* LOCKED state */}
        {player && !player.Payment_Status && (
          <div className="card" style={{ textAlign: "center", border: "1px solid var(--warning)" }}>
            <h2 style={{ color: "var(--warning)", fontWeight: 800, fontSize: "1.25rem", margin: 0 }}>{t.dashboard.lockedTitle}</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
              {t.dashboard.lockedSub}
            </p>
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "0.85rem", marginTop: "1rem" }}>
              <p style={{ color: "var(--text)", fontSize: "0.85rem", margin: 0, lineHeight: 1.6 }}>
                {t.dashboard.lockedInst}
              </p>
            </div>
          </div>
        )}

        {/* ACTIVE state */}
        {player && player.Payment_Status && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Formatted status indicator */}
            <div className="card" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0, marginBottom: "0.75rem" }}>
                {t.dashboard.statusHead}
              </p>
              {player.Alive_Status ? (
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "var(--bg)", padding: "0.5rem 1.5rem", borderRadius: 4, border: "1px solid var(--success)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--success)" }} />
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--success)" }}>{t.dashboard.alive}</span>
                </div>
              ) : (
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", background: "var(--bg)", padding: "0.5rem 1.5rem", borderRadius: 4, border: "1px solid var(--danger)" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--danger)" }} />
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--danger)" }}>{t.dashboard.eliminated}</span>
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="kpi-card">
                <div className="kpi-label">{t.dashboard.kills}</div>
                <div className="kpi-value">{player.Kills ?? 0}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">{t.dashboard.role}</div>
                <div style={{ marginTop: "0.35rem" }}>
                  <span className={`badge ${player.Role === "Captain" ? "badge-indigo" : "badge-green"}`}>
                    {player.Role}
                  </span>
                </div>
              </div>
              <div className="kpi-card" style={{ gridColumn: "1 / -1" }}>
                <div className="kpi-label">{t.dashboard.faction}</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, marginTop: "0.3rem" }}>
                  {player.Faction}
                </div>
              </div>
            </div>

            {/* Payment confirmed */}
            <div style={{ textAlign: "center", padding: "0.5rem", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>
              {t.dashboard.paid}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
