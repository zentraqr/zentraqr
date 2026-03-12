import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt');

  // Detect browser language and load from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('zentraqr-language');
    
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      const detectedLang = browserLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
      setLanguage(detectedLang);
      localStorage.setItem('zentraqr-language', detectedLang);
    }
  }, []);

  // Save language to localStorage when it changes
  const changeLanguage = (lang) => {
    if (lang === 'pt' || lang === 'en') {
      setLanguage(lang);
      localStorage.setItem('zentraqr-language', lang);
    }
  };

  // Get translation function
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return value;
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    translations: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
