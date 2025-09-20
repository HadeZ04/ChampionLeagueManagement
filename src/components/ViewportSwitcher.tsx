import React from 'react';

export function ViewportSwitcher() {
  return (
    <div className="absolute box-border caret-transparent hidden min-h-0 min-w-0 left-2/4 md:static md:flex md:min-h-[auto] md:min-w-[auto]">
      <button type="button" title="Mobile" className="text-black bg-transparent caret-transparent inline-block leading-[18.4px] min-h-0 min-w-0 text-center mx-1.5 p-0 md:block md:min-h-[auto] md:min-w-[auto]">
        <img src="https://c.animaapp.com/mf6gsfb8XDhIuB/assets/icon-1.svg" alt="Icon" className="box-border caret-transparent h-8 w-8" />
      </button>
      <button type="button" title="Tablet" className="text-black bg-transparent caret-transparent inline-block leading-[18.4px] min-h-0 min-w-0 text-center mx-1.5 p-0 md:block md:min-h-[auto] md:min-w-[auto]">
        <img src="https://c.animaapp.com/mf6gsfb8XDhIuB/assets/icon-2.svg" alt="Icon" className="box-border caret-transparent h-8 w-8" />
      </button>
      <button type="button" title="Desktop" className="text-black bg-transparent caret-transparent hidden leading-[18.4px] min-h-0 min-w-0 text-center mx-1.5 p-0 md:block md:min-h-[auto] md:min-w-[auto]">
        <img src="https://c.animaapp.com/mf6gsfb8XDhIuB/assets/icon-3.svg" alt="Icon" className="box-border caret-transparent h-8 w-8" />
      </button>
    </div>
  );
}
