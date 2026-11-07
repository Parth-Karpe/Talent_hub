'use client';

import React from 'react';
import { GraduationCap, Building2, BarChart3, RefreshCw, CheckCircle2 } from 'lucide-react';

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
  resetLoading
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  TalentHub
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-300 border border-indigo-700">
                  Campus Placement Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">2026–27 Placement Season · Active</p>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 space-x-1">
            <button
              onClick={() => onRoleChange('STUDENT')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'STUDENT'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student (Rahul)</span>
            </button>

            <button
              onClick={() => onRoleChange('COMPANY')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'COMPANY'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Company (ABC Tech)</span>
            </button>

            <button
              onClick={() => onRoleChange('COORDINATOR')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentRole === 'COORDINATOR'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Placement Coordinator</span>
            </button>
          </div>

          {/* Reset Demo State Action */}
          <div>
            <button
              onClick={onReset}
              disabled={resetLoading}
              className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Reset data store to clean baseline from scenario"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetLoading ? 'animate-spin' : ''}`} />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
