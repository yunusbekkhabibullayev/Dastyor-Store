import React from 'react';

export const FlagUz = ({ className = "w-6 h-4 object-cover shadow-xs border border-gray-200/80" }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#0099b5" d="M0 0h640v160H0z"/>
    <path fill="#ce1126" d="M0 150h640v180H0z"/>
    <path fill="#fff" d="M0 160h640v160H0z"/>
    <path fill="#ce1126" d="M0 310h640v180H0z"/>
    <path fill="#1eb53a" d="M0 320h640v160H0z"/>
    <circle cx="70" cy="80" r="32" fill="#fff"/>
    <circle cx="84" cy="80" r="32" fill="#0099b5"/>
    <g fill="#fff">
      <circle cx="140" cy="48" r="7"/>
      <circle cx="175" cy="48" r="7"/>
      <circle cx="210" cy="48" r="7"/>
      <circle cx="105" cy="80" r="7"/>
      <circle cx="140" cy="80" r="7"/>
      <circle cx="175" cy="80" r="7"/>
      <circle cx="210" cy="80" r="7"/>
      <circle cx="245" cy="80" r="7"/>
      <circle cx="105" cy="112" r="7"/>
      <circle cx="140" cy="112" r="7"/>
      <circle cx="175" cy="112" r="7"/>
      <circle cx="210" cy="112" r="7"/>
    </g>
  </svg>
);

export const FlagRu = ({ className = "w-6 h-4 object-cover shadow-xs border border-gray-200/80" }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#fff" d="M0 0h640v160H0z"/>
    <path fill="#0039a6" d="M0 160h640v160H0z"/>
    <path fill="#d52b1e" d="M0 320h640v160H0z"/>
  </svg>
);

export const FlagEn = ({ className = "w-6 h-4 object-cover shadow-xs border border-gray-200/80" }) => (
  <svg className={className} viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg">
    <path fill="#012169" d="M0 0h640v480H0z"/>
    <path fill="#fff" d="M0 0l640 480M640 0L0 480" stroke="#fff" strokeWidth="60"/>
    <path fill="#c8102e" d="M0 0l640 480M640 0L0 480" stroke="#c8102e" strokeWidth="40"/>
    <path fill="#fff" d="M320 0v480M0 240h640" stroke="#fff" strokeWidth="100"/>
    <path fill="#c8102e" d="M320 0v480M0 240h640" stroke="#c8102e" strokeWidth="60"/>
  </svg>
);

export const LanguageFlag = ({ lang, className = "w-6 h-4 object-cover shadow-xs" }) => {
  if (lang === 'uz') return <FlagUz className={className} />;
  if (lang === 'ru') return <FlagRu className={className} />;
  return <FlagEn className={className} />;
};
