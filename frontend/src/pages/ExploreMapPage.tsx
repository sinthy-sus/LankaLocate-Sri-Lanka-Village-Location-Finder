import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  X, 
  ArrowRight, 
  Copy, 
  Check, 
  Share2, 
  Bookmark, 
  ShieldCheck,
  Compass,
  ExternalLink,
  Layers,
  Filter
} from 'lucide-react';
import { LeafletMap, MapMarkerItem } from '../components/map/LeafletMap';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import { api } from '../services/api';

/* =========================================================================================
 * 🌟 SPECIAL FEATURE: NATIONAL INTERACTIVE GEOSPATIAL EXPLORER
 *
 * Sri Lanka contains 9 Provinces and 25 Administrative Districts with terrain varying from
 * coastal sandbars to central mountainous tea elevations exceeding 2,500 meters.
 *
 * This component delivers an interactive spatial viewer that enables users to:
 *   1. Search across verified places directly within the viewport.
 *   2. Filter pins instantly by Province (Western, Central, Southern, Northern, etc.).
 *   3. Switch seamlessly between CartoDB Voyager, OpenStreetMap, and Esri Satellite.
 *   4. Inspect any selected village with full GN/DS administrative metadata.
 *   5. Jump directly into Google Maps directions with accurate GPS decimal coordinates.
 * ========================================================================================= */

const PROVINCES_SHORT = [
  { code: 'ALL', label: 'All Island' },
  { code: 'WP', label: 'Western' },
  { code: 'CP', label: 'Central' },
  { code: 'SP', label: 'Southern' },
  { code: 'NP', label: 'Northern' },
  { code: 'EP', label: 'Eastern' },
  { code: 'NWP', label: 'North Western' },
  { code: 'NCP', label: 'North Central' },
  { code: 'UP', label: 'Uva' },
  { code: 'SBP', label: 'Sabaragamuwa' },
];

export const ExploreMapPage: React.FC = () => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const navigate = useNavigate();

  const [locations, setLocations] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: HIGH-DENSITY LOCATION DATA STREAMING
   * Fetches verified villages equipped with coordinates from the backend SQLite/PostgreSQL store.
   * ========================================================================================= */
  useEffect(() => {
    async function loadMapData() {
      try {
        const data = await api.getMapLocations(400);
        setLocations(data);
        if (data.length > 0) {
          setSelectedLocation(data[0]);
        }
      } catch (err) {
        console.error('Error loading map locations:', err);
      }
    }
    loadMapData();
  }, []);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: DUAL-CRITERIA REAL-TIME SPATIAL FILTERING
   * Simultaneously filters pins based on:
   *   1. Text search (English, Sinhala, Tamil, District, or DS Division name).
   *   2. Selected Administrative Province (Western, Southern, Northern, etc.).
   * ========================================================================================= */
  const filtered = locations.filter(l => {
    // 1. Province Match
    if (selectedProvince !== 'ALL') {
      const matchProv = l.province_name_en?.toLowerCase().includes(
        PROVINCES_SHORT.find(p => p.code === selectedProvince)?.label.toLowerCase() || ''
      );
      if (!matchProv) return false;
    }

    // 2. Text Search Match
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      l.name_en.toLowerCase().includes(q) ||
      (l.name_si && l.name_si.includes(q)) ||
      (l.name_ta && l.name_ta.includes(q)) ||
      l.district_name_en.toLowerCase().includes(q) ||
      l.ds_name_en.toLowerCase().includes(q)
    );
  });

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: CONVERT RAW DB ROWS TO LEAFLET MARKERS
   * ========================================================================================= */
  const markers: MapMarkerItem[] = filtered.map(l => ({
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

  const handleMarkerSelect = (marker: MapMarkerItem) => {
    const loc = locations.find(l => l.village_id === marker.id);
    if (loc) {
      setSelectedLocation(loc);
    }
  };

  const handleCopy = () => {
    if (!selectedLocation) return;
    const text = `${selectedLocation.name_en} (${selectedLocation.name_si || ''} / ${selectedLocation.name_ta || ''})
GN: ${selectedLocation.gn_name_en} (${selectedLocation.gn_code})
DS: ${selectedLocation.ds_name_en}
District: ${selectedLocation.district_name_en}
Province: ${selectedLocation.province_name_en}
Coordinates: ${selectedLocation.latitude}, ${selectedLocation.longitude}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fav = selectedLocation ? isFavorite(selectedLocation.village_id) : false;

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col">
      
      {/* Top Floating Spatial Search & Province Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-2xl mx-auto sm:mx-0 sm:left-6 space-y-2">
        
        {/* Search Bar */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-soft-lg border border-gray-200 p-2.5 flex items-center gap-2">
          <Search className="w-4 h-4 text-secondary ml-2 shrink-0" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search on map (e.g., Hikkaduwa, Galle, Kandy, Jaffna)..."
            className="w-full bg-transparent text-xs sm:text-sm text-brandtext outline-none font-medium placeholder:text-gray-400"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="p-1 text-gray-400 hover:text-brandtext"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">
            {filtered.length} locations
          </span>
        </div>

        {/* Province Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs bg-white/90 backdrop-blur p-1.5 rounded-2xl border border-gray-200/80 shadow-2xs">
          {PROVINCES_SHORT.map((p) => (
            <button
              key={p.code}
              onClick={() => setSelectedProvince(p.code)}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors ${
                selectedProvince === p.code
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-brandtext-muted hover:bg-gray-100 hover:text-brandtext'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

      </div>

      {/* Fullscreen Map Canvas */}
      <div className="flex-1 w-full relative">
        <LeafletMap
          markers={markers}
          center={selectedLocation ? [selectedLocation.latitude, selectedLocation.longitude] : [7.8731, 80.7718]}
          zoom={selectedLocation ? 10 : 8}
          height="calc(100vh - 4.5rem)"
          onMarkerSelect={handleMarkerSelect}
          className="rounded-none border-none shadow-none"
        />

        {/* Selected Location Details Card (Floating Bottom/Right) */}
        {selectedLocation && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-20 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="bg-white/95 backdrop-blur rounded-3xl p-5 shadow-soft-lg border border-gray-200 space-y-4">
              
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary uppercase">
                      {selectedLocation.district_name_en} District
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {selectedLocation.province_name_en}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-brandtext mt-1">
                    {selectedLocation.name_en}
                  </h3>
                  <div className="text-xs text-brandtext-muted font-medium">
                    {selectedLocation.name_si} • {selectedLocation.name_ta}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLocation(null)}
                  className="p-1 rounded-full text-gray-400 hover:text-brandtext hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Administrative Hierarchy summary */}
              <div className="space-y-1.5 text-xs bg-[#F7F9F7] p-3 rounded-2xl border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-brandtext-muted">GN Division:</span>
                  <span className="font-semibold text-brandtext">{selectedLocation.gn_name_en} ({selectedLocation.gn_code})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brandtext-muted">DS Division:</span>
                  <span className="font-semibold text-brandtext">{selectedLocation.ds_name_en}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brandtext-muted">GPS Coordinates:</span>
                  <span className="font-mono text-[11px] text-secondary font-semibold">
                    {selectedLocation.latitude?.toFixed(4)}°N, {selectedLocation.longitude?.toFixed(4)}°E
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={handleCopy}
                  title="Copy Administrative Information"
                  className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-brandtext flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <a
                  href={`https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-primary transition-colors"
                  title="Open in Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => navigate(`/locations/${selectedLocation.village_id}`)}
                  className="flex-1 py-2 px-4 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};
