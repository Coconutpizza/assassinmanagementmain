"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function RulesPage() {
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, color: "var(--text)" }}>
          {t.rules.title}
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
          {t.rules.subtitle}
        </p>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ width: 40, height: 40, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "var(--text)" }}>
              {t.rules.placeholderHead}
            </h2>
          </div>
        </div>
        
        <p style={{ color: "var(--text-muted)", lineHeight: 1.6, fontSize: "0.95rem" }}>
          {t.rules.placeholderBody}
        </p>
        
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "1rem", marginTop: "2rem" }}>
          <p style={{ color: "var(--text)", fontSize: "0.85rem", fontStyle: "italic", margin: 0, textAlign: "center" }}>
            {t.rules.checkBack}
          </p>
        </div>
      </div>
    </div>
  );
}
