import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  FileSpreadsheet, 
  LogOut, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Manage Villages', path: '/admin/villages', icon: MapPin },
    { label: 'CSV Import & Export', path: '/admin/import', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-full md:w-64 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-soft space-y-6 shrink-0 h-fit">
      
      {/* Admin User Profile */}
      <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <div className="text-sm font-bold text-brandtext truncate">
            {user?.username || 'Administrator'}
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary uppercase">
            {user?.role || 'Superadmin'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                active
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-brandtext-muted hover:bg-gray-50 hover:text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <Link
          to="/"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-brandtext-muted hover:text-primary hover:bg-gray-50 transition-colors"
        >
          <span>View Public Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};
