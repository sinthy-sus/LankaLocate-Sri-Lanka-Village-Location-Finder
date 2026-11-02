import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Layers, 
  Building2, 
  Database, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet, 
  ArrowRight,
  ShieldCheck,
  Loader2 
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      try {
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-sans">
              System Administration Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-brandtext-muted mt-1">
              Monitor national administrative datasets, coordinate integrity, and manage geographical records.
            </p>
          </div>

          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center text-secondary space-y-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold text-brandtext-muted">Loading administrative statistics...</span>
            </div>
          )}

          {!isLoading && stats && (
            <div className="space-y-8">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
                  <div className="text-2xl font-extrabold text-primary">
                    {stats.overview.provinces}
                  </div>
                  <div className="text-xs font-semibold text-brandtext-muted mt-1">
                    Provinces (9)
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
                  <div className="text-2xl font-extrabold text-secondary">
                    {stats.overview.districts}
                  </div>
                  <div className="text-xs font-semibold text-brandtext-muted mt-1">
                    Districts (25)
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
                  <div className="text-2xl font-extrabold text-[#8E6C18]">
                    {stats.overview.ds_divisions}
                  </div>
                  <div className="text-xs font-semibold text-brandtext-muted mt-1">
                    DS Divisions
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
                  <div className="text-2xl font-extrabold text-blue-700">
                    {stats.overview.gn_divisions}
                  </div>
                  <div className="text-xs font-semibold text-brandtext-muted mt-1">
                    GN Divisions
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
                  <div className="text-2xl font-extrabold text-emerald-800">
                    {stats.overview.villages}
                  </div>
                  <div className="text-xs font-semibold text-brandtext-muted mt-1">
                    Total Villages
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
                  <div className="text-2xl font-extrabold text-emerald-600">
                    {stats.overview.verified_villages}
                  </div>
                  <div className="text-xs font-semibold text-brandtext-muted mt-1">
                    Verified Public Data
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
                  <div className="text-2xl font-extrabold text-amber-600">
                    {stats.overview.duplicate_village_names?.length || 0}
                  </div>
                  <div className="text-xs font-semibold text-brandtext-muted mt-1">
                    Duplicate Name Clusters
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-soft">
                  <div className="text-2xl font-extrabold text-gray-500">
                    {stats.overview.missing_coordinates}
                  </div>
                  <div className="text-xs font-semibold text-brandtext-muted mt-1">
                    Pending Coordinates
                  </div>
                </div>

              </div>

              {/* Duplicate Village Names Detection & Audit Section */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-accent" />
                      <span>Duplicate Name Resolution Audit</span>
                    </h2>
                    <p className="text-xs text-brandtext-muted mt-0.5">
                      The following village names exist in multiple administrative districts in Sri Lanka. LankaLocate isolates each instance accurately:
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {stats.duplicate_village_names?.map((d: any, idx: number) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-brandtext capitalize text-sm">
                          {d.name_en}
                        </span>
                        <div className="text-brandtext-muted">
                          Sinhala: {d.sinhala_names}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                        {d.duplicate_count} Distinct Locations
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/admin/villages"
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft hover:border-secondary transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brandtext group-hover:text-primary transition-colors">
                        Manage Village Database
                      </h3>
                      <p className="text-xs text-brandtext-muted">
                        Add, edit, search, and delete verified villages.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/admin/import"
                  className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft hover:border-secondary transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brandtext group-hover:text-primary transition-colors">
                        CSV Data Import & Export
                      </h3>
                      <p className="text-xs text-brandtext-muted">
                        Batch upload CSV records or download verified dataset.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
