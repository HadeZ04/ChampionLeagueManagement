import React from 'react';

export function LiveChat() {
  return (
    <div className="fixed box-border caret-transparent h-[344px] max-h-full max-w-full w-[254px] z-[2147483639] overflow-hidden right-[35px] bottom-0 md:h-[169px] md:w-[279px]">
      <iframe 
        name="chat-widget-minimized" 
        title="LiveChat chat widget" 
        className="box-border caret-transparent h-full w-full"
      />
      <div className="absolute box-border caret-transparent h-px text-nowrap w-px overflow-hidden -m-px"></div>
      <div className="absolute box-border caret-transparent h-px text-nowrap w-px overflow-hidden -m-px"></div>
    </div>
  );
}
