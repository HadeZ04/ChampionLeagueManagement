import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, ArrowRight } from 'lucide-react';

const footerLinks = {
  competitions: [
    { name: 'Champions League', to: '/standings' },
    { name: 'Lịch thi đấu', to: '/matches' },
    { name: 'Đội bóng', to: '/teams' },
    { name: 'Thống kê', to: '/stats' },
  ],
  about: [
    { name: 'Về chúng tôi', to: '#' },
    { name: 'Liên hệ', to: '#' },
    { name: 'Điều khoản', to: '#' },
    { name: 'Quyền riêng tư', to: '#' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

const PublicFooter = () => {
  return (
    <footer className="relative mt-20">
      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Main footer content */}
      <div className="backdrop-blur-xl bg-white/[0.03] border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white font-bold text-lg">CL</span>
                </div>
                <div>
                  <p className="text-white font-bold text-xl">Champions League</p>
                  <p className="text-white/50 text-sm">UEFA Official</p>
                </div>
              </div>
              
              <p className="text-white/60 text-sm leading-relaxed max-w-md">
                Trải nghiệm đỉnh cao bóng đá châu Âu với lịch thi đấu trực tiếp, 
                thống kê chi tiết và cập nhật mới nhất từ giải đấu danh giá nhất thế giới.
              </p>

              {/* Newsletter */}
              <div className="space-y-3">
                <p className="text-white/80 text-sm font-medium">Đăng ký nhận tin</p>
                <div className="flex gap-2 max-w-sm">
                  <input 
                    type="email" 
                    placeholder="Email của bạn" 
                    className="flex-1 px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-white/40 text-sm focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"
                  />
                  <button className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2">
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Links Column 1 */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
                Khám phá
              </h4>
              <ul className="space-y-3">
                {footerLinks.competitions.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.to} 
                      className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group"
                    >
                      {link.name}
                      <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Links Column 2 */}
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-6">
                Thông tin
              </h4>
              <ul className="space-y-3">
                {footerLinks.about.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.to} 
                      className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-2 group"
                    >
                      {link.name}
                      <ArrowRight size={12} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06]">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <p className="text-white/40 text-sm">
                © 2025 UEFA Champions League. All rights reserved.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition-all"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
