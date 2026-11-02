import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Heart, ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#17231E] text-white/80 pt-16 pb-12 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-primary font-bold">
                <MapPin className="w-5 h-5 text-primary stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Lanka<span className="text-accent">Locate</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-white/60">
              A modern, reliable geographical and administrative locator platform for Sri Lanka. Discover villages, Grama Niladhari divisions, and Divisional Secretariats.
            </p>
            <div className="flex items-center gap-2 text-xs text-accent">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Grounded in Official Public Datasets</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">Search Locations</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-accent transition-colors">Interactive Map</Link>
              </li>
              <li>
                <Link to="/provinces" className="hover:text-accent transition-colors">9 Provinces</Link>
              </li>
              <li>
                <Link to="/districts" className="hover:text-accent transition-colors">25 Districts</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-accent transition-colors">Saved Favorites</Link>
              </li>
            </ul>
          </div>

          {/* Verified Sources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Data Authorities
            </h4>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                <span>Dept. of Census & Statistics</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                <span>Survey Department Sri Lanka</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                <span>Ministry of Public Administration</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-secondary" />
                <span>OpenStreetMap Contributors</span>
              </li>
            </ul>
          </div>

          {/* Administrative Hierarchy Summary */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Administrative Tier
            </h4>
            <div className="space-y-2 text-xs bg-white/5 p-3.5 rounded-xl border border-white/10">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60">Country:</span>
                <span className="font-semibold text-white">Sri Lanka (LK)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60">Provinces:</span>
                <span className="font-semibold text-accent">9 Provinces</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60">Districts:</span>
                <span className="font-semibold text-accent">25 Districts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-white/60">Divisional Secretariats:</span>
                <span className="font-semibold text-white">331+ Divisions</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-white/60">Grama Niladhari:</span>
                <span className="font-semibold text-white">14,022 Divisions</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} LankaLocate. Built with pride for Sri Lanka.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-accent transition-colors">About System</Link>
            <Link to="/admin" className="hover:text-accent transition-colors">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
