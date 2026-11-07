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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Platform Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onReset={handleReset}
        resetLoading={resetLoading}
      />

      {/* Main Role-Specific Portal View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={refreshKey}>
          {currentRole === 'STUDENT' && <StudentPortal onDataChanged={handleDataChanged} />}
          {currentRole === 'COMPANY' && <CompanyPortal onDataChanged={handleDataChanged} />}
          {currentRole === 'COORDINATOR' && <CoordinatorPortal onDataChanged={handleDataChanged} />}
        </div>
      </main>

      {/* Footer with Layered Architecture Notice */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            TalentHub Campus Placement Platform · Built with Next.js (TypeScript, App Router, Tailwind CSS)
          </p>
          <p>
            Implements Layered Architecture: Router Layer (Next.js API) ➔ Service Layer ➔ Repository Layer ➔ Model &amp; Database Layer.
          </p>
        </div>
      </footer>
    </div>
  );
}
