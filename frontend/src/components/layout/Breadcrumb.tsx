import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs font-medium text-brandtext-muted overflow-x-auto py-2 px-1">
      <Link 
        to="/" 
        className="flex items-center gap-1 hover:text-primary transition-colors text-brandtext-muted shrink-0"
      >
        <Home className="w-3.5 h-3.5 text-secondary" />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-gray-400 shrink-0" />
          {item.current ? (
            <span className="font-semibold text-primary truncate">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-primary transition-colors hover:underline truncate shrink-0"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
