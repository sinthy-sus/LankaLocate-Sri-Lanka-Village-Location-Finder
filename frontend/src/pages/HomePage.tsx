import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Compass, 
  Layers, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Globe2, 
  Navigation, 
  Database,
  Building2,
  Bookmark
} from 'lucide-react';
import { SearchBar } from '../components/common/SearchBar';
import { LeafletMap, MapMarkerItem } from '../components/map/LeafletMap';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { api } from '../services/api';
import { PlatformStats } from '../types';

export const HomePage: React.FC = () => {
  const { t, getName, language } = useLanguage();
  const { recentLocations } = useFavorites();
  const navigate = useNavigate();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [mapMarkers, setMapMarkers] = useState<MapMarkerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, mapLocations] = await Promise.all([
          api.getStats(),
          api.getMapLocations(25),
        ]);
        setStats(statsData);

        const markers: MapMarkerItem[] = mapLocations.map(l => ({
          id: l.village_id,
          name: l.name_en,
          name_si: l.name_si,
          name_ta: l.name_ta,
          latitude: l.latitude,
          longitude: l.longitude,
          subtitle: `${l.ds_name_en} DS, ${l.district_name_en}`,
          district: l.district_name_en,
          province: l.province_name_en,
        }));
        setMapMarkers(markers);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-[#EEF4F0] via-[#F7F9F7] to-[#F7F9F7]">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#174C3C_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/15 animate-in fade-in slide-in-from-top-3 duration-300">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>{t('verified_data_badge')}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary tracking-tight font-sans leading-[1.15] mb-5">
            Discover Every Place <br className="hidden sm:inline" />
            in <span className="text-secondary relative underline decoration-accent/60 decoration-wavy">Sri Lanka</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-brandtext-muted max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            {t('hero_subtitle')}
          </p>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar size="large" autoFocus={false} showRecentTags={true} />
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs font-semibold text-brandtext-muted">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Multilingual (EN / සිංහල / தமிழ்)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Full GN & DS Administrative Chain</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span>Identical Village Names Resolved</span>
            </div>
          </div>

        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5">
          
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Compass className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary">
                {stats?.provinces || 9}
              </div>
              <div className="text-xs font-semibold text-brandtext-muted">
                {t('stats_provinces')}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <Layers className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-secondary">
                {stats?.districts || 25}
              </div>
              <div className="text-xs font-semibold text-brandtext-muted">
                {t('stats_districts')}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-[#9E771D] shrink-0">
              <Building2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#9E771D]">
                {stats?.ds_divisions || 331}+
              </div>
              <div className="text-xs font-semibold text-brandtext-muted">
                {t('stats_ds_divisions')}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 shrink-0">
              <Database className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-800">
                {stats?.gn_divisions || 14000}+
              </div>
              <div className="text-xs font-semibold text-brandtext-muted">
                {t('stats_gn_divisions')}
              </div>
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">
              <Navigation className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                {stats?.villages || 'Verified'}
              </div>
              <div className="text-xs font-semibold text-brandtext-muted">
                {t('stats_villages')}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Map Preview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                <Globe2 className="w-4 h-4" />
                <span>Geospatial Coverage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary font-sans">
                Explore the Administrative Map of Sri Lanka
              </h2>
              <p className="text-sm text-brandtext-muted mt-1">
                Click any pin to inspect village details, Divisional Secretariat boundaries, and coordinates.
              </p>
            </div>

            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold transition-colors shadow-sm self-start md:self-auto shrink-0"
            >
              <span>Open Fullscreen Map</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <LeafletMap 
            markers={mapMarkers} 
            height="460px" 
            zoom={8}
            onMarkerSelect={(m) => navigate(`/locations/${m.id}`)}
          />
        </div>
      </section>

      {/* Popular Districts Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary font-sans">
              {t('popular_districts')}
            </h2>
            <p className="text-sm text-brandtext-muted mt-1">
              {t('popular_districts_desc')}
            </p>
          </div>
          <Link
            to="/districts"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-primary transition-colors"
          >
            <span>View All 25 Districts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.popular_districts.map((d) => (
            <Link
              key={d.id}
              to={`/districts/${d.code}`}
              className="group bg-white p-6 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-soft-lg hover:border-secondary/40 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
                    {d.province_name_en}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {d.code}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-brandtext group-hover:text-primary transition-colors flex items-baseline gap-2">
                  <span>{d.name_en}</span>
                  {d.name_si && (
                    <span className="text-sm font-normal text-brandtext-muted font-sans">
                      ({d.name_si})
                    </span>
                  )}
                </h3>

                <p className="text-xs text-brandtext-muted mt-2">
                  Home to {d.ds_count} verified Divisional Secretariats and major economic, coastal or cultural landmarks.
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-brandtext">
                  {d.ds_count} DS Divisions
                </span>
                <span className="flex items-center gap-1 font-bold text-secondary group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Explored Locations Section */}
      {recentLocations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-primary font-sans flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-accent" />
              <span>{t('recent_searches')}</span>
            </h2>
            <Link
              to="/favorites"
              className="text-xs font-bold text-secondary hover:text-primary transition-colors"
            >
              <span>View Saved Favorites</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentLocations.map((item) => (
              <Link
                key={item.id}
                to={`/locations/${item.id}`}
                className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs hover:shadow-soft hover:border-primary/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brandtext">
                      {item.name_en}
                    </h4>
                    <p className="text-[11px] text-brandtext-muted">
                      {item.district_name_en} District, {item.province_name_en}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Authority Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-soft-lg">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-accent text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guaranteed Integrity</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Grounded in Verified Sri Lankan Administrative Hierarchy
            </h3>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              LankaLocate never invents administrative relationships. Every entry connects faithfully through Grama Niladhari division, Divisional Secretariat, District, and Province as defined by official Sri Lankan government authorities.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/about"
                className="px-5 py-2.5 rounded-xl bg-accent text-primary font-bold text-xs hover:bg-accent-light transition-colors shadow-sm"
              >
                Learn About Administrative Structure
              </Link>
              <Link
                to="/map"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20"
              >
                Explore Interactive Map
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
