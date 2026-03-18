"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllPlayers, updateStatus, type Player } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS ?? "";

export default function AdminPage() {
  const { t } = useLanguage();
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState(false);

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await getAllPlayers();
      if (res.success && res.data) {
        setPlayers(res.data);
      } else {
        setFetchError(res.error ?? t.admin.errorFetch);
      }
    } catch {
      setFetchError(t.admin.errorServer);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchAll();
  }, [authed, fetchAll]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (passInput === ADMIN_PASS) {
      setAuthed(true);
    } else {
      setPassError(true);
      setPassInput("");
    }
  }

  async function handleToggle(
    player: Player,
    col: "Payment_Status" | "Alive_Status" | "Faction_Approved"
  ) {
    const newValue = !player[col];

    // Optimistic update
    setPlayers((prev) =>
      prev.map((p) =>
        p.Name === player.Name ? { ...p, [col]: newValue } : p
      )
    );

    try {
      await updateStatus(player.Name, col, newValue);
    } catch {
      // Revert on failure
      setPlayers((prev) =>
        prev.map((p) =>
          p.Name === player.Name ? { ...p, [col]: !newValue } : p
        )
      );
    }
  }

  // ----- KPIs -----
  const totalPaid = players.filter((p) => p.Payment_Status).length;
  const totalAlive = players.filter((p) => p.Alive_Status).length;
  const totalCash = totalPaid * 5;

  // ----- Password Gate -----
  if (!authed) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)", padding: "2rem" }}>
        <div className="card" style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "0.35rem", color: "var(--text)" }}>{t.admin.loginTitle}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>{t.admin.loginSub}</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              className="input"
              type="password"
              placeholder={t.admin.passPlace}
              value={passInput}
              onChange={(e) => { setPassInput(e.target.value); setPassError(false); }}
              autoFocus
            />
            {passError && (
              <p style={{ color: "var(--danger)", fontSize: "0.8rem", margin: 0 }}>{t.admin.incorrect}</p>
            )}
            <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
              {t.admin.unlock}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----- Admin View -----
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", margin: 0, letterSpacing: "-0.02em", color: "var(--text)" }}>
            {t.admin.dashboardTitle}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>{players.length} {t.admin.registered}</p>
        </div>
        <button className="btn btn-outline" onClick={fetchAll} disabled={loading} style={{ fontSize: "0.8rem", padding: "0.45rem 1rem" }}>
          {loading ? <><span className="spinner" /> {t.admin.refreshing}</> : t.admin.refresh}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        <div className="kpi-card">
          <div className="kpi-label">{t.admin.kpiCash}</div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>${totalCash}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">{t.admin.kpiPaid}</div>
          <div className="kpi-value">{totalPaid}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">{t.admin.kpiAlive}</div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>{totalAlive}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">{t.admin.kpiElim}</div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{players.length - totalAlive}</div>
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: 8, padding: "0.75rem 1rem", color: "#fca5a5", marginBottom: "1rem" }}>
          {fetchError}
        </div>
      )}

      {/* Table */}
      {loading && players.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <span className="spinner" style={{ width: "1.5rem", height: "1.5rem", borderWidth: 3, borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          <p style={{ marginTop: "1rem" }}>{t.admin.loading}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.admin.colName}</th>
                  <th>{t.admin.colFaction}</th>
                  <th>{t.admin.colApproval}</th>
                  <th>{t.admin.colRole}</th>
                  <th>{t.admin.colPayment}</th>
                  <th>{t.admin.colStatus}</th>
                  <th style={{ textAlign: "right" }}>{t.admin.colKills}</th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                      {t.admin.noPlayers}
                    </td>
                  </tr>
                )}
                {players.map((player) => (
                  <tr key={player.Name}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{player.Name}</td>
                    <td style={{ color: "var(--text-muted)", fontWeight: 500 }}>{player.Faction}</td>
                    <td>
                      <button
                        className={player.Faction_Approved ? "btn-success" : "btn-danger"}
                        style={{ cursor: "pointer", fontWeight: 700 }}
                        onClick={() => handleToggle(player, "Faction_Approved")}
                        title="Click to toggle faction approval"
                      >
                        {player.Faction_Approved ? t.admin.btnApproved : t.admin.btnPending}
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${player.Role === "Captain" ? "badge-indigo" : "badge-green"}`}>
                        {player.Role}
                      </span>
                    </td>
                    <td>
                      <button
                        className={player.Payment_Status ? "btn-success" : "btn-danger"}
                        style={{ cursor: "pointer", fontWeight: 700 }}
                        onClick={() => handleToggle(player, "Payment_Status")}
                        title="Click to toggle payment status"
                      >
                        {player.Payment_Status ? t.admin.btnPaid : t.admin.btnUnpaid}
                      </button>
                    </td>
                    <td>
                      <button
                        className={player.Alive_Status ? "btn-success" : "btn-danger"}
                        style={{ cursor: "pointer", fontWeight: 700 }}
                        onClick={() => handleToggle(player, "Alive_Status")}
                        title="Click to toggle alive status"
                      >
                        {player.Alive_Status ? t.admin.btnAlive : t.admin.btnElim}
                      </button>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text)" }}>
                      {player.Kills ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
