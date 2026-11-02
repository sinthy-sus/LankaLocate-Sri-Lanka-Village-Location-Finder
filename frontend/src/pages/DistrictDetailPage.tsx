import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, Building2, MapPin, ArrowRight, Loader2, Navigation } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { LeafletMap } from '../components/map/LeafletMap';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { District } from '../types';

export const DistrictDetailPage: React.FC = () => {
  const { codeOrId } = useParams<{ codeOrId: string }>();
  const { t } = useLanguage();

  const [district, setDistrict] = useState<District | null>(null);
  const [dsDivisions, setDsDivisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!codeOrId) return;
      setIsLoading(true);
      try {
        const data = await api.getDistrictDetail(codeOrId);
        setDistrict(data.district);
        setDsDivisions(data.ds_divisions);
      } catch (err) {
        console.error('Error loading district detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [codeOrId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-secondary space-y-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-sm font-semibold text-brandtext-muted">Loading district information...</span>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">District Not Found</h2>
        <Link to="/districts" className="text-xs font-bold text-secondary">
          Return to All Districts
        </Link>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Provinces', path: '/provinces' },
    { label: district.province_name_en || 'Province', path: `/provinces/${district.province_code}` },
    { label: `${district.name_en} District`, path: `/districts/${district.code}`, current: true },
  ];

  const mapMarkers = dsDivisions
    .filter(ds => ds.latitude && ds.longitude)
    .map(ds => ({
      id: ds.id,
      name: `${ds.name_en} DS`,
      name_si: ds.name_si,
      name_ta: ds.name_ta,
      latitude: ds.latitude!,
      longitude: ds.longitude!,
      subtitle: `${ds.gn_count || 0} GN Divisions`,
      district: district.name_en,
      province: district.province_name_en,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div className="bg-white px-4 py-2 rounded-xl border border-gray-200/80 shadow-2xs">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                {district.code}
              </span>
              <span className="text-xs font-bold text-secondary">
                {district.province_name_en}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-primary mt-2 font-sans">
              {district.name_en} District
            </h1>
            <p className="text-base sm:text-lg text-brandtext-muted mt-1 font-medium">
              {district.name_si} • {district.name_ta}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/search?q=${encodeURIComponent(district.name_en)}`}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold transition-colors shadow-sm"
            >
              Search Villages in {district.name_en}
            </Link>
          </div>
        </div>

        {district.latitude && district.longitude && (
          <div className="pt-2">
            <LeafletMap
              markers={mapMarkers}
              center={[district.latitude, district.longitude]}
              zoom={10}
              height="360px"
            />
          </div>
        )}
      </div>

      {/* Divisional Secretariat (DS) Divisions Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-sans flex items-center gap-2">
            <Building2 className="w-6 h-6 text-secondary" />
            <span>Divisional Secretariats ({dsDivisions.length} Divisions)</span>
          </h2>
          <p className="text-xs sm:text-sm text-brandtext-muted mt-0.5">
            The sub-district administrative divisions under the Ministry of Public Administration in {district.name_en} District.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dsDivisions.map((ds) => (
            <div
              key={ds.id}
              className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-soft-lg transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {ds.code}
                </span>
                <span className="text-[11px] font-semibold text-secondary">
                  {ds.gn_count || 0} GN Divisions
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-brandtext">
                  {ds.name_en}
                </h3>
                <p className="text-xs text-brandtext-muted mt-0.5">
                  {ds.name_si} • {ds.name_ta}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/search?q=${encodeURIComponent(ds.name_en)}`}
                  className="text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span>Search Villages</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
