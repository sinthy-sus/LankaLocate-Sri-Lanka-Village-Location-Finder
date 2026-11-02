export type Language = 'en' | 'si' | 'ta';

export interface Village {
  id: number;
  name_en: string;
  name_si: string;
  name_ta: string;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_verified: boolean;
  notes?: string | null;
}

export interface GNDivision {
  id: number;
  gn_code: string;
  name_en: string;
  name_si: string;
  name_ta: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DSDivision {
  id: number;
  code: string;
  name_en: string;
  name_si: string;
  name_ta: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface District {
  id: number;
  code: string;
  name_en: string;
  name_si: string;
  name_ta: string;
  capital_en?: string;
  capital_si?: string;
  capital_ta?: string;
  latitude?: number;
  longitude?: number;
  area_sq_km?: number;
  province_id?: number;
  province_code?: string;
  province_name_en?: string;
  ds_count?: number;
  gn_count?: number;
  village_count?: number;
}

export interface Province {
  id: number;
  code: string;
  name_en: string;
  name_si: string;
  name_ta: string;
  capital_en?: string;
  capital_si?: string;
  capital_ta?: string;
  latitude?: number;
  longitude?: number;
  area_sq_km?: number;
  district_count?: number;
  ds_count?: number;
  gn_count?: number;
  village_count?: number;
}

export interface Country {
  name_en: string;
  name_si: string;
  name_ta: string;
}

export interface LocationHierarchy {
  village: Village;
  gn_division: GNDivision;
  ds_division: DSDivision;
  district: District;
  province: Province;
  country: Country;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
    has_coordinates: boolean;
  };
  breadcrumb?: Array<{
    label: string;
    path: string;
    current?: boolean;
  }>;
  sibling_villages?: Array<{
    id: number;
    name_en: string;
    name_si: string;
    name_ta: string;
    gn_name_en: string;
    gn_code: string;
  }>;
  identical_name_villages?: Array<{
    id: number;
    name_en: string;
    name_si: string;
    name_ta: string;
    district_name_en: string;
    province_name_en: string;
    ds_name_en: string;
  }>;
}

export interface SearchSuggestion {
  id: number;
  title_en: string;
  title_si: string;
  title_ta: string;
  type: string;
  subtitle: string;
  subtitle_compact: string;
}

export interface PlatformStats {
  provinces: number;
  districts: number;
  ds_divisions: number;
  gn_divisions: number;
  villages: number;
  verified_villages: number;
  popular_districts: Array<{
    id: number;
    code: string;
    name_en: string;
    name_si: string;
    name_ta: string;
    province_name_en: string;
    ds_count: number;
    village_count: number;
  }>;
  country: {
    name_en: string;
    name_si: string;
    name_ta: string;
    code: string;
    capital: string;
    commercial_capital: string;
  };
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
}
