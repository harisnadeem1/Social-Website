
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Twitter, Instagram, Facebook } from 'lucide-react';

const PublicFooter = () => {
  const footerLinks = {
    Company: [
      { name: 'About Us', path: '/about' },
      { name: 'Blog', path: '/blog' },
      { name: 'Careers', path: '/careers' },
      { name: 'Contact', path: '/contact' },
    ],
    Legal: [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms & Conditions', path: '/terms-and-conditions' },
      { name: 'Cookie Policy', path: '/cookie-policy' },
    ],
    Support: [
      { name: 'Safety Tips', path: '/safety-tips' },
      { name: 'Community Guidelines', path: '/community-guidelines' },
      { name: 'FAQ', path: '/faq' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1 mb-6 lg:mb-0">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Heart className="w-8 h-8 text-pink-500" />
              <span className="text-2xl font-bold">Liebenly</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Connecting hearts, one match at a time. Find your love story with us.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-gray-200 mb-4 tracking-wider uppercase text-sm">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-gray-400 hover:text-pink-400 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 sm:mb-0">
            &copy; {new Date().getFullYear()} Liebenly. All rights reserved.
          </p>
          <div className="flex space-x-5">
            <a href="#" className="text-gray-500 hover:text-pink-400 transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-pink-400 transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-gray-500 hover:text-pink-400 transition-colors"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
  