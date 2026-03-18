"use client";

import { useState } from "react";
import { registerPlayer } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

const FACTION_OPTIONS = [
  "Solo",
  "Custom...",
];

export default function HomePage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [faction, setFaction] = useState("");
  const [customFaction, setCustomFaction] = useState("");
  const [isCaptain, setIsCaptain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const effectiveFaction = faction === "Custom..." ? customFaction : faction;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !effectiveFaction.trim()) {
      setError("Name and Faction are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerPlayer(
        name.trim(),
        effectiveFaction.trim(),
        isCaptain ? "Captain" : "Member"
      );

      if (!res.success) {
        setError(res.error ?? "Registration failed.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)", padding: "2rem" }}>
        <div className="card" style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--success)" }}>
            {t.home.form.successTitle}
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            {t.home.form.successDesc1} <strong style={{ color: "var(--text)" }}>{name}</strong>.<br />
            {t.home.form.successDesc2}
          </p>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "1rem 1.25rem", textAlign: "left" }}>
            <p style={{ color: "var(--text)", fontWeight: 700, marginBottom: "0.4rem", fontSize: "0.9rem" }}>
              {t.home.form.actionRequired}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, margin: 0 }}>
              {t.home.form.feeText}
            </p>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: "1.5rem", width: "100%" }}
            onClick={() => { setSuccess(false); setName(""); setFaction(""); setCustomFaction(""); setIsCaptain(false); }}
          >
            {t.home.form.another}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <div style={{ background: "var(--bg-card)", padding: "3rem 1rem 2rem", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "var(--text)" }}>
          {t.home.title}
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: "0.75rem", fontSize: "1rem", maxWidth: 450, marginInline: "auto" }}>
          {t.home.subtitle}
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2.5rem 1rem" }}>
        <div className="card" style={{ maxWidth: 480, width: "100%" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "1.5rem", color: "var(--text)" }}>
            {t.home.form.title}
          </h2>

          {error && (
            <div style={{ background: "#450a0a", border: "1px solid #ef4444", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", color: "#fca5a5", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t.home.form.name}
              </label>
              <input
                className="input"
                type="text"
                placeholder={t.home.form.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Faction */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t.home.form.faction}
              </label>
              <select
                className="input"
                value={faction}
                onChange={(e) => setFaction(e.target.value)}
                required
                style={{ cursor: "pointer" }}
              >
                <option value="" disabled>{t.home.form.factionPlaceholder}</option>
                {FACTION_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f === "Custom..." ? t.home.form.customFaction : f}</option>
                ))}
              </select>
              {faction === "Custom..." && (
                <input
                  className="input"
                  style={{ marginTop: "0.5rem" }}
                  type="text"
                  placeholder={t.home.form.customFaction}
                  value={customFaction}
                  onChange={(e) => setCustomFaction(e.target.value)}
                  required
                />
              )}
            </div>

            {/* Captain toggle */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, padding: "0.75rem 1rem", cursor: "pointer" }}
              onClick={() => setIsCaptain(!isCaptain)}
            >
              <div style={{
                width: 36, height: 20, borderRadius: 10,
                background: isCaptain ? "var(--accent)" : "var(--border)",
                position: "relative", transition: "background 0.2s", flexShrink: 0
              }}>
                <div style={{
                  position: "absolute", top: 3, left: isCaptain ? 19 : 3,
                  width: 14, height: 14, borderRadius: "50%",
                  background: "white", transition: "left 0.2s"
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)" }}>{t.home.form.roleCaptain}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.home.form.roleDesc}</div>
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: "0.25rem" }}
            >
              {loading ? <><span className="spinner" /> {t.home.form.submitting}</> : t.home.form.submit}
            </button>
          </form>
        </div>
      </div>

      {/* Support Block */}
      <div style={{ textAlign: "center", paddingBottom: "3rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        {t.home.support} <br />
        <a href="mailto:seniorassassin.2026jd@gmail.com" style={{ color: "var(--accent)", textDecoration: "underline", marginTop: "0.5rem", display: "inline-block" }}>
          seniorassassin.2026jd@gmail.com
        </a>
      </div>
    </div>
  );
}
