import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getName: (item?: { name_en?: string; name_si?: string; name_ta?: string } | null) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    app_name: 'LankaLocate',
    tagline: 'Discover Every Place in Sri Lanka',
    hero_subtitle: 'Find villages, explore districts, and discover the administrative locations of Sri Lanka.',
    search_placeholder: 'Search village, town, or GN division (e.g., Hikkaduwa, Aluthgama)...',
    search_btn: 'Search',
    nav_home: 'Home',
    nav_explore: 'Explore Map',
    nav_districts: 'Districts',
    nav_provinces: 'Provinces',
    nav_favorites: 'Favorites',
    nav_about: 'About',
    nav_admin: 'Admin',
    stats_provinces: 'Provinces',
    stats_districts: 'Districts',
    stats_ds_divisions: 'DS Divisions',
    stats_gn_divisions: 'GN Divisions',
    stats_villages: 'Verified Villages',
    popular_districts: 'Popular Districts',
    popular_districts_desc: 'Explore Sri Lanka’s most vibrant cultural and commercial hubs.',
    recent_searches: 'Recently Explored',
    view_details: 'View Details',
    explore_btn: 'Explore',
    village: 'Village / Locality',
    gn_division: 'Grama Niladhari Division',
    ds_division: 'Divisional Secretariat Division',
    district: 'District',
    province: 'Province',
    country: 'Country',
    coordinates: 'Geographic Coordinates',
    copy_info: 'Copy Information',
    copied: 'Copied!',
    share_location: 'Share Location',
    save_favorite: 'Save to Favorites',
    remove_favorite: 'Remove Favorite',
    other_villages_same_name: 'Other Locations with the Same Name',
    nearby_villages: 'Sibling Villages in Same DS Division',
    results_found: 'administrative locations found',
    no_results_title: 'No Locations Found',
    no_results_desc: 'We couldn’t find any village or division matching your search. Please check your spelling or try in English, Sinhala, or Tamil.',
    all_provinces: 'All 9 Provinces of Sri Lanka',
    all_districts: 'All 25 Districts of Sri Lanka',
    filter_by_province: 'Filter by Province',
    search_district_placeholder: 'Search districts...',
    all: 'All',
    verified_data_badge: 'Official Verified Administrative Data',
    footer_text: 'LankaLocate is an authoritative geographical information system for Sri Lanka.',
    footer_copyright: 'All rights reserved. Designed for Sri Lanka.',
  },
  si: {
    app_name: 'ලංකාලොකේට්',
    tagline: 'ශ්‍රී ලංකාවේ සෑම ස්ථානයක්ම සොයාගන්න',
    hero_subtitle: 'ගම්මාන සොයන්න, දිස්ත්‍රික්ක ගවේෂණය කරන්න සහ ශ්‍රී ලංකාවේ නිවැරදි පරිපාලන පිහිටීම හඳුනාගන්න.',
    search_placeholder: 'ගම, නගරය හෝ ග්‍රාම නිලධාරී වසම සොයන්න (උදා: හික්කඩුව, අලුත්ගම)...',
    search_btn: 'සොයන්න',
    nav_home: 'මුල් පිටුව',
    nav_explore: 'සිතියම',
    nav_districts: 'දිස්ත්‍රික්ක',
    nav_provinces: 'පළාත්',
    nav_favorites: 'ප්‍රියතම',
    nav_about: 'අප ගැන',
    nav_admin: 'පරිපාලක',
    stats_provinces: 'පළාත් 9',
    stats_districts: 'දිස්ත්‍රික්ක 25',
    stats_ds_divisions: 'ප්‍රාදේශීය ලේකම් කොට්ඨාස',
    stats_gn_divisions: 'ග්‍රාම නිලධාරී වසම්',
    stats_villages: 'තහවුරු කළ ගම්මාන',
    popular_districts: 'ප්‍රමුඛ දිස්ත්‍රික්ක',
    popular_districts_desc: 'ශ්‍රී ලංකාවේ ප්‍රධාන සංස්කෘතික සහ වාණිජ දිස්ත්‍රික්ක ගවේෂණය කරන්න.',
    recent_searches: 'මෑතකදී සෙවූ ස්ථාන',
    view_details: 'විස්තර බලන්න',
    explore_btn: 'ගවේෂණය කරන්න',
    village: 'ගම / ප්‍රදේශය',
    gn_division: 'ග්‍රාම නිලධාරී (GN) වසම',
    ds_division: 'ප්‍රාදේශීය ලේකම් (DS) කොට්ඨාසය',
    district: 'දිස්ත්‍රික්කය',
    province: 'පළාත',
    country: 'රට',
    coordinates: 'භූගෝලීය ඛණ්ඩාංක',
    copy_info: 'තොරතුරු පිටපත් කරන්න',
    copied: 'පිටපත් කරගන්නා ලදී!',
    share_location: 'ස්ථානය බෙදාගන්න',
    save_favorite: 'ප්‍රියතමයන්ට එක් කරන්න',
    remove_favorite: 'ප්‍රියතමයන්ගෙන් ඉවත් කරන්න',
    other_villages_same_name: 'මෙම නමම ඇති අනෙකුත් ස්ථාන',
    nearby_villages: 'මෙම ප්‍රා.ලේ. කොට්ඨාසයේම පිහිටි වෙනත් ගම්මාන',
    results_found: 'පරිපාලන ස්ථාන හමුවිය',
    no_results_title: 'කිසිදු ස්ථානයක් හමු නොවීය',
    no_results_desc: 'ඔබ සෙවූ නමට අදාළ ගමක් හෝ කොට්ඨාසයක් හමු නොවීය. කරුණාකර අක්ෂර වින්‍යාසය පරීක්ෂා කරන්න හෝ වෙනත් භාෂාවකින් උත්සාහ කරන්න.',
    all_provinces: 'ශ්‍රී ලංකාවේ සියලු පළාත් 9',
    all_districts: 'ශ්‍රී ලංකාවේ සියලු දිස්ත්‍රික්ක 25',
    filter_by_province: 'පළාත අනුව පෙරන්න',
    search_district_placeholder: 'දිස්ත්‍රික්ක සොයන්න...',
    all: 'සියල්ල',
    verified_data_badge: 'නිල තහවුරු කළ රාජ්‍ය දත්ත',
    footer_text: 'ලංකාලොකේට් යනු ශ්‍රී ලංකාව සඳහා වූ විශ්වසනීය භූගෝලීය හා පරිපාලන තොරතුරු වේදිකාවකි.',
    footer_copyright: 'සියලු හිමිකම් ඇවිරිණි. ශ්‍රී ලංකාව වෙනුවෙන් නිර්මාණය කරන ලදී.',
  },
  ta: {
    app_name: 'லங்காலொகேட்',
    tagline: 'இலங்கையின் ஒவ்வொரு இடத்தையும் கண்டறியுங்கள்',
    hero_subtitle: 'கிராமங்களைத் தேடுங்கள், மாவட்டங்களை ஆராயுங்கள் மற்றும் இலங்கையின் நிர்வாக அமைவிடங்களை உடனடியாக அடையாளம் காணுங்கள்.',
    search_placeholder: 'கிராமம், நகரம் அல்லது கிராம அலுவலர் பிரிவைத் தேடுங்கள் (எ.கா: ஹிக்கடுவை, அலுத்கம)...',
    search_btn: 'தேடுக',
    nav_home: 'முகப்பு',
    nav_explore: 'வரைபடம்',
    nav_districts: 'மாவட்டங்கள்',
    nav_provinces: 'மாகாணங்கள்',
    nav_favorites: 'விருப்பமானவை',
    nav_about: 'எங்களை பற்றி',
    nav_admin: 'நிர்வாகம்',
    stats_provinces: '9 மாகாணங்கள்',
    stats_districts: '25 மாவட்டங்கள்',
    stats_ds_divisions: 'பிரதேச செயலகப் பிரிவுகள்',
    stats_gn_divisions: 'கிராம அலுவலர் பிரிவுகள்',
    stats_villages: 'உறுதிப்படுத்தப்பட்ட கிராமங்கள்',
    popular_districts: 'பிரபலமான மாவட்டங்கள்',
    popular_districts_desc: 'இலங்கையின் முக்கிய கலாச்சார மற்றும் வர்த்தக மையங்களை ஆராயுங்கள்.',
    recent_searches: 'சமீபத்திய தேடல்கள்',
    view_details: 'விவரங்களை காண்க',
    explore_btn: 'ஆராய்க',
    village: 'கிராமம் / பிரதேசம்',
    gn_division: 'கிராம அலுவலர் பிரிவு (GN)',
    ds_division: 'பிரதேச செயலகப் பிரிவு (DS)',
    district: 'மாவட்டம்',
    province: 'மாகாணம்',
    country: 'நாடு',
    coordinates: 'புவியியல் ஒருங்கிணைப்புகள்',
    copy_info: 'தகவலை நகலெடு',
    copied: 'நகலெடுக்கப்பட்டது!',
    share_location: 'அமைவிடத்தைப் பகிர்',
    save_favorite: 'விருப்பத்தில் சேர்',
    remove_favorite: 'விருப்பத்திலிருந்து நீக்கு',
    other_villages_same_name: 'ஒரே பெயரைக் கொண்ட பிற இடங்கள்',
    nearby_villages: 'அதே பிரதேச செயலகத்தில் உள்ள பிற கிராமங்கள்',
    results_found: 'நிர்வாக இடங்கள் கண்டறியப்பட்டன',
    no_results_title: 'இடங்கள் எதுவும் கிடைக்கவில்லை',
    no_results_desc: 'உங்கள் தேடலுக்குரிய கிராமம் அல்லது பிரிவு எதுவும் கிடைக்கவில்லை. எழுத்துப் பிழைகளைச் சரிபார்க்கவும் அல்லது வேறு மொழியில் முயற்சிக்கவும்.',
    all_provinces: 'இலங்கையின் அனைத்து 9 மாகாணங்கள்',
    all_districts: 'இலங்கையின் அனைத்து 25 மாவட்டங்கள்',
    filter_by_province: 'மாகாணத்தின்படி வடிகட்டவும்',
    search_district_placeholder: 'மாவட்டங்களைத் தேடுங்கள்...',
    all: 'அனைத்தும்',
    verified_data_badge: 'அதிகாரப்பூர்வ உறுதிப்படுத்தப்பட்ட தரவு',
    footer_text: 'லங்காலொகேட் என்பது இலங்கைக்கான நம்பகமான புவியியல் தகவல் தளமாகும்.',
    footer_copyright: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('lankalocate_lang') as Language;
    return saved === 'si' || saved === 'ta' || saved === 'en' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lankalocate_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const getName = (item?: { name_en?: string; name_si?: string; name_ta?: string } | null): string => {
    if (!item) return '';
    if (language === 'si' && item.name_si) return item.name_si;
    if (language === 'ta' && item.name_ta) return item.name_ta;
    return item.name_en || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getName }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
