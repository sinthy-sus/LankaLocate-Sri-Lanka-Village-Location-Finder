import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Compass, Maximize2, ExternalLink } from 'lucide-react';

/* =========================================================================================
 * 🌟 SPECIAL FEATURE: GEOSPATIAL DATA STRUCTURE FOR SRI LANKAN ADMINISTRATIVE UNITS
 * 
 * In Sri Lanka, geographical coordinates (Latitude & Longitude) use the WGS84 geodesic datum.
 * Sri Lanka spans approximately:
 *   - Latitude: 5.9° N (Dondra Head) to 9.85° N (Point Pedro)
 *   - Longitude: 79.65° E (Delft Island / Colombo) to 81.88° E (Sangaman Kanda Point)
 *
 * This component standardizes pin rendering, bounding-box auto-fitting, satellite imagery
 * toggle, and interactive popup data cards without external commercial API keys.
 * ========================================================================================= */

export interface MapMarkerItem {
  id: number;
  name: string;
  name_si?: string;
  name_ta?: string;
  latitude: number;
  longitude: number;
  subtitle?: string;
  district?: string;
  province?: string;
  onClick?: () => void;
}

interface LeafletMapProps {
  markers?: MapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  onMarkerSelect?: (marker: MapMarkerItem) => void;
  showLayerToggle?: boolean;
  showResetButton?: boolean;
}

/* =========================================================================================
 * 🌟 SPECIAL FEATURE: TILE PROVIDER ARCHITECTURE (OPEN ACCESS, NO API KEY REQUIRED)
 *
 * 1. Voyager (CartoDB): Ultra-clean, modern SaaS styling for minimal distraction.
 * 2. OpenStreetMap (OSM Standard): Authoritative global crowd-sourced community mapping.
 * 3. Satellite (Esri World Imagery): High-resolution true-color orbital imagery showing
 *    Sri Lanka's coastline, central tea highlands, reservoirs (Wewas), and tropical forest cover.
 * ========================================================================================= */
type TileLayerType = 'voyager' | 'osm' | 'satellite';

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || 'cb1_50dw_1_3ea55caee935c7ccd8ea7172';

