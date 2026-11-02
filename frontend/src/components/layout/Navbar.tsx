import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MapPin, 
  Map, 
  Compass, 
  Layers, 
  Bookmark, 
  Info, 
  ShieldCheck, 
  Menu, 
  X, 
  Globe 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { Language } from '../../types';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { favorites } = useFavorites();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const navLinks = [
    { name: t('nav_home'), path: '/', icon: Compass },
    { name: t('nav_explore'), path: '/map', icon: Map },
    { name: t('nav_districts'), path: '/districts', icon: Layers },
    { name: t('nav_provinces'), path: '/provinces', icon: MapPin },
    { name: t('nav_favorites'), path: '/favorites', icon: Bookmark, badge: favorites.length },
    { name: t('nav_about'), path: '/about', icon: Info },
  ];

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'si', label: 'Sinhala', native: 'සිංහල' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#EEF2EE] shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
              <MapPin className="w-5 h-5 text-accent stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-primary font-sans">
                  Lanka<span className="text-secondary">Locate</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-[#8E6C18] uppercase tracking-wider">
                  LK
                </span>
              </div>
              <p className="text-[11px] text-brandtext-muted hidden sm:block -mt-0.5 font-medium">
                Sri Lanka Location Finder
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-brandtext-muted hover:text-primary hover:bg-[#F7F9F7]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-brandtext-muted'}`} />
                  <span>{link.name}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-accent text-primary">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Language Selector & Admin */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-[#F7F9F7] text-xs font-semibold text-brandtext transition-colors"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-secondary" />
                <span className="uppercase">{language}</span>
                <span className="text-gray-400 text-[10px]">▼</span>
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-soft-lg border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        language === l.code
                          ? 'bg-primary/5 text-primary font-bold'
                          : 'text-brandtext hover:bg-gray-50'
                      }`}
                    >
                      <span>{l.native}</span>
                      {language === l.code && <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Portal Button */}
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-muted hover:bg-gray-200/80 text-xs font-semibold text-primary transition-colors border border-gray-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>{t('nav_admin')}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-2 rounded-lg border border-gray-200 text-xs font-bold uppercase text-brandtext"
            >
              {language}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brandtext hover:bg-gray-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-primary/10 text-primary font-semibold' : 'text-brandtext hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-secondary" />
                  <span>{link.name}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-accent text-primary">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between px-2">
            <div className="flex gap-2">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-semibold ${
                    language === l.code ? 'bg-primary text-white' : 'bg-gray-100 text-brandtext'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted text-xs font-bold text-primary"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
