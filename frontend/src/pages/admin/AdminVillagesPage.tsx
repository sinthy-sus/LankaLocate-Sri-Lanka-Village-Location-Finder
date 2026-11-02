import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  MapPin, 
  X, 
  Check, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { api } from '../../services/api';

export const AdminVillagesPage: React.FC = () => {
  const [villages, setVillages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVillage, setEditingVillage] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_si: '',
    name_ta: '',
    gn_division_id: 1,
    postal_code: '',
    latitude: '',
    longitude: '',
    is_verified: true,
    notes: '',
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchVillages = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminVillages(page, 15, search);
      setVillages(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Error fetching admin villages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVillages();
  }, [page, search]);

  const handleOpenAddModal = () => {
    setEditingVillage(null);
    setFormData({
      name_en: '',
      name_si: '',
      name_ta: '',
      gn_division_id: 1,
      postal_code: '',
      latitude: '',
      longitude: '',
      is_verified: true,
      notes: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: any) => {
    setEditingVillage(v);
    setFormData({
      name_en: v.name_en,
      name_si: v.name_si,
      name_ta: v.name_ta,
      gn_division_id: v.gn_division_id,
      postal_code: v.postal_code || '',
      latitude: v.latitude ? String(v.latitude) : '',
      longitude: v.longitude ? String(v.longitude) : '',
      is_verified: Boolean(v.is_verified),
      notes: v.notes || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_en || !formData.name_si || !formData.name_ta) {
      setFormError('Please enter village names in English, Sinhala, and Tamil.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      const payload = {
        name_en: formData.name_en,
        name_si: formData.name_si,
        name_ta: formData.name_ta,
        gn_division_id: Number(formData.gn_division_id),
        postal_code: formData.postal_code || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        is_verified: formData.is_verified,
        notes: formData.notes || null,
      };

      if (editingVillage) {
        await api.updateVillage(editingVillage.id, payload);
      } else {
        await api.createVillage(payload);
      }

      setIsModalOpen(false);
      fetchVillages();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to save village.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteVillage(id);
      setDeleteId(null);
      fetchVillages();
    } catch (err) {
      console.error('Error deleting village:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <AdminSidebar />

        {/* Content */}
        <div className="flex-1 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary font-sans">
                Manage Villages & Localities
              </h1>
              <p className="text-xs text-brandtext-muted mt-0.5">
                Total records: {total} verified village entries
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs shadow-sm transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Village</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-soft flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 ml-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search villages by English, Sinhala, Tamil name..."
              className="w-full bg-transparent text-xs sm:text-sm text-brandtext outline-none"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F9F7] text-brandtext-muted uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5">ID</th>
                    <th className="px-4 py-3.5">Village Name (EN / SI / TA)</th>
                    <th className="px-4 py-3.5">GN Division</th>
                    <th className="px-4 py-3.5">DS Division</th>
                    <th className="px-4 py-3.5">District</th>
                    <th className="px-4 py-3.5">Coordinates</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-secondary mb-2" />
                        <span>Loading village records...</span>
                      </td>
                    </tr>
                  ) : villages.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No villages found matching your search.
                      </td>
                    </tr>
                  ) : (
                    villages.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-gray-400 font-bold">
                          #{v.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-brandtext">{v.name_en}</div>
                          <div className="text-[11px] text-brandtext-muted">{v.name_si} • {v.name_ta}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-brandtext">{v.gn_name_en}</div>
                          <span className="text-[10px] font-mono text-secondary font-bold">({v.gn_code})</span>
                        </td>
                        <td className="px-4 py-3 text-brandtext-muted font-medium">
                          {v.ds_name_en}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-primary">{v.district_name_en}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                          {v.latitude && v.longitude ? `${v.latitude.toFixed(4)}, ${v.longitude.toFixed(4)}` : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {v.is_verified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="Edit Village"
                              onClick={() => handleOpenEditModal(v)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              title="Delete Village"
                              onClick={() => setDeleteId(v.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs text-brandtext-muted">
              <span>Showing {villages.length} of {total} records</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 bg-white font-semibold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-3 py-1 font-bold">Page {page}</span>
                <button
                  disabled={page * 15 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 bg-white font-semibold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add / Edit Village Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-soft-lg space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-primary">
                {editingVillage ? 'Edit Village Record' : 'Add New Village Record'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-brandtext"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brandtext mb-1">
                  Village Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="e.g. Hikkaduwa"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-secondary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brandtext mb-1">
                    Sinhala Name (සිංහල) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_si}
                    onChange={(e) => setFormData({ ...formData, name_si: e.target.value })}
                    placeholder="උදා: හික්කඩුව"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brandtext mb-1">
                    Tamil Name (தமிழ்) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_ta}
                    onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
                    placeholder="எ.கா: ஹிக்கடுவை"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brandtext mb-1">
                    GN Division ID *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.gn_division_id}
                    onChange={(e) => setFormData({ ...formData, gn_division_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brandtext mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    placeholder="e.g. 80240"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-brandtext mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="6.1395"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brandtext mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="80.1063"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-secondary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brandtext mb-1">
                  Historical / Geographical Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Official DCS notes or landmark details..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-secondary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={formData.is_verified}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="is_verified" className="font-semibold text-brandtext cursor-pointer">
                  Mark as verified official government record
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-brandtext hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-light text-white font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingVillage ? 'Update Record' : 'Save Village'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-soft-lg animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-brandtext">
              Confirm Record Deletion
            </h3>
            <p className="text-xs text-brandtext-muted">
              Are you sure you want to delete village record #{deleteId}? This action cannot be undone.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 font-bold text-xs text-brandtext hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