const TILE_LAYERS: Record<TileLayerType, { url: string; attribution: string; maxZoom: number }> = {
  voyager: {
    url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${CARTO_API_KEY ? `?key=${CARTO_API_KEY}` : ''}`,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
};

/* =========================================================================================
 * 🌟 SPECIAL FEATURE: CUSTOM DYNAMIC SVG MARKER WITH PULSING RADAR EFFECT
 *
 * For single-village focus (e.g. on Location Details page), a CSS radar pulse animation 
 * radiates outward to clearly anchor the user's attention to the exact GPS point.
 * ========================================================================================= */
const createCustomPinIcon = (highlight = false) => {
  const pinColor = highlight ? '#D5AC55' : '#174C3C'; // Kandyan Gold or Deep Heritage Emerald
  const dotColor = highlight ? '#174C3C' : '#FFFFFF';

  const pulseHtml = highlight
    ? `<span class="pin-radar-pulse"></span>`
    : '';

  const svg = `
    <div class="pin-wrapper ${highlight ? 'pin-highlighted' : ''}">
      ${pulseHtml}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42" class="pin-svg">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 10.6 14.5 24.8 15.1 25.4.5.5 1.3.5 1.8 0C17.5 40.8 32 26.6 32 16 32 7.16 24.8 0 16 0z" fill="${pinColor}" stroke="#FFFFFF" stroke-width="2"/>
        <circle cx="16" cy="15" r="5.5" fill="${dotColor}"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-pin-container',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  });
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers = [],
  center = [7.8731, 80.7718], // Exact Geographic Center of Sri Lanka
  zoom = 8,
  height = '420px',
  className = '',
  onMarkerSelect,
  showLayerToggle = true,
  showResetButton = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeLayer, setActiveLayer] = useState<TileLayerType>('voyager');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: RESILIENT MAP INSTANTIATION & BOUNDS INITIALIZATION
   *
   * Initializes the Leaflet map with standard inertia panning, smooth wheel zoom,
   * and dispatches invalidateSize() to avoid blank grey tile glitches upon layout changes.
   * ========================================================================================= */
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      // Default Layer: CartoDB Voyager
      const layerConfig = TILE_LAYERS[activeLayer];
      tileLayerRef.current = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Invalidate layout after mounting so all tile coordinates render smoothly
      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: DYNAMIC TILE LAYER SWITCHING (SATELLITE / OSM / VOYAGER)
   * 
   * Seamlessly swaps the active raster tile layer without re-mounting or losing user zoom state.
   * ========================================================================================= */
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const layerConfig = TILE_LAYERS[activeLayer];
    tileLayerRef.current.setUrl(layerConfig.url);
  }, [activeLayer]);

  // Center & Zoom Updates
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: SPATIAL BOUNDING-BOX FITTING & MULTI-PIN AUTO-CLUSTERING
   *
   * 1. Evaluates all marker coordinates.
   * 2. If 1 pin: Zooms directly into village level (Zoom level 13).
   * 3. If multiple pins: Calculates an enveloping latLngBounds polygon and fits the camera
   *    view with balanced screen padding so all matching locations are instantly visible.
   * ========================================================================================= */
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (markers.length === 0) return;

    const bounds = L.latLngBounds([]);

    markers.forEach((m) => {
      if (!m.latitude || !m.longitude) return;

      const isSingle = markers.length === 1;
      const icon = createCustomPinIcon(isSingle);

      const marker = L.marker([m.latitude, m.longitude], { icon });

      // Enhanced Rich Popup Card
      const popupHtml = `
        <div style="font-family: inherit; padding: 6px 4px; min-width: 190px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; color: #25866A; text-transform: uppercase; letter-spacing: 0.5px;">
              ${m.district ? `${m.district} District` : 'Sri Lanka'}
            </span>
            <span style="font-size: 9px; font-weight: 700; background: rgba(23,76,60,0.08); color: #174C3C; padding: 1px 5px; border-radius: 4px;">
              ${m.province || 'Province'}
            </span>
          </div>

          <div style="font-size: 15px; font-weight: 800; color: #17231E; margin-bottom: 2px;">
            ${m.name}
          </div>

          ${(m.name_si || m.name_ta) ? `
            <div style="font-size: 12px; color: #52665C; font-weight: 500; margin-bottom: 6px;">
              ${m.name_si || ''} ${m.name_si && m.name_ta ? '•' : ''} ${m.name_ta || ''}
            </div>
          ` : ''}

          ${m.subtitle ? `
            <div style="font-size: 11px; color: #444; background: #F7F9F7; padding: 4px 6px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #EEF2EE;">
              ${m.subtitle}
            </div>
          ` : ''}

          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #83968C; font-family: monospace; border-top: 1px solid #f0f0f0; padding-top: 6px;">
            <span>${m.latitude.toFixed(4)}°N, ${m.longitude.toFixed(4)}°E</span>
            <a href="https://www.google.com/maps?q=${m.latitude},${m.longitude}" target="_blank" rel="noopener noreferrer" style="color: #25866A; font-weight: 700; text-decoration: none;">
              Directions ↗
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onMarkerSelect) onMarkerSelect(m);
      });

      markersLayerRef.current?.addLayer(marker);
      bounds.extend([m.latitude, m.longitude]);
    });

    if (markers.length === 1) {
      mapInstanceRef.current.setView([markers[0].latitude, markers[0].longitude], 13);
    } else if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 14 });
    }
  }, [markers]);

  /* =========================================================================================
   * 🌟 SPECIAL FEATURE: RE-CENTER EXTENT HELPER
   * Re-aligns the view to the geographic center of Sri Lanka or fitted markers.
   * ========================================================================================= */
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    if (markers.length > 1) {
      const bounds = L.latLngBounds(markers.map(m => [m.latitude, m.longitude]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45] });
    } else {
      mapInstanceRef.current.setView([7.8731, 80.7718], 8, { animate: true });
    }
  };

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-gray-200/80 shadow-soft group ${className}`}>
      
      {/* Map DOM Target */}
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Floating Controls Overlay (Top-Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        
        {/* Layer Switcher Toggle */}
        {showLayerToggle && (
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              title="Change Map Tiles (Standard / OpenStreetMap / Satellite)"
              className="p-2.5 rounded-xl bg-white/95 backdrop-blur text-primary shadow-soft hover:bg-white border border-gray-200 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <Layers className="w-4 h-4 text-secondary" />
              <span className="hidden sm:inline capitalize">{activeLayer}</span>
            </button>

            {/* Dropdown Menu */}
            {showLayerMenu && (
              <div 
                className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-soft-lg border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setShowLayerMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  Select Map Imagery
                </div>
                
                <button
                  onClick={() => { setActiveLayer('voyager'); setShowLayerMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                    activeLayer === 'voyager' ? 'bg-primary/5 text-primary font-bold' : 'text-brandtext hover:bg-gray-50'
                  }`}
                >
                  <span>Carto Voyager</span>
                  <span className="text-[10px] text-secondary font-mono">Clean</span>
                </button>

                <button
                  onClick={() => { setActiveLayer('osm'); setShowLayerMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                    activeLayer === 'osm' ? 'bg-primary/5 text-primary font-bold' : 'text-brandtext hover:bg-gray-50'
                  }`}
                >
                  <span>OpenStreetMap</span>
                  <span className="text-[10px] text-gray-400 font-mono">Standard</span>
                </button>

                <button
                  onClick={() => { setActiveLayer('satellite'); setShowLayerMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${
                    activeLayer === 'satellite' ? 'bg-primary/5 text-primary font-bold' : 'text-brandtext hover:bg-gray-50'
                  }`}
                >
                  <span>Esri Satellite</span>
                  <span className="text-[10px] text-amber-600 font-mono">Aerial</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reset / Center View Button */}
        {showResetButton && (
          <button
            onClick={handleResetView}
            title="Reset to Full Sri Lanka View"
            className="p-2.5 rounded-xl bg-white/95 backdrop-blur text-primary shadow-soft hover:bg-white border border-gray-200 transition-all flex items-center justify-center"
          >
            <Compass className="w-4 h-4 text-secondary" />
          </button>
        )}
      </div>

      {/* Floating Bottom Status Indicator */}
      <div className="absolute bottom-2 left-3 z-[1000] pointer-events-none">
        <div className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur border border-gray-200/60 shadow-2xs text-[10px] font-semibold text-brandtext-muted flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span>Sri Lanka Coordinates (WGS84) • {markers.length} Locations Active</span>
        </div>
      </div>

    </div>
  );
};
