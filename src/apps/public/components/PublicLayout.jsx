import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import LiveTicker from './LiveTicker';
import heroVideo from '@/assets/videos/hero-bg.mp4';

const PublicLayout = () => {
  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <video
        className="public-video-bg"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="fixed inset-x-0 top-0 h-1 bg-[var(--gradient-border)] z-40" />
      <div className="absolute inset-0 z-0 opacity-45 pointer-events-none public-layout-overlay" aria-hidden="true" />
      <div className="relative min-h-screen overflow-hidden z-10">
        <div className="floating-blob -top-24 -left-10 opacity-60" style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08), transparent 70%)' }} />
        <div className="floating-blob top-1/3 -right-32 opacity-50" style={{ animationDelay: '6s', background: 'radial-gradient(circle, rgba(0,116,240,0.12), transparent 70%)' }} />
        <div className="floating-blob bottom-0 left-1/3 opacity-40" style={{ animationDelay: '12s', background: 'radial-gradient(circle, rgba(250,204,21,0.18), transparent 70%)' }} />
        <PublicHeader />
        <main className="relative z-10 flex-1 pt-8 pb-32 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
            <Outlet />
          </div>
        </main>
        <PublicFooter />
        <LiveTicker />
      </div>
    </div>
  );
};

export default PublicLayout;
