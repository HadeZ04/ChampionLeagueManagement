import React, { useState } from 'react';
import { ViewportSwitcher } from './ViewportSwitcher';
import { ActionButtons } from './ActionButtons';
import { CartModal } from './CartModal';

export function Header() {
  const [showCartModal, setShowCartModal] = useState(false);

  return (
    <header className="sticky items-center bg-slate-700 box-border caret-transparent flex h-[60px] pl-[30px] pr-[70px] py-2.5 top-0 inset-x-0">
      <a href="https://www.templatemonster.com/website-templates/striker-football-amp-sports-club-website-responsive-html-template-344047.html" className="text-blue-300 text-sm items-baseline box-border caret-transparent block leading-7 max-w-[45%] min-w-4 text-ellipsis text-nowrap overflow-hidden mr-0 md:mr-5 hover:text-white hover:border-white">
        <span className="border-r-blue-300 box-border caret-transparent inline-block h-0 text-nowrap w-0 mr-2.5 border-l-transparent border-r-[5px] border-y-transparent border-y-[5px] border-solid"></span>
        Striker - Football & Sports Club Website Responsive HTML Template
      </a>
      
      <ViewportSwitcher />
      <ActionButtons onCartClick={() => setShowCartModal(true)} />
      
      <CartModal 
        isVisible={showCartModal} 
        onClose={() => setShowCartModal(false)} 
      />
    </header>
  );
}
