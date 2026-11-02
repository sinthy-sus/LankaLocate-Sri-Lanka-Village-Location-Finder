import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Copy, 
  Check, 
  Share2, 
  Bookmark, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Map as MapIcon,
  List,
  Columns
} from 'lucide-react';
import { SearchBar } from '../components/common/SearchBar';
import { LeafletMap, MapMarkerItem } from '../components/map/LeafletMap';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { api } from '../services/api';
import { LocationHierarchy, Province } from '../types';

/* =========================================================================================
 * 🌟 SPECIAL FEATURE: DUAL-VIEW GEOGRAPHICAL SEARCH RESOLVER
 *
 * In Sri Lanka, many localities share identical names (e.g. Aluthgama, Pitiyagedara, Bope).
 * When a user searches for such a place, seeing the results ONLY in a list can still leave
 * spatial ambiguity.
 *
 * This component implements an integrated Leaflet Map directly on the Search Results page
 * supporting:
 *   1. "List View" (Structured administrative cards with breadcrumbs)
 *   2. "Split View" (Live side-by-side card feed + synchronized Sri Lanka Leaflet Map)
 *   3. "Full Map View" (Expansive geospatial exploration of all search matches)
 * ========================================================================================= */

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t } = useLanguage();
  const { isFavorite, addFavorite, removeFavorite, addRecentLocation } = useFavorites();
  const navigate = useNavigate();

  const [results, setResults] = useState<LocationHierarchy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // View Mode: 'split' | 'list' | 'map'
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');

  // Filters
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<number | undefined>(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>(undefined);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: ASYNCHRONOUS NATIONAL PROVINCIAL REGISTRY SYNC
   * Loads all 9 provinces to populate the contextual filter dropdown.
   * ========================================================================================= */
  useEffect(() => {
    async function fetchProvinces() {
      try {
        const provs = await api.getProvinces();
        setProvinces(provs);
      } catch (err) {
        console.error('Error fetching provinces:', err);
      }
    }
    fetchProvinces();
  }, []);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: MULTI-TIER SEARCH QUERY DISPATCHER
   * Queries the backend API which executes case-insensitive, partial, and multilingual
   * SQL queries matching English, Sinhala, and Tamil names.
   * ========================================================================================= */
  useEffect(() => {
    async function doSearch() {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await api.search(query.trim(), selectedProvince, selectedDistrict);
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    doSearch();
  }, [query, selectedProvince, selectedDistrict]);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: SPATIAL MARKER TRANSFORMER FOR SEARCH RESULTS
   * Converts matching administrative entities with verified coordinates into Leaflet markers.
   * ========================================================================================= */
  const mapMarkers: MapMarkerItem[] = results
    .filter(r => r.coordinates.latitude && r.coordinates.longitude)
    .map(r => ({
      id: r.village.id,
      name: r.village.name_en,
      name_si: r.village.name_si,
      name_ta: r.village.name_ta,
      latitude: r.coordinates.latitude!,
      longitude: r.coordinates.longitude!,
      subtitle: `${r.ds_division.name_en} DS, ${r.district.name_en} District`,
      district: r.district.name_en,
      province: r.province.name_en,
    }));

  const handleCopy = (loc: LocationHierarchy, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `${loc.village.name_en} (${loc.village.name_si} / ${loc.village.name_ta})
GN Division: ${loc.gn_division.name_en} (${loc.gn_division.gn_code})
DS Division: ${loc.ds_division.name_en}
District: ${loc.district.name_en}
Province: ${loc.province.name_en}
Country: Sri Lanka
Coordinates: ${loc.coordinates.latitude ? `${loc.coordinates.latitude}, ${loc.coordinates.longitude}` : 'N/A'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(loc.village.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (loc: LocationHierarchy, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/locations/${loc.village.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${loc.village.name_en} – LankaLocate`,
        text: `Administrative location of ${loc.village.name_en} in ${loc.district.name_en} District, Sri Lanka.`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedId(loc.village.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleFavorite = (loc: LocationHierarchy, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(loc.village.id)) {
      removeFavorite(loc.village.id);
    } else {
      addFavorite(loc);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-soft">
        <SearchBar initialQuery={query} size="default" showRecentTags={false} />
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-soft space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-secondary" />
                <span>Filters</span>
              </span>
              {(selectedProvince || selectedDistrict) && (
                <button
                  onClick={() => {
                    setSelectedProvince(undefined);
                    setSelectedDistrict(undefined);
                  }}
                  className="text-[11px] font-semibold text-secondary hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Province Filter */}
            <div>
              <label className="block text-xs font-semibold text-brandtext mb-2">
                Filter by Province
              </label>
              <select
                value={selectedProvince || ''}
                onChange={(e) => setSelectedProvince(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-gray-200 bg-[#F7F9F7] text-brandtext outline-none focus:border-secondary transition-colors"
              >
                <option value="">All 9 Provinces</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_en} ({p.name_si})
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div>
              <label className="block text-xs font-semibold text-brandtext mb-2">
                Display Layout
              </label>
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'split' ? 'bg-white text-primary shadow-2xs' : 'text-gray-500 hover:text-brandtext'
                  }`}
                  title="Side-by-side List and Map"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Split</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white text-primary shadow-2xs' : 'text-gray-500 hover:text-brandtext'
                  }`}
                  title="List Only"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded-lg transition-colors ${
                    viewMode === 'map' ? 'bg-white text-primary shadow-2xs' : 'text-gray-500 hover:text-brandtext'
                  }`}
                  title="Full Map Only"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>
            </div>

            {/* Information Notice */}
            <div className="p-3 bg-secondary/5 rounded-2xl border border-secondary/15 text-xs text-brandtext-muted leading-relaxed">
              <div className="flex items-center gap-1 font-bold text-secondary mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Geospatial Disambiguation</span>
              </div>
              All matching villages are plotted on the map. Notice how duplicate village names appear in completely separate districts.
            </div>
          </div>
        </aside>

        {/* Right Search Results Column */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary font-sans">
                Search Results for &ldquo;{query}&rdquo;
              </h1>
              <p className="text-xs text-brandtext-muted mt-0.5">
                {isLoading ? 'Searching verified database...' : `${results.length} ${t('results_found')}`}
              </p>
            </div>

            {/* Quick Status Pill */}
            {!isLoading && results.length > 0 && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-primary/10 text-primary self-start sm:self-auto">
                {mapMarkers.length} mapped on OpenStreetMap
              </span>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-secondary space-y-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold text-brandtext-muted">Searching verified administrative database...</span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && results.length === 0 && (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-gray-200 shadow-soft max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-primary">
                {t('no_results_title')}
              </h3>
              <p className="text-xs sm:text-sm text-brandtext-muted leading-relaxed">
                {t('no_results_desc')}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-gray-400">Try searching for:</span>
                <button
                  onClick={() => navigate('/search?q=Hikkaduwa')}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-brandtext font-medium"
                >
                  Hikkaduwa
                </button>
                <button
                  onClick={() => navigate('/search?q=Aluthgama')}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-brandtext font-medium"
                >
                  Aluthgama
                </button>
                <button
                  onClick={() => navigate('/search?q=Kandy')}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-brandtext font-medium"
                >
                  Kandy
                </button>
                <button
                  onClick={() => navigate('/search?q=Unawatuna')}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-brandtext font-medium"
                >
                  Unawatuna
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================================
           * 🌟 SPECIAL FEATURE: INTEGRATED SEARCH RESULTS MAP
           * Plotted markers for all current search results with auto-pan and popup interaction.
           * ========================================================================================= */}
          {!isLoading && results.length > 0 && (viewMode === 'split' || viewMode === 'map') && (
            <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-soft space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <MapIcon className="w-4 h-4 text-secondary" />
                  <span>Interactive Search Results Map</span>
                </div>
                <span className="text-[11px] text-brandtext-muted">
                  Click any pin to inspect village hierarchy
                </span>
              </div>

              <LeafletMap
                markers={mapMarkers}
                height={viewMode === 'map' ? '560px' : '360px'}
                onMarkerSelect={(m) => navigate(`/locations/${m.id}`)}
              />
            </div>
          )}

          {/* Results List View */}
          {!isLoading && results.length > 0 && viewMode !== 'map' && (
            <div className="space-y-4">
              {results.map((item) => {
                const fav = isFavorite(item.village.id);
                const isCopied = copiedId === item.village.id;

                return (
                  <div
                    key={`${item.village.id}-${item.gn_division.id}`}
                    onClick={() => {
                      addRecentLocation(item);
                      navigate(`/locations/${item.village.id}`);
                    }}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-soft-lg hover:border-secondary/50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      {/* Left: Names & Hierarchy */}
                      <div className="space-y-3 flex-1">
                        
                        {/* Title & Badges */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-bold text-brandtext group-hover:text-primary transition-colors">
                            {item.village.name_en}
                          </h2>
                          {item.village.name_si && (
                            <span className="text-sm font-semibold text-brandtext-muted">
                              ({item.village.name_si})
                            </span>
                          )}
                          {item.village.name_ta && (
                            <span className="text-sm font-semibold text-brandtext-muted">
                              ({item.village.name_ta})
                            </span>
                          )}

                          {item.village.is_verified && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}

                          {item.village.postal_code && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                              Postal: {item.village.postal_code}
                            </span>
                          )}
                        </div>

                        {/* Hierarchical Breadcrumb Trail */}
                        <div className="flex items-center flex-wrap gap-1.5 text-xs text-brandtext-muted font-medium bg-[#F7F9F7] p-2.5 rounded-xl border border-gray-100">
                          <span className="font-semibold text-primary">
                            {item.province.name_en}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-brandtext">
                            {item.district.name_en} District
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {item.ds_division.name_en} DS
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-secondary font-semibold">
                            GN: {item.gn_division.name_en} ({item.gn_division.gn_code})
                          </span>
                        </div>

                        {/* Notes if available */}
                        {item.village.notes && (
                          <p className="text-xs text-brandtext-muted line-clamp-2">
                            {item.village.notes}
                          </p>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <div className="flex items-center gap-1">
                          <button
                            title="Add to Favorites"
                            onClick={(e) => handleToggleFavorite(item, e)}
                            className={`p-2 rounded-xl border transition-colors ${
                              fav 
                                ? 'bg-accent/20 border-accent text-accent-dark' 
                                : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-brandtext hover:bg-gray-100'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${fav ? 'fill-accent' : ''}`} />
                          </button>

                          <button
                            title="Copy Administrative Information"
                            onClick={(e) => handleCopy(item, e)}
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-primary transition-colors"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>

                          <button
                            title="Share Location"
                            onClick={(e) => handleShare(item, e)}
                            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-primary transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all mt-1">
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
