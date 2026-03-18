"use client";

import { useState, useEffect } from "react";
import { registerPlayer, getAllPlayers, type Player } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

interface TeamInfo {
  name: string;
  members: string[];
  captain: string | null;
  memberCount: number;
}

export default function HomePage() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [faction, setFaction] = useState("");
  const [customFaction, setCustomFaction] = useState("");
  const [isCaptain, setIsCaptain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // Fetch existing teams on mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        const res = await getAllPlayers();
        if (res.success && res.data) {
          const teamMap = new Map<string, TeamInfo>();
          
          res.data.forEach((p: Player) => {
            // Skip Solo players
            if (!p.Faction || p.Faction.toLowerCase() === "solo") return;
            
            if (!teamMap.has(p.Faction)) {
              teamMap.set(p.Faction, {
                name: p.Faction,
                members: [],
                captain: null,
                memberCount: 0
              });
            }
            
            const team = teamMap.get(p.Faction)!;
            team.members.push(p.Name);
            team.memberCount++;
            if (p.Role === "Captain") {
              team.captain = p.Name;
            }
          });
          
          setTeams(Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setTeamsLoading(false);
      }
    }
    fetchTeams();
  }, []);

  const effectiveFaction = faction === "Custom..." ? customFaction : faction;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !effectiveFaction.trim()) {
      setError(t.home.errors.missing);
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
        setError(res.error ?? t.home.errors.failed);
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t.home.errors.network);
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
        
        {/* Season 1 Notice */}
        <div style={{ 
          marginTop: "1.5rem", 
          display: "inline-flex", 
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          background: "linear-gradient(135deg, #7c3aed20, #6366f120)",
          border: "1px solid #7c3aed40",
          borderRadius: 8,
          padding: "1rem 2rem"
        }}>
          <span style={{ 
            fontWeight: 800, 
            fontSize: "1rem", 
            color: "#a78bfa",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
            {t.home.seasonNotice}
          </span>
          <span style={{ 
            fontSize: "0.85rem", 
            color: "var(--text-muted)" 
          }}>
            {t.home.groupSize}
          </span>
        </div>
      </div>

      {/* Main Content - Form + Teams */}
      <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "2rem", padding: "2.5rem 1rem", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        
        {/* Registration Form */}
        <div style={{ flex: "1 1 400px", minWidth: 300 }}>
          <div className="card" style={{ width: "100%" }}>
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
                  data-testid="participant-name-input"
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
                  data-testid="faction-select"
                >
                  <option value="" disabled>{t.home.form.factionPlaceholder}</option>
                  
                  {/* Solo option - DISABLED */}
                  <option value="Solo" disabled style={{ color: "#666" }}>
                    Solo — {t.home.soloDisabled}
                  </option>
                  
                  {/* Existing teams */}
                  {teams.length > 0 && (
                    <optgroup label={t.home.joinTeam}>
                      {teams.map((team) => (
                        <option key={team.name} value={team.name}>
                          {team.name} ({team.memberCount} {t.home.members})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* Custom option */}
                  <optgroup label={t.home.createTeam}>
                    <option value="Custom...">{t.home.form.customFaction}</option>
                  </optgroup>
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
                    data-testid="custom-faction-input"
                  />
                )}
              </div>

              {/* Captain toggle */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, padding: "0.75rem 1rem", cursor: "pointer" }}
                onClick={() => setIsCaptain(!isCaptain)}
                data-testid="captain-toggle"
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
                data-testid="submit-registration"
              >
                {loading ? <><span className="spinner" /> {t.home.form.submitting}</> : t.home.form.submit}
              </button>
            </form>
          </div>
        </div>

        {/* Teams Display */}
        <div style={{ flex: "1 1 400px", minWidth: 300 }}>
          <div className="card" style={{ width: "100%" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.2rem", marginBottom: "1.5rem", color: "var(--text)" }}>
              {t.home.availableTeams}
            </h2>
            
            {teamsLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                <span className="spinner" /> Loading...
              </div>
            ) : teams.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
                {t.home.noTeams}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {teams.map((team) => (
                  <div 
                    key={team.name} 
                    style={{ 
                      background: "var(--bg)", 
                      border: "1px solid var(--border)", 
                      borderRadius: 8, 
                      padding: "1rem",
                      transition: "border-color 0.2s"
                    }}
                    data-testid={`team-card-${team.name}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: 0, color: "var(--text)" }}>
                        {team.name}
                      </h3>
                      <span className="badge badge-indigo" style={{ fontSize: "0.7rem" }}>
                        {team.memberCount} {t.home.members}
                      </span>
                    </div>
                    
                    {/* Captain */}
                    {team.captain && (
                      <div style={{ marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {t.home.captain}:
                        </span>
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#a78bfa" }}>
                          {team.captain}
                        </span>
                      </div>
                    )}
                    
                    {/* Members list */}
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {t.home.members}:
                      </span>
                      <div style={{ marginTop: "0.35rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {team.members.map((member) => (
                          <span 
                            key={member} 
                            style={{ 
                              fontSize: "0.8rem", 
                              background: member === team.captain ? "#7c3aed30" : "var(--bg-card)", 
                              border: member === team.captain ? "1px solid #7c3aed50" : "1px solid var(--border)",
                              padding: "0.2rem 0.5rem", 
                              borderRadius: 4,
                              color: "var(--text)"
                            }}
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
