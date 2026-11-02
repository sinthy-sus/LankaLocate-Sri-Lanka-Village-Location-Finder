import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, MapPin, Trash2, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';

export const FavoritesPage: React.FC = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-primary font-sans flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-accent fill-accent" />
            <span>Saved Favorite Locations</span>
          </h1>
          <p className="text-xs sm:text-sm text-brandtext-muted mt-1">
            Access your bookmarked Sri Lankan villages and administrative locations anytime.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary self-start sm:self-auto">
          {favorites.length} Saved Places
        </span>
      </div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-soft max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="text-xl font-bold text-primary">No Favorite Locations Yet</h3>
          <p className="text-xs text-brandtext-muted leading-relaxed">
            When you search for villages or explore districts, click &ldquo;Save to Favorites&rdquo; to keep them handy here.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
            >
              <Compass className="w-4 h-4 text-accent" />
              <span>Start Exploring Locations</span>
            </Link>
          </div>
        </div>
      )}

      {/* Favorites List */}
      {favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {favorites.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/locations/${item.id}`)}
              className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-soft hover:shadow-soft-lg hover:border-secondary/40 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brandtext group-hover:text-primary transition-colors">
                    {item.name_en}
                  </h3>
                  <p className="text-xs text-brandtext-muted mt-0.5">
                    {item.ds_name_en} DS, {item.district_name_en} District
                  </p>
                  <span className="text-[10px] font-bold text-secondary uppercase">
                    {item.province_name_en}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  title="Remove Favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(item.id);
                  }}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
