import React, { useState } from 'react';
import { Header } from './components/Header';
import { PreviewSection } from './components/PreviewSection';
import { CookieConsent } from './components/CookieConsent';
import { CookieSettings } from './components/CookieSettings';
import { LiveChat } from './components/LiveChat';

export default function App() {
  const [showCookieSettings, setShowCookieSettings] = useState(false);

  return (
    <div className="text-gray-800 text-base not-italic normal-nums font-normal accent-auto box-border caret-transparent block tracking-[normal] leading-6 list-outside list-disc text-start indent-[0px] normal-case visible border-separate font-system_ui">
      <div className="box-border caret-transparent">
        <Header />
        <PreviewSection />
      </div>
      
      <img className="aspect-[auto_1_/_1] box-border caret-transparent hidden h-px w-px" />
      <img className="aspect-[auto_1_/_1] box-border caret-transparent hidden h-px w-px" />
      
      <div className="box-border caret-transparent">
        <div className="fixed bg-slate-700 box-border caret-transparent opacity-50 z-[2147483640] inset-0"></div>
        <CookieConsent onShowSettings={() => setShowCookieSettings(true)} />
        <CookieSettings 
          isVisible={showCookieSettings} 
          onClose={() => setShowCookieSettings(false)} 
        />
      </div>
      
      <LiveChat />
    </div>
  );
}
