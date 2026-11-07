'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { StudentPortal } from '@/components/StudentPortal';
import { CompanyPortal } from '@/components/CompanyPortal';
import { CoordinatorPortal } from '@/components/CoordinatorPortal';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<'STUDENT' | 'COMPANY' | 'COORDINATOR'>('STUDENT');
  const [resetLoading, setResetLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the database to the initial scenario baseline?')) {
      return;
    }
    try {
      setResetLoading(true);
      await fetch('/api/reset', { method: 'POST' });
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setResetLoading(false);
    }
  };

  const handleDataChanged = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onReset={handleReset}
        resetLoading={resetLoading}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div key={refreshKey} className="animate-in fade-in duration-200">
          {currentRole === 'STUDENT' && <StudentPortal onDataChanged={handleDataChanged} />}
          {currentRole === 'COMPANY' && <CompanyPortal onDataChanged={handleDataChanged} />}
          {currentRole === 'COORDINATOR' && <CoordinatorPortal onDataChanged={handleDataChanged} />}
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur border-t border-teal-100 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p className="font-semibold text-slate-700">
            TalentHub Campus Placement Platform
          </p>
          <p className="text-slate-500">
            Next.js App Router · Service-driven workflows · Persistent JSON store
          </p>
        </div>
      </footer>
    </div>
  );
}
