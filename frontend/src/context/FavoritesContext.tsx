import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationHierarchy } from '../types';

interface SavedLocationItem {
  id: number;
  name_en: string;
  name_si: string;
  name_ta: string;
  district_name_en: string;
  province_name_en: string;
  ds_name_en: string;
  gn_code: string;
  timestamp: number;
}

interface FavoritesContextType {
  favorites: SavedLocationItem[];
  recentSearches: string[];
  recentLocations: SavedLocationItem[];
  addFavorite: (loc: LocationHierarchy) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  addRecentSearch: (query: string) => void;
  addRecentLocation: (loc: LocationHierarchy) => void;
  clearHistory: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<SavedLocationItem[]>(() => {
    try {
      const saved = localStorage.getItem('lankalocate_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lankalocate_recent_searches');
      return saved ? JSON.parse(saved) : ['Hikkaduwa', 'Aluthgama', 'Kandy', 'Unawatuna'];
    } catch {
      return ['Hikkaduwa', 'Aluthgama', 'Kandy', 'Unawatuna'];
    }
  });

  const [recentLocations, setRecentLocations] = useState<SavedLocationItem[]>(() => {
    try {
      const saved = localStorage.getItem('lankalocate_recent_locations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('lankalocate_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('lankalocate_recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem('lankalocate_recent_locations', JSON.stringify(recentLocations));
  }, [recentLocations]);

  const addFavorite = (loc: LocationHierarchy) => {
    const item: SavedLocationItem = {
      id: loc.village.id,
      name_en: loc.village.name_en,
      name_si: loc.village.name_si,
      name_ta: loc.village.name_ta,
      district_name_en: loc.district.name_en,
      province_name_en: loc.province.name_en,
      ds_name_en: loc.ds_division.name_en,
      gn_code: loc.gn_division.gn_code,
      timestamp: Date.now(),
    };
    setFavorites(prev => [item, ...prev.filter(f => f.id !== item.id)]);
  };

  const removeFavorite = (id: number) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const isFavorite = (id: number) => {
    return favorites.some(f => f.id === id);
  };

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => [trimmed, ...prev.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8));
  };

  const addRecentLocation = (loc: LocationHierarchy) => {
    const item: SavedLocationItem = {
      id: loc.village.id,
      name_en: loc.village.name_en,
      name_si: loc.village.name_si,
      name_ta: loc.village.name_ta,
      district_name_en: loc.district.name_en,
      province_name_en: loc.province.name_en,
      ds_name_en: loc.ds_division.name_en,
      gn_code: loc.gn_division.gn_code,
      timestamp: Date.now(),
    };
    setRecentLocations(prev => [item, ...prev.filter(l => l.id !== item.id)].slice(0, 6));
  };

  const clearHistory = () => {
    setRecentSearches([]);
    setRecentLocations([]);
    localStorage.removeItem('lankalocate_recent_searches');
    localStorage.removeItem('lankalocate_recent_locations');
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      recentSearches,
      recentLocations,
      addFavorite,
      removeFavorite,
      isFavorite,
      addRecentSearch,
      addRecentLocation,
      clearHistory
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
