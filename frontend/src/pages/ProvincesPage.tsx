import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Layers, Building2, MapPin, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Province } from '../types';

export const ProvincesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProvinces() {
      try {
        const data = await api.getProvinces();
        setProvinces(data);
      } catch (err) {
        console.error('Error loading provinces:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProvinces();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-secondary space-y-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-sm font-semibold text-brandtext-muted">Loading Sri Lanka Provinces...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>Top-Level First Order Administrative Tier</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-primary font-sans">
          {t('all_provinces')}
        </h1>
        <p className="text-sm sm:text-base text-brandtext-muted leading-relaxed">
          Sri Lanka is divided into 9 administrative provinces, each governing multiple districts and divisional secretariat divisions under the 13th Amendment.
        </p>
      </div>

      {/* Grid of 9 Provinces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {provinces.map((p) => (
          <Link
            key={p.id}
            to={`/provinces/${p.code}`}
            className="group bg-white p-7 rounded-3xl border border-gray-200/80 shadow-soft hover:shadow-soft-lg hover:border-secondary/50 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                  Code: {p.code}
                </span>
                <span className="text-xs font-semibold text-brandtext-muted">
                  Capital: <strong className="text-brandtext">{p.capital_en}</strong>
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-brandtext group-hover:text-primary transition-colors">
                  {p.name_en}
                </h3>
                <div className="flex items-center gap-2 text-sm text-brandtext-muted mt-1">
                  <span>{p.name_si}</span>
                  <span>•</span>
                  <span>{p.name_ta}</span>
                </div>
              </div>

              {p.area_sq_km && (
                <p className="text-xs text-brandtext-muted">
                  Total Geographic Area: <strong className="text-brandtext">{p.area_sq_km.toLocaleString()} km²</strong>
                </p>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#F7F9F7] p-2.5 rounded-xl">
                  <div className="text-lg font-bold text-primary">
                    {p.district_count || 0}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-brandtext-muted">
                    Districts
                  </div>
                </div>

                <div className="bg-[#F7F9F7] p-2.5 rounded-xl">
                  <div className="text-lg font-bold text-secondary">
                    {p.ds_count || 0}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-brandtext-muted">
                    DS Divisions
                  </div>
                </div>

                <div className="bg-[#F7F9F7] p-2.5 rounded-xl">
                  <div className="text-lg font-bold text-[#8E6C18]">
                    {p.village_count || 0}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-brandtext-muted">
                    Villages
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-secondary group-hover:text-primary pt-1">
                <span>Explore Districts & Villages</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
};
