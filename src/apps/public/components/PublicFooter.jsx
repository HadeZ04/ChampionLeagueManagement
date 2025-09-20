import React from 'react'
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

const PublicFooter = () => {
  const footerSections = [
    {
      title: 'Competitions',
      links: [
        'Champions League',
        'Europa League',
        'Conference League',
        'Super Cup',
        'Youth League',
        'Women\'s Champions League',
        'Futsal Champions League'
      ]
    },
    {
      title: 'National Teams',
      links: [
        'European Championship',
        'Nations League',
        'World Cup Qualifiers',
        'Youth Championships',
        'Women\'s Euro',
        'Futsal Euro'
      ]
    },
    {
      title: 'About UEFA',
      links: [
        'Inside UEFA',
        'UEFA Foundation',
        'HatTrick',
        'Sustainability',
        'Integrity',
        'Development',
        'Technical'
      ]
    },
    {
      title: 'Services',
      links: [
        'Store',
        'Tickets',
        'Fantasy Football',
        'Gaming',
        'Mobile Apps',
        'Newsletter',
        'RSS Feeds'
      ]
    }
  ]

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ]

  return (
    <footer className="bg-uefa-dark text-white">
      {/* Main Footer Content */}
      <div className="uefa-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* UEFA Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-uefa-blue to-uefa-light-blue rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" fill="white"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-xl">UEFA</div>
                <div className="text-uefa-gray text-sm">Union of European Football Associations</div>
              </div>
            </div>
            <p className="text-uefa-gray text-sm leading-relaxed mb-6">
              UEFA is the governing body of European football and organizes some of the most famous and prestigious football competitions on the European continent.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-uefa-gray">
                <MapPin size={16} />
                <span>Route de Genève 46, 1260 Nyon, Switzerland</span>
              </div>
              <div className="flex items-center space-x-2 text-uefa-gray">
                <Phone size={16} />
                <span>+41 848 00 27 27</span>
              </div>
              <div className="flex items-center space-x-2 text-uefa-gray">
                <Mail size={16} />
                <span>info@uefa.com</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-white font-bold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-uefa-gray hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media and Newsletter */}
        <div className="border-t border-uefa-gray/20 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Follow UEFA:</span>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 bg-uefa-gray/20 rounded-full text-uefa-gray hover:text-white hover:bg-uefa-blue transition-all duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Stay Updated:</span>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-uefa-gray/20 border border-uefa-gray/30 rounded-l-md text-white placeholder-uefa-gray focus:outline-none focus:ring-2 focus:ring-uefa-blue"
                />
                <button className="px-6 py-2 bg-uefa-blue hover:bg-uefa-dark text-white rounded-r-md font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-uefa-black">
        <div className="uefa-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-uefa-gray">
              <span>© 2025 UEFA. All rights reserved.</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            </div>
            <div className="flex items-center space-x-4 text-sm text-uefa-gray">
              <span>Available on:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-uefa-gray/20 rounded flex items-center justify-center">
                  <span className="text-xs">📱</span>
                </div>
                <div className="w-8 h-8 bg-uefa-gray/20 rounded flex items-center justify-center">
                  <span className="text-xs">🍎</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
