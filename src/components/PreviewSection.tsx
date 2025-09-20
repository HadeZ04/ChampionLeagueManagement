import React from 'react';

export function PreviewSection() {
  return (
    <section className="box-border caret-transparent flex">
      <div className="shadow-none box-border caret-transparent w-[785px] border-gray-800 m-0 border-0 border-none md:shadow-[rgba(45,57,75,0.1)_0px_14px_24px_0px] md:border md:mx-auto md:my-[50px] md:border-solid md:border-white">
        <iframe 
          src="https://uiparadox.co.uk/templates/striker/v3/" 
          title="Preview Template" 
          className="box-border caret-transparent h-[400px] min-h-[940px] w-full md:min-h-[1024px]"
        />
      </div>
    </section>
  );
}
