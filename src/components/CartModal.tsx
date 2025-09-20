import React from 'react';

interface CartModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CartModal({ isVisible, onClose }: CartModalProps) {
  if (!isVisible) return null;

  return (
    <div className="relative box-border caret-transparent hidden z-[100]">
      <div className="fixed bg-stone-900/90 box-border caret-transparent z-[130] inset-0"></div>
      <div className="fixed bg-white box-border caret-transparent flex flex-wrap h-full max-h-[760px] max-w-[90%] min-h-[560px] w-[1280px] z-[132] overflow-auto pl-5 pr-2.5 pt-[30px] pb-[25px] rounded-md left-[5%] top-5 md:flex-nowrap md:w-screen md:overflow-visible md:left-2/4 md:top-2/4 after:md:accent-auto after:md:bg-slate-100 after:md:box-border after:md:caret-transparent after:md:text-gray-800 after:md:block after:md:text-base after:md:not-italic after:md:normal-nums after:md:font-normal after:md:tracking-[normal] after:md:leading-6 after:md:list-outside after:md:list-disc after:md:absolute after:md:text-start after:md:indent-[0px] after:md:normal-case after:md:visible after:md:w-[calc(35%_-_5px)] after:md:z-[1] after:md:rounded-r-md after:md:border-separate after:md:right-0 after:md:inset-y-0 after:md:font-system_ui">
        <div className="relative box-border caret-transparent shrink-0 max-h-none w-full overflow-hidden md:max-h-[785px] md:w-[65%]">
          <h3 className="text-xl font-bold box-border caret-transparent leading-6 mb-[15px] md:text-2xl md:leading-7">Recommended Customization Services for This Product</h3>
          <div className="relative box-border caret-transparent max-h-none overflow-auto pr-2.5 md:max-h-[655px]">
            <ul className="box-border caret-transparent pl-0"></ul>
          </div>
        </div>
        
        <div className="relative box-border caret-transparent flex flex-col shrink-0 -order-1 w-full z-[2] overflow-auto pl-0 pr-2.5 md:order-none md:w-[calc(35%_-_5px)] md:pl-5">
          <div className="text-2xl font-bold box-border caret-transparent leading-7 mb-[15px]">You added to cart</div>
          <div className="fixed bg-white shadow-[rgba(0,0,0,0.15)_0px_4px_14px_0px] box-border caret-transparent hidden w-[90%] z-[1] pt-2.5 px-5 rounded-md left-[5%] top-5">
            <div className="items-center box-border caret-transparent flex basis-[0%] flex-col grow shrink-0 justify-start my-5 md:[align-items:normal]">
              <div className="box-border caret-transparent w-full md:w-auto">
                <div className="bg-white box-border caret-transparent hidden text-center mb-5 pt-2.5 pb-0 px-5 rounded-[3px] md:block md:text-right md:mb-[30px] md:pb-2.5">
                  <span className="text-xl box-border caret-transparent leading-[26px] text-center mr-2.5 md:text-right">Subtotal:</span>
                  <span className="text-xl font-bold box-border caret-transparent leading-[26px] text-center md:text-right">
                    <span className="box-border caret-transparent text-center md:text-right">$0</span>
                  </span>
                </div>
                <div className="items-center box-border caret-transparent flex flex-col justify-center">
                  <button className="text-white items-center bg-orange-600 caret-transparent flex h-[50px] justify-center leading-10 min-w-[200px] text-center text-nowrap w-full mb-5 p-2.5 rounded-[3px] md:min-w-0 md:px-[35px] hover:bg-red-600">Go To Cart</button>
                </div>
              </div>
              <span className="text-sky-500 text-sm items-center box-border caret-transparent flex h-[50px] justify-center leading-10 min-w-[200px] text-center text-nowrap w-full border border-sky-500 px-5 rounded-[3px] border-solid md:w-auto hover:text-blue-800 hover:border-blue-800">Continue Shopping</span>
            </div>
            <div className="text-lg font-bold box-border caret-transparent leading-[26px] text-center mb-[15px] md:text-2xl md:leading-7 md:text-start">Recommended Customization Services for This Product</div>
          </div>
        </div>
        
        <div className="fixed box-border caret-transparent h-5 w-5 right-[5%] top-0 md:absolute md:h-[26px] md:top-[-38px] md:w-[26px] md:right-1 before:accent-auto before:bg-gray-400 before:box-border before:caret-transparent before:text-gray-800 before:block before:text-base before:not-italic before:normal-nums before:font-normal before:h-[3px] before:tracking-[normal] before:leading-6 before:list-outside before:list-disc before:absolute before:text-start before:indent-[0px] before:normal-case before:visible before:w-full before:rounded-sm before:border-separate before:top-2/4 before:font-system_ui after:accent-auto after:bg-gray-400 after:box-border after:caret-transparent after:text-gray-800 after:block after:text-base after:not-italic after:normal-nums after:font-normal after:h-[3px] after:tracking-[normal] after:leading-6 after:list-outside after:list-disc after:absolute after:text-start after:indent-[0px] after:normal-case after:visible after:w-full after:rounded-sm after:border-separate after:top-2/4 after:font-system_ui" onClick={onClose}></div>
      </div>
    </div>
  );
}
