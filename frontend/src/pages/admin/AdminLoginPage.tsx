import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await login({ username, password });
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-gray-200/80 shadow-soft-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-primary font-sans">
            Admin Portal
          </h1>
          <p className="text-xs text-brandtext-muted">
            Sign in to manage provinces, districts, DS divisions, and village records.
          </p>
        </div>

        {/* Demo Credentials Tip */}
        <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900/90 space-y-1">
          <div className="font-bold flex items-center gap-1 text-amber-900">
            <span>Demo Administrator Credentials:</span>
          </div>
          <div className="flex justify-between font-mono text-[11px]">
            <span>Username: <strong>admin</strong></span>
            <span>Password: <strong>Admin@123</strong></span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brandtext mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F7F9F7] text-xs sm:text-sm text-brandtext outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brandtext mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#F7F9F7] text-xs sm:text-sm text-brandtext outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
