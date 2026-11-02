import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Search, MapPin, Building2, ArrowRight, Loader2, Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { District, Province } from '../types';

export const DistrictsPage: React.FC = () => {
  const { t } = useLanguage();
  const [districts, setDistricts] = useState<District[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [distList, provList] = await Promise.all([
          api.getDistricts(),
          api.getProvinces(),
        ]);
        setDistricts(distList);
        setProvinces(provList);
      } catch (err) {
        console.error('Error loading districts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredDistricts = districts.filter(d => {
    if (selectedProvinceId && d.province_id !== selectedProvinceId) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchEn = d.name_en.toLowerCase().includes(q);
      const matchSi = d.name_si.includes(q);
      const matchTa = d.name_ta.includes(q);
      const matchCode = d.code.toLowerCase().includes(q);
      return matchEn || matchSi || matchTa || matchCode;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span>Second-Order Administrative Tier</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-primary font-sans">
          {t('all_districts')}
        </h1>
        <p className="text-sm sm:text-base text-brandtext-muted leading-relaxed">
          The 25 administrative districts of Sri Lanka serve as the primary operational units for regional governance, statistical census, and public administration.
        </p>
      </div>

      {/* Search & Province Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_district_placeholder')}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-[#F7F9F7] text-xs sm:text-sm text-brandtext outline-none focus:border-secondary transition-colors"
            />
          </div>

          <div className="sm:w-64">
            <select
              value={selectedProvinceId || ''}
              onChange={(e) => setSelectedProvinceId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-[#F7F9F7] text-xs sm:text-sm text-brandtext outline-none focus:border-secondary font-medium"
            >
              <option value="">All Provinces (9)</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name_en} ({p.name_si})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Province Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          <button
            onClick={() => setSelectedProvinceId(undefined)}
            className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-colors ${
              selectedProvinceId === undefined 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-brandtext hover:bg-gray-200'
            }`}
          >
            All (25)
          </button>
          {provinces.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProvinceId(p.id)}
              className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-colors ${
                selectedProvinceId === p.id 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-brandtext hover:bg-gray-200'
              }`}
            >
              {p.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center text-secondary space-y-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-semibold text-brandtext-muted">Loading 25 districts...</span>
        </div>
      )}

      {/* Grid of Districts */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDistricts.map((d) => (
            <Link
              key={d.id}
              to={`/districts/${d.code}`}
              className="group bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-soft-lg hover:border-secondary/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary uppercase tracking-wider">
                    {d.province_name_en}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {d.code}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-brandtext group-hover:text-primary transition-colors">
                    {d.name_en}
                  </h3>
                  <p className="text-xs text-brandtext-muted mt-0.5">
                    {d.name_si} • {d.name_ta}
                  </p>
                </div>

                <div className="text-xs text-brandtext-muted space-y-1 pt-1">
                  <div>Capital: <strong className="text-brandtext">{d.capital_en}</strong></div>
                  {d.area_sq_km && <div>Area: <strong>{d.area_sq_km.toLocaleString()} km²</strong></div>}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-secondary">
                  {d.ds_count || 0} DS Divisions
                </span>
                <span className="flex items-center gap-1 font-bold text-secondary group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};
