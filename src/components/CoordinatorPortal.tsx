'use client';

import React, { useState, useEffect } from 'react';
import {
  PlacementSummary,
  BranchStat,
  CompanyStat,
  EligibilityDecision,
  ApplicationStatusHistory,
  NotificationLog
} from '@/lib/models/types';
import {
  BarChart3,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  ShieldCheck,
  History,
  Mail,
  Briefcase
} from 'lucide-react';

interface CoordinatorPortalProps {
  onDataChanged: () => void;
}

export const CoordinatorPortal: React.FC<CoordinatorPortalProps> = ({ onDataChanged }) => {
  const [reportData, setReportData] = useState<{
    summary: PlacementSummary;
    branch_breakdown: BranchStat[];
    company_breakdown: CompanyStat[];
    funnel: Record<string, number>;
  } | null>(null);

  const [audits, setAudits] = useState<{
    eligibility_decisions: EligibilityDecision[];
    status_history: ApplicationStatusHistory[];
    notification_logs: NotificationLog[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BRANCHES' | 'COMPANIES' | 'AUDIT_LOGS'>('OVERVIEW');
  const [auditSubTab, setAuditSubTab] = useState<'DECISIONS' | 'STATUS_HISTORY' | 'NOTIFICATIONS'>('DECISIONS');

  const loadReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReportData(data.report);
      setAudits(data.audits);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const summary = reportData?.summary;

  return (
    <div className="space-y-6">
      {/* Placement Coordinator Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-md shadow-purple-600/30">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-slate-900">Placement Coordinator Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Official Placement Office
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live statistics, branch performance, employer drives, and regulatory audit compliance.
            </p>
          </div>
        </div>

        <button
          onClick={loadReports}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
        >
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Placement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {summary?.placement_percentage || 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {summary?.total_placed || 0} of {summary?.total_students || 0} students placed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Package</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {summary?.avg_package_lpa || 0} <span className="text-sm font-semibold text-slate-500">LPA</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Across accepted employment offers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Highest Package</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {summary?.highest_package_lpa || 0} <span className="text-sm font-semibold text-slate-500">LPA</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Top campus recruiter package
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Drives</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {summary?.total_jobs || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {summary?.total_applications || 0} total applications submitted
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'OVERVIEW'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Placement Funnel</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'BRANCHES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Branch-wise Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPANIES')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'COMPANIES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Company Recruiter Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'AUDIT_LOGS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit & Compliance Logs</span>
        </button>
      </div>

      {/* TAB 1: FUNNEL OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <h3 className="text-base font-bold text-slate-900">Placement Pipeline Funnel</h3>
          
          <div className="space-y-4">
            {reportData?.funnel &&
              Object.entries(reportData.funnel).map(([stage, count]) => {
                const total = reportData.summary.total_applications || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={stage} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{stage.replace('_', ' ')}</span>
                      <span className="text-slate-900">{count} candidates ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          stage === 'ACCEPTED'
                            ? 'bg-emerald-500'
                            : stage === 'OFFERED'
                            ? 'bg-teal-500'
                            : stage === 'INTERVIEWED' || stage === 'INTERVIEW_SCHEDULED'
                            ? 'bg-indigo-500'
                            : stage === 'SHORTLISTED'
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: BRANCH BREAKDOWN */}
      {activeTab === 'BRANCHES' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Academic Branch-wise Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Engineering Branch</th>
                  <th className="py-3 px-4">Total Students</th>
                  <th className="py-3 px-4">Placed Students</th>
                  <th className="py-3 px-4">Placement Rate</th>
                  <th className="py-3 px-4">Average Package (LPA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.branch_breakdown.map(b => (
                  <tr key={b.branch} className="hover:bg-slate-50/70 transition font-medium">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.branch}</td>
                    <td className="py-3.5 px-4">{b.total_students}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{b.placed_students}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">{b.placement_rate}%</span>
                        <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${b.placement_rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {b.avg_package_lpa > 0 ? `${b.avg_package_lpa} LPA` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COMPANY RECRUITER STATS */}
      {activeTab === 'COMPANIES' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Company Recruiter Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Active Drives</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">Shortlisted</th>
                  <th className="py-3 px-4">Offers Issued</th>
                  <th className="py-3 px-4">Offers Accepted</th>
                  <th className="py-3 px-4">Avg Package</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.company_breakdown.map(c => (
                  <tr key={c.company_name} className="hover:bg-slate-50/70 transition font-medium">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.company_name}</td>
                    <td className="py-3.5 px-4">{c.openings}</td>
                    <td className="py-3.5 px-4">{c.applications}</td>
                    <td className="py-3.5 px-4 text-indigo-700 font-bold">{c.shortlisted}</td>
                    <td className="py-3.5 px-4">{c.offers_issued}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">{c.offers_accepted}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.avg_package_lpa > 0 ? `${c.avg_package_lpa} LPA` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT & COMPLIANCE LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit text-xs font-semibold">
            <button
              onClick={() => setAuditSubTab('DECISIONS')}
              className={`px-3 py-1.5 rounded-lg transition ${
                auditSubTab === 'DECISIONS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eligibility Decisions Audit ({audits?.eligibility_decisions.length || 0})
            </button>

            <button
              onClick={() => setAuditSubTab('STATUS_HISTORY')}
              className={`px-3 py-1.5 rounded-lg transition ${
                auditSubTab === 'STATUS_HISTORY' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Application Status History ({audits?.status_history.length || 0})
            </button>

            <button
              onClick={() => setAuditSubTab('NOTIFICATIONS')}
              className={`px-3 py-1.5 rounded-lg transition ${
                auditSubTab === 'NOTIFICATIONS' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Notification Logs ({audits?.notification_logs.length || 0})
            </button>
          </div>

          {/* Sub-tab 1: Eligibility Decisions */}
          {auditSubTab === 'DECISIONS' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Decision ID</th>
                      <th className="py-3 px-4">Student ID / Job ID</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Human-Readable Reason</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits?.eligibility_decisions.map(d => (
                      <tr key={d.decision_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold">#{d.decision_id}</td>
                        <td className="py-3 px-4 font-medium">Student #{d.student_id} · Job #{d.job_id}</td>
                        <td className="py-3 px-4">
                          {d.eligible ? (
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                              ELIGIBLE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800">
                              INELIGIBLE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 max-w-md">{d.reason}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(d.checked_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Status History */}
          {auditSubTab === 'STATUS_HISTORY' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">History ID</th>
                      <th className="py-3 px-4">App ID</th>
                      <th className="py-3 px-4">Old Status ➔ New Status</th>
                      <th className="py-3 px-4">Transition Reason</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits?.status_history.map(h => (
                      <tr key={h.status_history_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold">#{h.status_history_id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">App #{h.application_id}</td>
                        <td className="py-3 px-4">
                          <span className="text-slate-400">{h.old_status || 'INITIAL'}</span>
                          <span className="mx-1.5 font-bold text-slate-600">➔</span>
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {h.new_status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{h.reason || '—'}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(h.changed_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-tab 3: Notification Logs */}
          {auditSubTab === 'NOTIFICATIONS' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Notif ID</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Message Summary</th>
                      <th className="py-3 px-4">Delivery Status</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits?.notification_logs.map(n => (
                      <tr key={n.notification_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold">#{n.notification_id}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{n.notification_type}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{n.recipient_email}</td>
                        <td className="py-3 px-4 text-slate-700 max-w-sm">{n.message_summary}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {n.delivery_status} (Attempts: {n.attempt_count})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(n.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
