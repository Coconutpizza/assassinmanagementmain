"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Language, translations } from "@/lib/translations";

type TranslationContextType = {
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations.EN;
};

const LanguageContext = createContext<TranslationContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("EN");

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
