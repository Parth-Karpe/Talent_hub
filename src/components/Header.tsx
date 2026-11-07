'use client';

import React from 'react';
import { GraduationCap, Building2, BarChart3, RefreshCw, Link2 } from 'lucide-react';

interface HeaderProps {
  currentRole: 'STUDENT' | 'COMPANY' | 'COORDINATOR';
  onRoleChange: (role: 'STUDENT' | 'COMPANY' | 'COORDINATOR') => void;
  onReset: () => void;
  resetLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onReset,
  resetLoading,
}) => {
  const tabBase =
    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all';
  const active = 'bg-teal-700 text-white shadow-sm';
  const inactive = 'text-slate-600 hover:text-slate-900 hover:bg-white';

  return (
    <header className="sticky top-0 z-50 border-b border-teal-100/80 bg-white/85 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-700 p-2.5 text-white shadow-sm">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  TalentHub
                </span>
                <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                  Campus Placement Platform
                </span>
              </div>
              <p className="text-xs text-slate-500">2026–27 season dashboard</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => onRoleChange('STUDENT')}
              className={`${tabBase} ${currentRole === 'STUDENT' ? active : inactive}`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('COMPANY')}
              className={`${tabBase} ${currentRole === 'COMPANY' ? active : inactive}`}
            >
              <Building2 className="w-4 h-4" />
              <span>Recruiter</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('COORDINATOR')}
              className={`${tabBase} ${currentRole === 'COORDINATOR' ? active : inactive}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Coordinator</span>
            </button>
          </nav>

          <button
            type="button"
            onClick={onReset}
            disabled={resetLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-800 disabled:opacity-60"
            title="Reset data store to clean baseline from scenario"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetLoading ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
