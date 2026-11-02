import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileText,
  ShieldCheck 
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { api } from '../../services/api';

export const AdminImportExportPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a valid CSV file.');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      const res = await api.importCsv(selectedFile);
      setResult(res);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import CSV file.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleHeaders = 'gn_code,village_name_en,village_name_si,village_name_ta,postal_code,latitude,longitude,is_verified,notes\n';
    const sampleRow1 = 'GAL-410,Hikkaduwa,හික්කඩුව,ஹிக்கடுவை,80240,6.1395,80.1063,1,"Coastal coral sanctuary town"\n';
    const sampleRow2 = 'KAL-235,Aluthgama,අලුත්ගම,அலுத்கம,12080,6.4350,80.0019,1,"Bentota Ganga coastal town"\n';
    const blob = new Blob([sampleHeaders + sampleRow1 + sampleRow2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lankalocate_sample_import.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <AdminSidebar />

        {/* Content */}
        <div className="flex-1 space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-primary font-sans">
              CSV Data Import & Export
            </h1>
            <p className="text-xs sm:text-sm text-brandtext-muted mt-0.5">
              Bulk update geographical locations or export verified datasets for external GIS systems.
            </p>
          </div>

          {/* Export Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Download className="w-5 h-5 text-secondary" />
                  <span>Export Complete National Dataset</span>
                </h2>
                <p className="text-xs text-brandtext-muted mt-1">
                  Download all verified Sri Lankan administrative locations (Villages, GN, DS, District, Province, Coordinates) in UTF-8 CSV format.
                </p>
              </div>

              <a
                href={api.exportCsvUrl()}
                download="lankalocate_verified_villages.csv"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs shadow-sm transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV Dataset</span>
              </a>
            </div>
          </div>

          {/* Import Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Upload className="w-5 h-5 text-secondary" />
                  <span>Batch CSV Data Import</span>
                </h2>
                <p className="text-xs text-brandtext-muted mt-1">
                  Upload CSV files following standard Sri Lanka administrative hierarchy headers.
                </p>
              </div>

              <button
                type="button"
                onClick={downloadSampleCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-[#F7F9F7] hover:bg-gray-100 text-xs font-semibold text-brandtext transition-colors shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-secondary" />
                <span>Download Template CSV</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{result.message}</span>
                </div>
                <div className="flex gap-4 pt-1 font-semibold">
                  <span>Imported: <strong>{result.imported}</strong></span>
                  <span>Skipped / Duplicates: <strong>{result.skipped}</strong></span>
                </div>
                {result.errors && result.errors.length > 0 && (
                  <div className="pt-2 text-[11px] text-amber-900">
                    <div className="font-bold">Notices:</div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {result.errors.map((e: string, i: number) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-secondary transition-colors cursor-pointer relative bg-[#F7F9F7]">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <FileSpreadsheet className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-brandtext">
                    {selectedFile ? selectedFile.name : 'Click or drag a CSV file here to upload'}
                  </div>
                  <p className="text-[11px] text-brandtext-muted">
                    Supports files up to 10MB in UTF-8 encoding.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-2 shadow-sm"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing CSV...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Start Import</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Field Specifications Reference */}
            <div className="pt-4 border-t border-gray-100 text-xs text-brandtext-muted space-y-2">
              <span className="font-bold text-brandtext">Expected CSV Columns:</span>
              <div className="font-mono text-[11px] bg-gray-50 p-3 rounded-xl border border-gray-200 text-gray-700 overflow-x-auto">
                gn_code, village_name_en, village_name_si, village_name_ta, postal_code, latitude, longitude, is_verified, notes
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
