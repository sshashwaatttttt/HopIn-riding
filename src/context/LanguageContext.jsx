import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionary } from '../utils/dictionary';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('hopin_language') || 'genz'; // Default Gen-Z Mode for maximum wow factor!
  });

  useEffect(() => {
    localStorage.setItem('hopin_language', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'genz' : 'en');
  };

  const t = (key) => {
    return dictionary[lang]?.[key] || dictionary['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, quickReplies: dictionary[lang].quickReplies }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
