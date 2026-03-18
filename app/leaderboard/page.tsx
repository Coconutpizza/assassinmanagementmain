"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllPlayers, type Player } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTarget, setSearchTarget] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await getAllPlayers();
        if (res.success && res.data) {
          setPlayers(res.data);
        } else {
          setError(res.error ?? "Failed to load war data.");
        }
      } catch {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Compute war metrics
  const approvedPlayers = useMemo(() => players.filter(p => p.Faction_Approved), [players]);
  const totalActive = approvedPlayers.filter(p => p.Alive_Status).length;
  const totalEliminated = approvedPlayers.length - totalActive;

  // 24h Death Period Algorithm
  const recentDeaths = useMemo(() => {
    const now = new Date().getTime();
    const deaths: Player[] = [];
    for (const p of approvedPlayers) {
      if (!p.Alive_Status && p.Death_Time) {
        const deathTime = new Date(p.Death_Time).getTime();
        const diffHours = (now - deathTime) / (1000 * 60 * 60);
        if (diffHours <= 24) {
          deaths.push(p);
        }
      }
    }
    // Sort most recent first
    deaths.sort((a, b) => new Date(b.Death_Time!).getTime() - new Date(a.Death_Time!).getTime());
    return deaths;
  }, [approvedPlayers]);

  // Global Leaderboard (Top 10 by Kills)
  const topAssassins = useMemo(() => {
    return [...approvedPlayers]
      .filter(p => (p.Kills ?? 0) > 0)
      .sort((a, b) => (b.Kills ?? 0) - (a.Kills ?? 0))
      .slice(0, 10);
  }, [approvedPlayers]);

  // Leading Factions
  const factionScores = useMemo(() => {
    const map = new Map<string, { kills: number, active: number }>();
    for (const p of approvedPlayers) {
      if (!p.Faction || p.Faction.toLowerCase() === "solo") continue;
      if (!map.has(p.Faction)) map.set(p.Faction, { kills: 0, active: 0 });
      const current = map.get(p.Faction)!;
      current.kills += (p.Kills ?? 0);
      if (p.Alive_Status) current.active += 1;
    }
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.kills - a.kills || b.active - a.active)
      .slice(0, 5);
  }, [approvedPlayers]);

  // Target Lookup
  const searchResults = useMemo(() => {
    if (!searchTarget.trim()) return [];
    const lower = searchTarget.toLowerCase();
    return approvedPlayers.filter(p => p.Name.toLowerCase().includes(lower) || p.Faction.toLowerCase().includes(lower));
  }, [searchTarget, approvedPlayers]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)" }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <span className="spinner" style={{ width: "2rem", height: "2rem", borderWidth: 3, marginBottom: "1rem", borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          <p>{t.leaderboard.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--danger)", borderRadius: 6, padding: "1rem", color: "var(--danger)", display: "inline-block" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{t.leaderboard.title}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>{t.leaderboard.subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
        
        {/* Current Season State */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)" }}>{t.leaderboard.seasonStatus}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ background: "var(--bg)", borderRadius: 6, padding: "1rem", textAlign: "center", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{totalActive}</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginTop: "0.4rem", textTransform: "uppercase" }}>{t.leaderboard.active}</div>
              </div>
              <div style={{ background: "var(--bg)", borderRadius: 6, padding: "1rem", textAlign: "center", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{totalEliminated}</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginTop: "0.4rem", textTransform: "uppercase" }}>{t.leaderboard.elim}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text)" }}>{t.leaderboard.recentElims}</h2>
            {recentDeaths.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontStyle: "italic" }}>{t.leaderboard.noRecent}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {recentDeaths.map(p => (
                  <div key={p.Name} style={{ display: "flex", justifyContent: "space-between", background: "var(--bg)", padding: "0.75rem 1rem", borderRadius: 6, border: "1px solid var(--border)" }}>
                    <div>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{p.Name}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "0.5rem" }}>({p.Faction})</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {t.leaderboard.elim}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global Leaderboards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                {t.leaderboard.topTitle}
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.leaderboard.topSub}</span>
            </div>

            {topAssassins.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t.leaderboard.noKills}</p>
            ) : (
              <table className="data-table">
                <tbody>
                  {topAssassins.map((p, i) => (
                    <tr key={p.Name}>
                      <td style={{ width: 30, color: "var(--text-muted)", fontWeight: 600 }}>#{i + 1}</td>
                      <td style={{ fontWeight: 600, color: "var(--text)" }}>{p.Name}</td>
                      <td style={{ color: "var(--text-muted)" }}>{p.Faction}</td>
                      <td style={{ textAlign: "right", color: "var(--text)", fontWeight: 700 }}>{p.Kills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
                {t.leaderboard.factionTitle}
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.leaderboard.factionSub}</span>
            </div>

            {factionScores.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{t.leaderboard.noFactions}</p>
            ) : (
              <table className="data-table">
                <tbody>
                  {factionScores.map((f, i) => (
                    <tr key={f.name}>
                      <td style={{ width: 30, color: "var(--text-muted)", fontWeight: 600 }}>#{i + 1}</td>
                      <td style={{ fontWeight: 700, color: "var(--text)" }}>{f.name}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{f.active} {t.leaderboard.activeTag}</td>
                      <td style={{ textAlign: "right", color: "var(--text)", fontWeight: 700 }}>{f.kills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>

      {/* Target Lookup */}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--text)" }}>{t.leaderboard.lookupTitle}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>{t.leaderboard.lookupSub}</p>
        
        <input
          className="input"
          type="text"
          placeholder={t.leaderboard.lookupPlace}
          value={searchTarget}
          onChange={(e) => setSearchTarget(e.target.value)}
          style={{ marginBottom: "1.5rem", maxWidth: 400 }}
        />

        {searchTarget.trim() && (
          <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 6 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.leaderboard.colTarget}</th>
                  <th>{t.leaderboard.colFaction}</th>
                  <th>{t.leaderboard.colStatus}</th>
                  <th style={{ textAlign: "right" }}>{t.leaderboard.colKills}</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.length === 0 ? (
                  <tr><td colSpan={4} style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>{t.leaderboard.noResults}</td></tr>
                ) : (
                  searchResults.map(p => (
                    <tr key={p.Name}>
                      <td style={{ fontWeight: 600 }}>{p.Name}</td>
                      <td style={{ color: "var(--text-muted)" }}>{p.Faction}</td>
                      <td>
                        {p.Alive_Status ? (
                          <span className="badge badge-green">ACTIVE</span>
                        ) : (
                          <span className="badge badge-red">ELIMINATED</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right", color: "var(--text)", fontWeight: 700 }}>{p.Kills ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
