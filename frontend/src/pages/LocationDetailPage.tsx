import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Layers, 
  Compass, 
  Building2, 
  Globe, 
  Copy, 
  Check, 
  Share2, 
  Bookmark, 
  ShieldCheck, 
  Navigation,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { LeafletMap } from '../components/map/LeafletMap';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { api } from '../services/api';
import { LocationHierarchy } from '../types';

export const LocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { isFavorite, addFavorite, removeFavorite, addRecentLocation } = useFavorites();
  const navigate = useNavigate();

  const [data, setData] = useState<LocationHierarchy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  useEffect(() => {
    async function fetchLocation() {
      if (!id) return;
      setIsLoading(true);
      try {
        const details = await api.getVillageById(Number(id));
        setData(details);
        addRecentLocation(details);
      } catch (err) {
        console.error('Error fetching location detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLocation();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-secondary space-y-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-sm font-semibold text-brandtext-muted">Loading administrative location details...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-accent mx-auto" />
        <h2 className="text-2xl font-bold text-primary">Location Not Found</h2>
        <p className="text-sm text-brandtext-muted">
          The requested village or administrative record could not be found.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
        >
          Return to Home Search
        </Link>
      </div>
    );
  }

  const { village, gn_division, ds_division, district, province, country, coordinates } = data;
  const fav = isFavorite(village.id);

  const handleCopyInfo = () => {
    const text = `LankaLocate – Administrative Hierarchy
Village / Locality: ${village.name_en} (${village.name_si} / ${village.name_ta})
GN Division: ${gn_division.name_en} (GN Code: ${gn_division.gn_code})
DS Division: ${ds_division.name_en}
District: ${district.name_en}
Province: ${province.name_en}
Country: Sri Lanka
Coordinates: ${coordinates.latitude ? `${coordinates.latitude}, ${coordinates.longitude}` : 'N/A'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCoordinates = () => {
    if (!coordinates.latitude || !coordinates.longitude) return;
    const text = `${coordinates.latitude}, ${coordinates.longitude}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${village.name_en} – LankaLocate`,
        text: `Administrative hierarchy of ${village.name_en} in ${district.name_en} District, Sri Lanka.`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mapMarker = coordinates.latitude && coordinates.longitude ? [{
    id: village.id,
    name: village.name_en,
    name_si: village.name_si,
    name_ta: village.name_ta,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    subtitle: `${ds_division.name_en} DS, ${district.name_en} District`,
    district: district.name_en,
    province: province.name_en,
  }] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb Navigation */}
      {data.breadcrumb && (
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-2xs">
          <Breadcrumb items={data.breadcrumb} />
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-soft space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-gray-100">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                Village / Locality
              </span>
              {village.is_verified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Public Record</span>
                </span>
              )}
              {village.postal_code && (
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                  Postal Code: {village.postal_code}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-primary tracking-tight font-sans">
                {village.name_en}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-base sm:text-lg text-brandtext-muted font-medium">
                {village.name_si && <span>සිංහල: {village.name_si}</span>}
                {village.name_si && village.name_ta && <span>•</span>}
                {village.name_ta && <span>தமிழ்: {village.name_ta}</span>}
              </div>
            </div>

            {village.notes && (
              <p className="text-xs sm:text-sm text-brandtext-muted max-w-2xl leading-relaxed pt-1">
                {village.notes}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => fav ? removeFavorite(village.id) : addFavorite(data)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                fav 
                  ? 'bg-accent/20 border-accent text-accent-dark' 
                  : 'bg-white border-gray-200 text-brandtext hover:bg-gray-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${fav ? 'fill-accent' : ''}`} />
              <span>{fav ? t('remove_favorite') : t('save_favorite')}</span>
            </button>

            <button
              onClick={handleCopyInfo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-brandtext text-xs font-bold transition-all shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-secondary" />}
              <span>{copied ? t('copied') : t('copy_info')}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-light text-xs font-bold transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-accent" />
              <span>{t('share_location')}</span>
            </button>
          </div>
        </div>

        {/* Administrative Hierarchy Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* GN Division */}
          <div className="bg-[#F7F9F7] p-5 rounded-2xl border border-gray-200/80 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>Grama Niladhari (GN)</span>
            </div>
            <div className="text-base font-bold text-brandtext">
              {gn_division.name_en}
            </div>
            <div className="text-xs text-brandtext-muted">
              {gn_division.name_si}
            </div>
            <div className="pt-2 border-t border-gray-200/60">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-secondary font-bold border border-gray-200">
                Code: {gn_division.gn_code}
              </span>
            </div>
          </div>

          {/* DS Division */}
          <div className="bg-[#F7F9F7] p-5 rounded-2xl border border-gray-200/80 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Divisional Secretariat</span>
            </div>
            <div className="text-base font-bold text-brandtext">
              {ds_division.name_en}
            </div>
            <div className="text-xs text-brandtext-muted">
              {ds_division.name_si}
            </div>
            <div className="pt-2 border-t border-gray-200/60">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-gray-600 font-bold border border-gray-200">
                Code: {ds_division.code}
              </span>
            </div>
          </div>

          {/* District */}
          <Link
            to={`/districts/${district.code}`}
            className="bg-[#F7F9F7] hover:bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-secondary transition-all space-y-2 group"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>District</span>
              </span>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-secondary group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-base font-bold text-brandtext group-hover:text-primary transition-colors">
              {district.name_en}
            </div>
            <div className="text-xs text-brandtext-muted">
              {district.name_si}
            </div>
            <div className="pt-2 border-t border-gray-200/60 text-[11px] font-semibold text-secondary">
              Explore District →
            </div>
          </Link>

          {/* Province */}
          <Link
            to={`/provinces/${province.code}`}
            className="bg-[#F7F9F7] hover:bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-secondary transition-all space-y-2 group"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Province</span>
              </span>
              <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-secondary group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-base font-bold text-brandtext group-hover:text-primary transition-colors">
              {province.name_en}
            </div>
            <div className="text-xs text-brandtext-muted">
              {province.name_si}
            </div>
            <div className="pt-2 border-t border-gray-200/60 text-[11px] font-semibold text-secondary">
              Explore Province →
            </div>
          </Link>

          {/* Country */}
          <div className="bg-[#F7F9F7] p-5 rounded-2xl border border-gray-200/80 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Country</span>
            </div>
            <div className="text-base font-bold text-brandtext">
              {country.name_en}
            </div>
            <div className="text-xs text-brandtext-muted">
              {country.name_si} / {country.name_ta}
            </div>
            <div className="pt-2 border-t border-gray-200/60">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-accent/20 text-[#8E6C18] uppercase">
                LK / LKA
              </span>
            </div>
          </div>

        </div>

        {/* Coordinates Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-xs font-bold text-brandtext">
                {t('coordinates')}
              </div>
              <div className="text-xs font-mono text-brandtext-muted font-semibold mt-0.5">
                {coordinates.latitude && coordinates.longitude
                  ? `${coordinates.latitude.toFixed(6)}° N, ${coordinates.longitude.toFixed(6)}° E`
                  : 'Coordinates pending survey geocoding'}
              </div>
            </div>
          </div>

          {coordinates.latitude && coordinates.longitude && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCoordinates}
                className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-[#F7F9F7] hover:bg-gray-100 text-xs font-semibold text-brandtext flex items-center gap-1.5 transition-colors"
              >
                {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoords ? 'Coordinates Copied!' : 'Copy Coords'}</span>
              </button>
              <a
                href={`https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-[#F7F9F7] hover:bg-gray-100 text-xs font-semibold text-brandtext flex items-center gap-1.5 transition-colors"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map Section */}
      {coordinates.latitude && coordinates.longitude && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary font-sans flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" />
              <span>Map Location of {village.name_en}</span>
            </h2>
            <span className="text-xs text-brandtext-muted font-mono font-medium">
              OpenStreetMap + Leaflet
            </span>
          </div>

          <LeafletMap
            markers={mapMarker}
            center={[coordinates.latitude, coordinates.longitude]}
            zoom={13}
            height="420px"
          />
        </div>
      )}

      {/* Identical Village Names Section */}
      {data.identical_name_villages && data.identical_name_villages.length > 0 && (
        <div className="bg-amber-50/70 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-soft space-y-4">
          <div>
            <h3 className="text-lg font-bold text-amber-950 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent-dark" />
              <span>{t('other_villages_same_name')} &ldquo;{village.name_en}&rdquo;</span>
            </h3>
            <p className="text-xs text-amber-900/80 mt-1">
              In Sri Lanka, multiple distinct villages share the same historic name across different administrative districts:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {data.identical_name_villages.map((item) => (
              <Link
                key={item.id}
                to={`/locations/${item.id}`}
                className="bg-white p-4 rounded-xl border border-amber-200 hover:border-primary shadow-2xs transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-brandtext group-hover:text-primary transition-colors">
                    {item.name_en}
                  </h4>
                  <p className="text-xs text-brandtext-muted mt-0.5">
                    {item.ds_name_en} DS, {item.district_name_en} District
                  </p>
                  <span className="text-[10px] font-bold text-secondary uppercase">
                    {item.province_name_en}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sibling Villages in Same DS Division */}
      {data.sibling_villages && data.sibling_villages.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-soft space-y-4">
          <div>
            <h3 className="text-lg font-bold text-primary font-sans">
              {t('nearby_villages')} ({ds_division.name_en})
            </h3>
            <p className="text-xs text-brandtext-muted mt-0.5">
              Other localities situated under the administrative jurisdiction of {ds_division.name_en} Divisional Secretariat:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {data.sibling_villages.map((item) => (
              <Link
                key={item.id}
                to={`/locations/${item.id}`}
                className="p-4 rounded-xl border border-gray-200/80 hover:border-secondary bg-[#F7F9F7] hover:bg-white shadow-2xs transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-brandtext group-hover:text-primary transition-colors">
                    {item.name_en}
                  </h4>
                  <p className="text-xs text-brandtext-muted mt-0.5">
                    GN: {item.gn_name_en} ({item.gn_code})
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
