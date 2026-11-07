'use client';

import React, { useState, useEffect } from 'react';
import {
  Company,
  JobWithDetails,
  ApplicationDetail,
  Branch,
  InterviewResult
} from '@/lib/models/types';
import {
  Building2,
  Users,
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Zap,
  Clock,
  MapPin,
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface CompanyPortalProps {
  onDataChanged: () => void;
}

export const CompanyPortal: React.FC<CompanyPortalProps> = ({ onDataChanged }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1); // Default: ABC Technologies
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number>(1);
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [activeTab, setActiveTab] = useState<'CANDIDATES' | 'DRIVES' | 'INTERVIEWS' | 'OFFERS'>('CANDIDATES');

  // Shortlisting state
  const [shortlistingLoading, setShortlistingLoading] = useState(false);
  const [shortlistSummary, setShortlistSummary] = useState<any | null>(null);

  // New Drive modal state
  const [showNewDriveModal, setShowNewDriveModal] = useState(false);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newMinCgpa, setNewMinCgpa] = useState('7.0');
  const [newMaxBacklogs, setNewMaxBacklogs] = useState('2');
  const [newDriveDate, setNewDriveDate] = useState('2026-11-20');
  const [newBranches, setNewBranches] = useState<Branch[]>(['CSE', 'ISE', 'ECE']);

  // Schedule Interview modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [targetAppId, setTargetAppId] = useState<number | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [schedDate, setSchedDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [venue, setVenue] = useState('Campus Placement Cell Block B, Lab 2');
  const [interviewNotes, setInterviewNotes] = useState('Technical Coding & Systems Evaluation');

  // Issue Offer modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAppId, setOfferAppId] = useState<number | null>(null);
  const [offerPackage, setOfferPackage] = useState('12.5');

  // Evaluation modal state
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalSlotId, setEvalSlotId] = useState<number | null>(null);
  const [evalResult, setEvalResult] = useState<InterviewResult>('PASS');
  const [evalNotes, setEvalNotes] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const selectedCompany = companies.find(c => c.company_id === selectedCompanyId);

  const loadCompanyData = async () => {
    try {
      const compRes = await fetch('/api/companies');
      const compData = await compRes.json();
      setCompanies(compData.companies || []);

      const jobRes = await fetch(`/api/jobs?company_id=${selectedCompanyId}`);
      const jobData = await jobRes.json();
      const companyJobs = jobData.jobs || [];
      setJobs(companyJobs);

      if (companyJobs.length > 0) {
        const currentSelectedJobExists = companyJobs.some((j: JobWithDetails) => j.job_id === selectedJobId);
        const jobIdToLoad = currentSelectedJobExists ? selectedJobId : companyJobs[0].job_id;
        setSelectedJobId(jobIdToLoad);

        const appRes = await fetch(`/api/applications?job_id=${jobIdToLoad}`);
        const appData = await appRes.json();
        setApplications(appData.applications || []);
      } else {
        setApplications([]);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedJobId) {
      fetch(`/api/applications?job_id=${selectedJobId}`)
        .then(r => r.json())
        .then(data => setApplications(data.applications || []))
        .catch(console.error);
    }
  }, [selectedJobId]);

  const handleRunShortlisting = async () => {
    try {
      setShortlistingLoading(true);
      setMessage(null);
      setShortlistSummary(null);

      const res = await fetch('/api/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: selectedJobId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Shortlisting failed');
      }

      setShortlistSummary(data.result);
      setMessage({
        text: `Atomic Shortlisting completed: ${data.result.shortlisted_count} student(s) shortlisted, ${data.result.ineligible_count} ineligible.`,
        type: 'success'
      });

      loadCompanyData();
      onDataChanged();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setShortlistingLoading(false);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMessage(null);
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: selectedCompanyId,
          season_id: 1,
          role_title: newRoleTitle,
          min_cgpa: parseFloat(newMinCgpa),
          max_backlogs: parseInt(newMaxBacklogs, 10),
          drive_date: new Date(newDriveDate).toISOString(),
          allowed_branches: newBranches
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: `Recruitment drive for ${newRoleTitle} posted successfully!`, type: 'success' });
      setShowNewDriveModal(false);
      setNewRoleTitle('');
      loadCompanyData();
      onDataChanged();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppId) return;

    try {
      setMessage(null);
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: targetAppId,
          round_number: roundNumber,
          scheduled_at: new Date(schedDate).toISOString(),
          venue,
          notes: interviewNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: `Round ${roundNumber} scheduled successfully!`, type: 'success' });
      setShowScheduleModal(false);
      loadCompanyData();
      onDataChanged();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalSlotId) return;

    try {
      setMessage(null);
      const res = await fetch('/api/interviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: evalSlotId,
          result: evalResult,
          notes: evalNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: `Interview result recorded: ${evalResult}`, type: 'success' });
      setShowEvalModal(false);
      loadCompanyData();
      onDataChanged();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerAppId) return;

    try {
      setMessage(null);
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: offerAppId,
          package_lpa: parseFloat(offerPackage)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: `Official employment offer issued: ${offerPackage} LPA!`, type: 'success' });
      setShowOfferModal(false);
      loadCompanyData();
      onDataChanged();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const currentJob = jobs.find(j => j.job_id === selectedJobId);

  return (
    <div className="space-y-6">
      {/* Company Header & Job Selector Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-600/30">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-slate-900">{selectedCompany?.company_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Employer Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage recruitment drives, shortlist eligible applicants, conduct interviews, and release offers.
              </p>
            </div>
          </div>

          {/* Company Switcher */}
          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Switch Employer:</span>
            <select
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(parseInt(e.target.value, 10))}
              className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {companies.map(c => (
                <option key={c.company_id} value={c.company_id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Drive Selector & Actions */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Active Drive:</span>
            {jobs.length > 0 ? (
              <select
                value={selectedJobId}
                onChange={e => setSelectedJobId(parseInt(e.target.value, 10))}
                className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {jobs.map(j => (
                  <option key={j.job_id} value={j.job_id}>
                    {j.role_title} (Min CGPA: {j.min_cgpa}, Max Backlogs: {j.max_backlogs})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400">No drives posted yet</span>
            )}
          </div>

          <button
            onClick={() => setShowNewDriveModal(true)}
            className="flex items-center space-x-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Recruitment Drive</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-3 shadow-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Shortlist Summary Feedback */}
      {shortlistSummary && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100">
                Atomic Shortlisting Report (Job #{shortlistSummary.job_id})
              </h3>
            </div>
            <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
              Evaluated {shortlistSummary.total_evaluated} candidate(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="font-bold text-emerald-400 block mb-1">
                ✓ Shortlisted ({shortlistSummary.shortlisted_count})
              </span>
              {shortlistSummary.shortlisted_applications.length > 0 ? (
                <ul className="space-y-1 text-slate-300">
                  {shortlistSummary.shortlisted_applications.map((a: any) => (
                    <li key={a.application_id}>
                      • <strong>{a.student_name}</strong> ({a.student_usn})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">None</p>
              )}
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="font-bold text-rose-400 block mb-1">
                ✗ Ineligible Reasons Logged ({shortlistSummary.ineligible_count})
              </span>
              {shortlistSummary.ineligible_applications.length > 0 ? (
                <ul className="space-y-1.5 text-slate-300">
                  {shortlistSummary.ineligible_applications.map((a: any) => (
                    <li key={a.application_id}>
                      • <strong>{a.student_name}</strong>: {a.reason}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">None</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('CANDIDATES')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'CANDIDATES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Applicants & Shortlisting ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INTERVIEWS')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'INTERVIEWS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Interview Management</span>
        </button>

        <button
          onClick={() => setActiveTab('OFFERS')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'OFFERS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Issue Offers</span>
        </button>
      </div>

      {/* TAB 1: CANDIDATES & 1-CLICK ATOMIC SHORTLISTING */}
      {activeTab === 'CANDIDATES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
            <div>
              <h3 className="text-sm font-bold text-indigo-950">
                Applicant Pool for {currentJob?.role_title || 'Selected Drive'}
              </h3>
              <p className="text-xs text-indigo-700 mt-0.5">
                Eligibility criteria: Min CGPA {currentJob?.min_cgpa}, Max Backlogs {currentJob?.max_backlogs}, Allowed: {currentJob?.allowed_branches?.length ? currentJob.allowed_branches.join(', ') : 'All Branches'}.
              </p>
            </div>

            <button
              onClick={handleRunShortlisting}
              disabled={shortlistingLoading || applications.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${shortlistingLoading ? 'animate-spin' : ''}`} />
              <span>{shortlistingLoading ? 'Evaluating...' : '1-Click Atomic Shortlisting'}</span>
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No applications received yet for this drive</h3>
              <p className="text-xs text-slate-500 mt-1">
                Switch to student portal to submit applications.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student Name & USN</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">CGPA</th>
                      <th className="py-3 px-4">Backlogs (Act/Clr)</th>
                      <th className="py-3 px-4">Application Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map(app => (
                      <tr key={app.application_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{app.student.full_name}</p>
                          <p className="text-slate-400 font-mono text-[11px]">{app.student.usn}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{app.student.branch}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{Number(app.student.cgpa).toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <span className={app.student.active_backlogs > 0 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                            {app.student.active_backlogs}
                          </span>
                          <span className="text-slate-400"> / {app.student.cleared_backlogs}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            app.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'OFFERED'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'INTERVIEWED' || app.status === 'INTERVIEW_SCHEDULED'
                              ? 'bg-purple-100 text-purple-800'
                              : app.status === 'SHORTLISTED'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED'].includes(app.status) && (
                            <button
                              onClick={() => {
                                setTargetAppId(app.application_id);
                                setShowScheduleModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] border border-indigo-200 transition"
                            >
                              Schedule Round
                            </button>
                          )}

                          {app.status === 'INTERVIEWED' && !app.offer && (
                            <button
                              onClick={() => {
                                setOfferAppId(app.application_id);
                                setShowOfferModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition"
                            >
                              Issue Offer
                            </button>
                          )}
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

      {/* TAB 2: INTERVIEWS & RESULT RECORDING */}
      {activeTab === 'INTERVIEWS' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Scheduled Interview Rounds & Result Recording</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.flatMap(app => app.interviews.map(slot => ({ slot, app }))).length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No interview rounds scheduled</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Shortlist applicants and click &ldquo;Schedule Round&rdquo; to set up interview slots.
                </p>
              </div>
            ) : (
              applications.flatMap(app =>
                app.interviews.map(slot => (
                  <div
                    key={slot.interview_slot_id}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 uppercase">
                          Round {slot.round_number}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">
                          {app.student.full_name} ({app.student.usn})
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{slot.notes || 'Interview Slot'}</p>
                      </div>

                      <div>
                        {slot.result === 'PASS' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            ✓ PASS
                          </span>
                        )}
                        {slot.result === 'FAIL' && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                            ✗ FAIL
                          </span>
                        )}
                        {(!slot.result || slot.result === 'PENDING') && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            PENDING
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg text-xs text-slate-600 space-y-1">
                      <p className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(slot.scheduled_at).toLocaleString()}</span>
                      </p>
                      <p className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.venue}</span>
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setEvalSlotId(slot.interview_slot_id);
                          setShowEvalModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                      >
                        Record / Update Result
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ISSUE OFFERS */}
      {activeTab === 'OFFERS' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Official Employment Offers Issued</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.filter(a => a.offer !== null).length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No offers issued yet for this drive</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Once candidates complete interview rounds and reach INTERVIEWED status, issue offers here.
                </p>
              </div>
            ) : (
              applications.filter(a => a.offer !== null).map(app => (
                <div
                  key={app.offer!.offer_id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-200 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 uppercase">
                        Issued Offer #{app.offer!.offer_id}
                      </span>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                        {app.student.full_name} ({app.student.usn})
                      </h4>
                      <p className="text-xl font-extrabold text-emerald-700 mt-1">
                        {Number(app.offer!.package_lpa).toFixed(2)} LPA CTC
                      </p>
                    </div>

                    <div>
                      {app.offer!.is_accepted ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ ACCEPTED
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          PENDING ACCEPTANCE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg text-xs font-mono text-slate-600 break-all">
                    Storage Key: {app.offer!.offer_letter_key}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: POST NEW RECRUITMENT DRIVE */}
      {showNewDriveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Post New Recruitment Drive</h3>
            <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Software Engineer"
                  value={newRoleTitle}
                  onChange={e => setNewRoleTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min CGPA (0.00 – 10.00)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={newMinCgpa}
                    onChange={e => setNewMinCgpa(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newMaxBacklogs}
                    onChange={e => setNewMaxBacklogs(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Drive Date</label>
                <input
                  type="date"
                  required
                  value={newDriveDate}
                  onChange={e => setNewDriveDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Allowed Branches (Leave empty for Pool Drive open to all branches)
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(['CSE', 'ECE', 'ISE', 'MECH', 'CIVIL'] as Branch[]).map(b => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => {
                        if (newBranches.includes(b)) {
                          setNewBranches(newBranches.filter(x => x !== b));
                        } else {
                          setNewBranches([...newBranches, b]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        newBranches.includes(b)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDriveModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition"
                >
                  Publish Drive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE INTERVIEW ROUND */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Schedule Interview Round</h3>
            <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Round Number</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={roundNumber}
                  onChange={e => setRoundNumber(parseInt(e.target.value, 10))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={schedDate}
                  onChange={e => setSchedDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Venue / Instructions</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={e => setVenue(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Round Notes</label>
                <input
                  type="text"
                  value={interviewNotes}
                  onChange={e => setInterviewNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD INTERVIEW RESULT */}
      {showEvalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Record Interview Result</h3>
            <form onSubmit={handleRecordResult} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Interview Outcome</label>
                <select
                  value={evalResult}
                  onChange={e => setEvalResult(e.target.value as InterviewResult)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold"
                >
                  <option value="PASS">PASS</option>
                  <option value="FAIL">FAIL</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Evaluator Notes</label>
                <textarea
                  rows={3}
                  value={evalNotes}
                  onChange={e => setEvalNotes(e.target.value)}
                  placeholder="Feedback on candidate performance..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEvalModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-black text-white font-bold"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE OFFICIAL OFFER */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Issue Employment Offer</h3>
            <form onSubmit={handleIssueOffer} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Compensation Package (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={offerPackage}
                  onChange={e => setOfferPackage(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 text-base font-extrabold"
                />
              </div>

              <p className="text-slate-500 leading-normal">
                An unpredictable secure storage key will be automatically generated. The candidate will be notified and invited to officially accept.
              </p>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Issue Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
