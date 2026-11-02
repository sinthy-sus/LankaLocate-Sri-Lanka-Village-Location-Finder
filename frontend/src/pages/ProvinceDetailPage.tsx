import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, Layers, Building2, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { LeafletMap } from '../components/map/LeafletMap';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Province, District } from '../types';

export const ProvinceDetailPage: React.FC = () => {
  const { codeOrId } = useParams<{ codeOrId: string }>();
  const { t } = useLanguage();

  const [province, setProvince] = useState<Province | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      if (!codeOrId) return;
      setIsLoading(true);
      try {
        const data = await api.getProvinceDetail(codeOrId);
        setProvince(data.province);
        setDistricts(data.districts);
      } catch (err) {
        console.error('Error loading province detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [codeOrId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-secondary space-y-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-sm font-semibold text-brandtext-muted">Loading province information...</span>
      </div>
    );
  }

  if (!province) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">Province Not Found</h2>
        <Link to="/provinces" className="text-xs font-bold text-secondary">
          Return to All Provinces
        </Link>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Provinces', path: '/provinces' },
    { label: province.name_en, path: `/provinces/${province.code}`, current: true },
  ];

  const mapMarkers = districts
    .filter(d => d.latitude && d.longitude)
    .map(d => ({
      id: d.id,
      name: `${d.name_en} District`,
      name_si: d.name_si,
      name_ta: d.name_ta,
      latitude: d.latitude!,
      longitude: d.longitude!,
      subtitle: `${d.ds_count || 0} DS Divisions`,
      district: d.name_en,
      province: province.name_en,
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
                {province.code}
              </span>
              <span className="text-xs font-semibold text-brandtext-muted">
                Provincial Capital: <strong className="text-brandtext">{province.capital_en} ({province.capital_si})</strong>
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-primary mt-2 font-sans">
              {province.name_en}
            </h1>
            <p className="text-base sm:text-lg text-brandtext-muted mt-1 font-medium">
              {province.name_si} • {province.name_ta}
            </p>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="bg-[#F7F9F7] px-4 py-3 rounded-2xl border border-gray-200/60">
              <div className="text-2xl font-extrabold text-primary">{districts.length}</div>
              <div className="text-[10px] uppercase font-bold text-brandtext-muted">Districts</div>
            </div>
          </div>
        </div>

        {province.latitude && province.longitude && (
          <div className="pt-2">
            <LeafletMap
              markers={mapMarkers}
              center={[province.latitude, province.longitude]}
              zoom={9}
              height="340px"
            />
          </div>
        )}
      </div>

      {/* Districts in this Province */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-sans flex items-center gap-2">
            <Layers className="w-6 h-6 text-secondary" />
            <span>Districts in {province.name_en}</span>
          </h2>
          <p className="text-xs sm:text-sm text-brandtext-muted mt-0.5">
            Select a district to browse its Divisional Secretariats and local villages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {districts.map((d) => (
            <Link
              key={d.id}
              to={`/districts/${d.code}`}
              className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-soft-lg hover:border-secondary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {d.code}
                  </span>
                  <span className="text-xs text-brandtext-muted">
                    Capital: <strong>{d.capital_en}</strong>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-brandtext group-hover:text-primary transition-colors">
                  {d.name_en}
                </h3>
                <p className="text-xs text-brandtext-muted mt-0.5">
                  {d.name_si} • {d.name_ta}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-brandtext">
                  {d.ds_count || 0} DS Divisions
                </span>
                <span className="flex items-center gap-1 font-bold text-secondary group-hover:translate-x-1 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};
