import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Compass, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useFavorites } from '../../context/FavoritesContext';
import { api } from '../../services/api';
import { SearchSuggestion } from '../../types';

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
  size?: 'default' | 'large';
  showRecentTags?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  autoFocus = false,
  size = 'large',
  showRecentTags = true,
  className = '',
}) => {
  const { t, language } = useLanguage();
  const { recentSearches, addRecentSearch } = useFavorites();
  const navigate = useNavigate();

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced suggestion fetch
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await api.getSuggestions(query.trim());
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    addRecentSearch(trimmed);
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSelectSuggestion = (s: SearchSuggestion) => {
    addRecentSearch(s.title_en);
    setIsOpen(false);
    // If suggestion has an id and is a village, route to location detail
    if (s.id && s.type === 'village') {
      navigate(`/locations/${s.id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(s.title_en)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isLarge = size === 'large';

  return (
    <div ref={wrapperRef} className={`w-full max-w-3xl mx-auto relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative group">
        <div 
          className={`flex items-center w-full bg-white rounded-2xl border-2 transition-all duration-200 shadow-soft ${
            isOpen ? 'border-primary ring-4 ring-primary/10 rounded-b-none' : 'border-gray-200 hover:border-secondary/60'
          }`}
        >
          {/* Search Icon */}
          <div className="pl-4 sm:pl-5 pr-2 text-secondary flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-secondary" />
            ) : (
              <Search className={`${isLarge ? 'w-6 h-6' : 'w-5 h-5'} stroke-[2.2]`} />
            )}
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
              if (!isOpen && e.target.value.trim().length >= 2) setIsOpen(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            placeholder={t('search_placeholder')}
            className={`w-full bg-transparent outline-none text-brandtext placeholder:text-gray-400 font-medium ${
              isLarge ? 'py-4 sm:py-4.5 text-base sm:text-lg' : 'py-3 text-sm sm:text-base'
            }`}
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="p-1.5 mr-2 text-gray-400 hover:text-brandtext rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Action Button */}
          <div className="pr-2 sm:pr-3">
            <button
              type="submit"
              className={`flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-95 ${
                isLarge ? 'px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base' : 'px-4 py-2 text-xs sm:text-sm'
              }`}
            >
              <span>{t('search_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full bg-white rounded-b-2xl border-2 border-t-0 border-primary shadow-soft-lg z-50 overflow-hidden divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 bg-gray-50/80 flex items-center justify-between text-[11px] font-semibold text-brandtext-muted uppercase tracking-wider">
            <span>Matching Administrative Locations</span>
            <span>Use ↑↓ to navigate</span>
          </div>

          <ul className="max-h-80 overflow-y-auto py-1">
            {suggestions.map((item, idx) => {
              const active = idx === selectedIndex;
              return (
                <li key={`${item.id}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      active ? 'bg-primary/10' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                      <MapPin className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-brandtext">
                          {item.title_en}
                        </span>
                        {item.title_si && (
                          <span className="text-xs text-brandtext-muted font-normal">
                            ({item.title_si})
                          </span>
                        )}
                        {item.title_ta && (
                          <span className="text-xs text-brandtext-muted font-normal">
                            ({item.title_ta})
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-secondary/10 text-secondary uppercase">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-brandtext-muted truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-gray-400 self-center shrink-0" />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="p-2.5 bg-gray-50 text-center">
            <button
              onClick={() => handleSubmit()}
              className="text-xs font-semibold text-secondary hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <span>View all matching results for &ldquo;{query}&rdquo;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Searches Chips */}
      {showRecentTags && recentSearches.length > 0 && (
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
          <span className="flex items-center gap-1 text-brandtext-muted font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Popular / Recent:</span>
          </span>
          {recentSearches.slice(0, 5).map((term, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(term);
                navigate(`/search?q=${encodeURIComponent(term)}`);
              }}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-gray-100 text-brandtext border border-gray-200 transition-colors shadow-2xs font-medium"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
