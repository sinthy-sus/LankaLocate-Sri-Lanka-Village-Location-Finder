import axios from 'axios';
import { 
  LocationHierarchy, 
  SearchSuggestion, 
  PlatformStats, 
  Province, 
  District, 
  AdminUser 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to admin requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lankalocate_admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Search
  search: async (q: string, provinceId?: number, districtId?: number): Promise<{ query: string; count: number; results: LocationHierarchy[]; message?: string }> => {
    const params: any = { q };
    if (provinceId) params.province_id = provinceId;
    if (districtId) params.district_id = districtId;
    const res = await apiClient.get('/search', { params });
    return res.data;
  },

  getSuggestions: async (q: string): Promise<SearchSuggestion[]> => {
    const res = await apiClient.get('/search/suggestions', { params: { q } });
    return res.data.suggestions || [];
  },

  // Locations
  getVillageById: async (id: number): Promise<LocationHierarchy> => {
    const res = await apiClient.get(`/villages/${id}`);
    return res.data;
  },

  getProvinces: async (): Promise<Province[]> => {
    const res = await apiClient.get('/provinces');
    return res.data.provinces || [];
  },

  getProvinceDetail: async (codeOrId: string | number): Promise<{ province: Province; districts: District[] }> => {
    const res = await apiClient.get(`/provinces/${codeOrId}`);
    return res.data;
  },

  getDistricts: async (provinceId?: number, search?: string): Promise<District[]> => {
    const params: any = {};
    if (provinceId) params.province_id = provinceId;
    if (search) params.search = search;
    const res = await apiClient.get('/districts', { params });
    return res.data.districts || [];
  },

  getDistrictDetail: async (codeOrId: string | number): Promise<{ district: District; ds_divisions: any[] }> => {
    const res = await apiClient.get(`/districts/${codeOrId}`);
    return res.data;
  },

  getDSDivisionDetail: async (id: number): Promise<{ ds_division: any; gn_divisions: any[] }> => {
    const res = await apiClient.get(`/ds-divisions/${id}`);
    return res.data;
  },

  getMapLocations: async (limit = 300): Promise<any[]> => {
    const res = await apiClient.get('/map/locations', { params: { limit } });
    return res.data.locations || [];
  },

  // Stats
  getStats: async (): Promise<PlatformStats> => {
    const res = await apiClient.get('/stats');
    return res.data;
  },

  // Admin
  adminLogin: async (credentials: { username: string; password: string }): Promise<{ token: string; user: AdminUser }> => {
    const res = await apiClient.post('/admin/login', credentials);
    return res.data;
  },

  getAdminProfile: async (): Promise<AdminUser> => {
    const res = await apiClient.get('/admin/me');
    return res.data.user;
  },

  getAdminStats: async (): Promise<any> => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },

  getAdminVillages: async (page = 1, limit = 20, search?: string): Promise<{ data: any[]; total: number; page: number; limit: number }> => {
    const params: any = { page, limit };
    if (search) params.search = search;
    const res = await apiClient.get('/admin/villages', { params });
    return res.data;
  },

  createVillage: async (data: any): Promise<any> => {
    const res = await apiClient.post('/admin/villages', data);
    return res.data;
  },

  updateVillage: async (id: number, data: any): Promise<any> => {
    const res = await apiClient.put(`/admin/villages/${id}`, data);
    return res.data;
  },

  deleteVillage: async (id: number): Promise<any> => {
    const res = await apiClient.delete(`/admin/villages/${id}`);
    return res.data;
  },

  importCsv: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/admin/import/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  exportCsvUrl: () => `${API_BASE_URL}/admin/export/csv`,
};
