import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const footerSections = [
  {
    title: 'Giải đấu',
    links: ['Cúp C1', 'Cúp C2', 'Cúp C3', 'Siêu cúp', 'Giải trẻ', 'Cúp C1 nữ']
  },
  {
    title: 'Đội tuyển quốc gia',
    links: ['Vô địch châu Âu', 'Giải các quốc gia', 'Vòng loại Cúp Thế giới', 'EURO nữ', 'Giải trẻ']
  },
  {
    title: 'Về UEFA',
    links: ['Bên trong UEFA', 'Quỹ UEFA', 'Phát triển bền vững', 'Liêm chính', 'Phát triển', 'Kỹ thuật']
  },
  {
    title: 'Dịch vụ',
    links: ['Cửa hàng', 'Vé', 'Bóng đá ảo', 'Trò chơi', 'Ứng dụng di động', 'Bản tin']
  }
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' }
];

const PublicFooter = () => {
  return (
    <footer className="relative border-t border-white/15 bg-transparent text-white/80 mt-16 backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#0055FF] via-[#00E5FF] to-[#8454FF]" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#0055FF] via-[#00E5FF] to-[#8454FF] flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="font-display text-xl tracking-[0.3em] text-white">CL</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">UEFA</p>
                <p className="text-2xl font-display tracking-[0.2em] text-white">Vũ trụ bóng đá</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Truy cập cao cấp tới lịch thi đấu, dữ liệu trực tiếp và trải nghiệm trận đấu sống động lấy cảm hứng từ những đêm Cúp C1 huyền thoại.
            </p>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#0055FF]" /> Route de Geneve 46, 1260 Nyon, Thụy Sĩ
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#00E5FF]" /> +41 848 00 27 27
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#8454FF]" /> info@uefa.com
              </div>
            </div>
          </div>
          {footerSections.map(section => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60 mb-4">{section.title}</h3>
              <ul className="space-y-2 text-sm text-white/80">
                {section.links.map(link => (
                  <li key={link}>
                    <a href="#" className="hover:text-[#0055FF] transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 glass-card p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-4">Theo dõi UEFA</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(social => (
                <a key={social.label} href={social.href} aria-label={social.label} className="h-11 w-11 rounded-full border border-white/15 flex items-center justify-center hover:border-[#0055FF] hover:text-[#0055FF] transition-colors">
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-4">Nhận cập nhật</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="email" placeholder="Địa chỉ email" className="uefa-input flex-1 border-white/15 focus:ring-[#0055FF]" />
              <button className="btn-glow whitespace-nowrap">Đăng ký</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs uppercase tracking-[0.3em] text-white/60">
          <p>(c) 2025 UEFA. Mọi quyền được bảo lưu.</p>
          <div className="flex flex-wrap gap-6">
            <a href="#" className="hover:text-[#0055FF]">Quyền riêng tư</a>
            <a href="#" className="hover:text-[#0055FF]">Điều khoản</a>
            <a href="#" className="hover:text-[#0055FF]">Tệp ghi nhớ</a>
            <a href="#" className="hover:text-[#0055FF]">Trợ năng</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
