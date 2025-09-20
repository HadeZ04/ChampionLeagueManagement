import React, { useState } from 'react';
import { cookieCategories, CookieCategory } from '../data/cookieData';

interface CookieSettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

type CookiePreferences = {
  necessary: boolean;
  analytical: boolean;
  advertising: boolean;
};

export function CookieSettings({ isVisible, onClose }: CookieSettingsProps) {
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>({
    necessary: true,
    analytical: false,
    advertising: false,
  });

  const handleToggle = (category: keyof CookiePreferences) => {
    if (category === 'necessary') return; // Necessary cookies cannot be disabled
    
    setCookiePreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAcceptAll = () => {
    setCookiePreferences({
      necessary: true,
      analytical: true,
      advertising: true,
    });
    onClose();
  };

  const handleSaveSettings = () => {
    // Save preferences logic would go here
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="box-border caret-transparent hidden">
      <div className="fixed bg-white box-border caret-transparent flex flex-col h-full justify-between max-h-[550px] w-full z-[2147483647] overflow-auto rounded-none top-0 inset-x-0 md:h-[900px] md:w-[800px] md:rounded-md md:left-2/4 md:right-auto md:top-2/4">
        <span className="absolute box-border caret-transparent block h-5 w-5 right-2.5 top-2.5 md:hidden before:accent-auto before:bg-gray-800 before:box-border before:caret-transparent before:text-gray-800 before:block before:text-base before:not-italic before:normal-nums before:font-normal before:h-[3px] before:tracking-[normal] before:leading-6 before:list-outside before:list-disc before:absolute before:text-start before:indent-[0px] before:normal-case before:visible before:w-full before:rounded-sm before:border-separate before:top-2/4 before:font-system_ui after:accent-auto after:bg-gray-800 after:box-border after:caret-transparent after:text-gray-800 after:block after:text-base after:not-italic after:normal-nums after:font-normal after:h-[3px] after:tracking-[normal] after:leading-6 after:list-outside after:list-disc after:absolute after:text-start after:indent-[0px] after:normal-case after:visible after:w-full after:rounded-sm after:border-separate after:top-2/4 after:font-system_ui" onClick={onClose}></span>
        
        <div className="box-border caret-transparent py-5">
          <div className="box-border caret-transparent px-5">
            <p className="text-2xl font-bold box-border caret-transparent leading-8 text-center mb-5">Cookie Files Settings</p>
            <p className="text-lg font-bold box-border caret-transparent text-left mb-2.5">About cookie files</p>
            <p className="text-[15px] box-border caret-transparent leading-5 text-left mb-5">
              We use cookies to provide you with access to all website features as well as to analyze, personalize, and improve user experience. In this block, you can change the cookie files settings or accept all of them by default. In order to get a better understanding of what cookie files are and how they are used on our website, please read our{' '}
              <a href="https://www.templatemonster.com/privacy-policy.php" className="text-sky-500 font-bold box-border caret-transparent inline-block underline hover:no-underline">privacy policy</a>.
            </p>
          </div>
          
          <div className="relative box-border caret-transparent flex flex-col">
            {cookieCategories.map((category: CookieCategory) => (
              <div key={category.id} className="relative bg-white shadow-[rgba(30,36,39,0.15)_0px_4px_10px_0px] box-border caret-transparent flex flex-col mx-5 my-2.5 p-[15px] rounded-md">
                <p className="relative font-bold box-border caret-transparent leading-[22px] text-left pl-5 pr-10">
                  <i className="absolute italic box-border caret-transparent block border-gray-800 p-[3px] border-r-2 border-b-2 border-solid left-0 top-[5px]"></i>
                  {category.title}
                </p>
                <label aria-label={category.title} className="box-border caret-transparent block">
                  <input 
                    type="checkbox" 
                    className={category.id === 'necessary' ? "text-neutral-600 bg-transparent box-border caret-transparent hidden leading-[18.4px] p-0" : "text-black bg-transparent box-border caret-transparent hidden leading-[18.4px] p-0"}
                    checked={cookiePreferences[category.id]}
                    onChange={() => handleToggle(category.id)}
                    disabled={category.id === 'necessary'}
                  />
                  <i className={category.id === 'necessary' ? "absolute text-gray-300 italic bg-gray-300 caret-transparent block h-5 min-h-5 min-w-5 w-5 border-gray-300 rounded-[3px] border-2 border-solid right-5 top-3 before:accent-auto before:caret-transparent before:text-white before:block before:text-base before:italic before:normal-nums before:font-normal before:h-3 before:tracking-[normal] before:leading-6 before:list-outside before:list-disc before:absolute before:text-start before:indent-[0px] before:normal-case before:visible before:w-1.5 before:rounded-[1px] before:border-r-2 before:border-b-2 before:border-separate before:border-white before:left-1.5 before:top-px before:font-system_ui" : "absolute text-gray-300 italic bg-green-600 caret-transparent block h-5 min-h-5 min-w-5 w-5 border-green-600 rounded-[3px] border-2 border-solid right-5 top-3 before:accent-auto before:caret-transparent before:text-white before:block before:text-base before:italic before:normal-nums before:font-normal before:h-3 before:tracking-[normal] before:leading-6 before:list-outside before:list-disc before:absolute before:text-start before:indent-[0px] before:normal-case before:visible before:w-1.5 before:rounded-[1px] before:border-r-2 before:border-b-2 before:border-separate before:border-white before:left-1.5 before:top-px before:font-system_ui"}></i>
                </label>
                <p className="text-[15px] box-border caret-transparent hidden leading-5 text-left mt-3">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-sky-100 box-border caret-transparent flex flex-col justify-between p-5 rounded-b-md md:flex-row">
          <button className="text-white text-sm items-center bg-slate-400 caret-transparent flex h-10 justify-center leading-5 min-w-[150px] text-left mb-5 px-2.5 py-0 rounded-[3px] md:mb-0 hover:bg-slate-500" onClick={handleSaveSettings}>
            Save Settings
          </button>
          <button className="text-white text-sm items-center bg-sky-500 caret-transparent flex h-10 justify-center leading-5 min-w-[150px] text-left px-2.5 py-0 rounded-[3px] hover:bg-sky-600" onClick={handleAcceptAll}>
            <i className="relative italic box-border caret-transparent block shrink-0 h-3.5 top-[-3px] w-2 ml-1.5 mr-2.5 rounded-[1px] border-r-2 border-b-2 border-white"></i>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
