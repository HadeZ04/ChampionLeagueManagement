import React from 'react';

interface CookieConsentProps {
  onShowSettings: () => void;
}

export function CookieConsent({ onShowSettings }: CookieConsentProps) {
  return (
    <>
      <div className="fixed bg-slate-700 box-border caret-transparent opacity-50 z-[2147483640] inset-0"></div>
      <div className="fixed text-white bg-slate-700 box-border caret-transparent flex flex-col max-w-[825px] text-left z-[2147483647] m-auto p-[30px] rounded-md bottom-5 inset-x-0 md:flex-row">
        <div className="box-border caret-transparent mr-0 mb-5 md:mr-5 md:mb-0">
          <p className="text-lg font-bold items-center box-border caret-transparent flex leading-[22px] mb-5">
            <img src="https://c.animaapp.com/mf6gsfb8XDhIuB/assets/icon-7.svg" alt="Icon" className="box-border caret-transparent h-[31px] w-[31px] mr-2.5" />
            We use cookie files
          </p>
          <p className="text-[15px] box-border caret-transparent leading-5">
            We activate all cookies by default to ensure the proper functioning of our website, advertisement, and analytics according to the{' '}
            <a href="https://www.templatemonster.com/privacy-policy.php" className="text-sky-500 font-bold box-border caret-transparent inline-block underline hover:no-underline">Privacy Policy</a>.
          </p>
        </div>
        
        <div className="box-border caret-transparent flex flex-col justify-center">
          <button className="text-sm items-center bg-slate-400 caret-transparent flex h-10 justify-center leading-5 min-w-[150px] mb-[15px] px-2.5 py-0 rounded-[3px] hover:bg-slate-500" onClick={onShowSettings}>
            Settings
          </button>
          <button className="text-sm items-center bg-sky-500 caret-transparent flex h-10 justify-center leading-5 min-w-[150px] px-2.5 py-0 rounded-[3px] hover:bg-sky-600">
            Accept All
          </button>
        </div>
      </div>
    </>
  );
}
