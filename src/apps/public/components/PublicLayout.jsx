import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import LiveTicker from './LiveTicker';

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        {/* Outlet là nơi các trang con sẽ được render */}
        <Outlet />
      </main>
      <PublicFooter />
      <LiveTicker />
    </div>
  );
};

export default PublicLayout;