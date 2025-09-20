import React from 'react';

interface ActionButtonsProps {
  onCartClick: () => void;
}

export function ActionButtons({ onCartClick }: ActionButtonsProps) {
  return (
    <div className="items-center box-border caret-transparent flex ml-auto">
      <div className="relative box-border caret-transparent flex justify-center">
        <button type="button" className="text-white text-[0px] items-center bg-green-600 caret-transparent flex justify-center leading-[18px] min-w-[auto] text-center text-nowrap ml-[30px] px-[30px] py-[11px] rounded-[3px] md:text-sm md:min-w-40 hover:bg-green-700">
          <img src="https://c.animaapp.com/mf6gsfb8XDhIuB/assets/icon-4.svg" alt="Icon" className="text-[0px] box-border caret-transparent h-5 text-nowrap w-5 mr-0 md:text-sm md:mr-2.5" />
          Add to Cart
        </button>
      </div>
      
      <a href="https://www.templatemonster.com/monsterone/tm-membership/?id=344047" className="text-[0px] items-center bg-white box-border caret-transparent hidden leading-[18px] min-h-0 min-w-0 text-nowrap ml-[30px] px-5 py-[11px] rounded-[3px] md:text-sm md:flex md:min-h-[auto] md:min-w-[auto] hover:text-white hover:bg-sky-500 hover:border-white">
        <img src="https://c.animaapp.com/mf6gsfb8XDhIuB/assets/icon-5.svg" alt="Icon" className="text-[0px] box-border caret-transparent block h-[18px] text-nowrap w-[18px] mr-0 md:text-sm md:hidden md:mr-2" />
        Get Unlimited Downloads
      </a>
      
      <div aria-label="Cart" title="Cart" className="relative text-gray-400 text-sm items-center box-border caret-transparent flex fill-slate-300 leading-[21px] ml-[15px] px-[15px] py-5 hover:text-white hover:border-white">
        <img src="https://c.animaapp.com/mf6gsfb8XDhIuB/assets/icon-6.svg" alt="Icon" className="box-border caret-transparent h-[22px] w-[22px]" />
        <button type="button" aria-label="cart" className="absolute bg-transparent caret-transparent block fill-slate-300 leading-[16.1px] text-center z-[2] p-0 inset-0" onClick={onCartClick}></button>
      </div>
      
      <div className="box-border caret-transparent">
        <button type="button" title="Hide Panel" className="fixed text-black bg-slate-700 border-b-slate-400/60 border-l-slate-400/60 border-r-slate-400/60 caret-transparent block h-[50px] leading-[18.4px] text-center w-10 z-[25] p-0 rounded-b-[3px] border-t-0 border-b border-l border-r right-2.5 top-0">
          <span className="border-b-slate-400 box-border caret-transparent inline-block h-0 w-0 border-t-transparent border-b-[7px] border-x-transparent border-x-8 border-solid"></span>
        </button>
      </div>
    </div>
  );
}
