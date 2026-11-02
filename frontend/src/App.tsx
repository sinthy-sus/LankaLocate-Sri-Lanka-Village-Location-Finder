import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

import { HomePage } from './pages/HomePage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { LocationDetailPage } from './pages/LocationDetailPage';
import { ProvincesPage } from './pages/ProvincesPage';
import { ProvinceDetailPage } from './pages/ProvinceDetailPage';
import { DistrictsPage } from './pages/DistrictsPage';
import { DistrictDetailPage } from './pages/DistrictDetailPage';
import { ExploreMapPage } from './pages/ExploreMapPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AboutPage } from './pages/AboutPage';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminVillagesPage } from './pages/admin/AdminVillagesPage';
import { AdminImportExportPage } from './pages/admin/AdminImportExportPage';

// Protected Route Component for Admin
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="p-20 text-center text-xs text-brandtext-muted">Authenticating administrator...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-[#F7F9F7] text-[#17231E]">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Geographical Discovery Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/locations/:id" element={<LocationDetailPage />} />
                  <Route path="/provinces" element={<ProvincesPage />} />
                  <Route path="/provinces/:codeOrId" element={<ProvinceDetailPage />} />
                  <Route path="/districts" element={<DistrictsPage />} />
                  <Route path="/districts/:codeOrId" element={<DistrictDetailPage />} />
                  <Route path="/map" element={<ExploreMapPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/about" element={<AboutPage />} />

                  {/* Administrative Portal Pages */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboardPage />
                      </ProtectedAdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/villages" 
                    element={
                      <ProtectedAdminRoute>
                        <AdminVillagesPage />
                      </ProtectedAdminRoute>
                    } 
                  />
                  <Route 
                    path="/admin/import" 
                    element={
                      <ProtectedAdminRoute>
                        <AdminImportExportPage />
                      </ProtectedAdminRoute>
                    } 
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
