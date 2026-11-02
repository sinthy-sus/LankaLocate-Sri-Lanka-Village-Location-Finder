import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  MapPin, 
  Database, 
  Compass, 
  Building2, 
  CheckCircle2, 
  ExternalLink,
  Info 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
          <Info className="w-3.5 h-3.5" />
          <span>About LankaLocate</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-primary font-sans">
          Sri Lanka Administrative Hierarchy & Geographical System
        </h1>
        <p className="text-sm sm:text-base text-brandtext-muted leading-relaxed">
          LankaLocate was engineered to provide instant, unambiguous administrative identification for every village, township, and locality across the island of Sri Lanka.
        </p>
      </div>

      {/* 5-Tier Administrative Hierarchy Diagram / Explanation */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-soft space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-primary font-sans flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-secondary" />
            <span>The 5-Tier Administrative System of Sri Lanka</span>
          </h2>
          <p className="text-xs sm:text-sm text-brandtext-muted mt-1">
            Sri Lankan governance functions through a rigorous, nested administrative chain:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          <div className="bg-[#F7F9F7] p-5 rounded-2xl border border-gray-200/80 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white">Tier 1</span>
            <h3 className="text-lg font-bold text-primary">Country</h3>
            <p className="text-xs text-brandtext-muted">Democratic Socialist Republic of Sri Lanka (LK / LKA).</p>
          </div>

          <div className="bg-[#F7F9F7] p-5 rounded-2xl border border-gray-200/80 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white">Tier 2</span>
            <h3 className="text-lg font-bold text-primary">9 Provinces</h3>
            <p className="text-xs text-brandtext-muted">Established under the 13th Amendment. Governed by Provincial Councils.</p>
          </div>

          <div className="bg-[#F7F9F7] p-5 rounded-2xl border border-gray-200/80 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-white">Tier 3</span>
            <h3 className="text-lg font-bold text-secondary">25 Districts</h3>
            <p className="text-xs text-brandtext-muted">Primary regional administration headed by a District Secretary (Government Agent).</p>
          </div>

          <div className="bg-[#F7F9F7] p-5 rounded-2xl border border-gray-200/80 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#8E6C18] text-white">Tier 4</span>
            <h3 className="text-lg font-bold text-[#8E6C18]">331+ DS Divisions</h3>
            <p className="text-xs text-brandtext-muted">Divisional Secretariat divisions managing revenue, welfare, and civil registration.</p>
          </div>

          <div className="bg-[#F7F9F7] p-5 rounded-2xl border border-gray-200/80 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white">Tier 5</span>
            <h3 className="text-lg font-bold text-emerald-800">14,022 GN Divisions</h3>
            <p className="text-xs text-brandtext-muted">Grama Niladhari (&ldquo;Village Officer&rdquo;) units covering grassroots villages and hamlets.</p>
          </div>

        </div>
      </div>

      {/* Authoritative Data Grounding */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-soft space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-primary font-sans flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Authoritative Data Sources</span>
          </h2>
          <p className="text-xs sm:text-sm text-brandtext-muted mt-1">
            Data accuracy is vital. LankaLocate enforces strict relational constraints and references validated official records:
          </p>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-brandtext-muted">
          <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div>
              <strong className="text-brandtext">Department of Census and Statistics (DCS) Sri Lanka:</strong> Official population census tracts, administrative codes, and divisional boundaries.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div>
              <strong className="text-brandtext">Survey Department of Sri Lanka:</strong> Baseline topographical cartography and standard geographical coordinates.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <div>
              <strong className="text-brandtext">Ministry of Public Administration, Home Affairs, Provincial Councils and Local Government:</strong> Verified gazettes of Grama Niladhari divisions and Divisional Secretariats.
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Details */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-soft space-y-4">
        <h2 className="text-2xl font-bold text-primary font-sans flex items-center gap-2.5">
          <Database className="w-6 h-6 text-secondary" />
          <span>Technology Architecture</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F7F9F7] space-y-1">
            <span className="font-bold text-primary">Backend Engine:</span>
            <p className="text-brandtext-muted">Node.js, Express REST API, PostgreSQL schema with indexed multilingual full-text queries, JWT authentication, and CSV streaming parser.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9F7] space-y-1">
            <span className="font-bold text-primary">Frontend Client:</span>
            <p className="text-brandtext-muted">React.js, TypeScript, Tailwind CSS, Lucide icons, Leaflet with OpenStreetMap cartography, and responsive mobile-first architecture.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
