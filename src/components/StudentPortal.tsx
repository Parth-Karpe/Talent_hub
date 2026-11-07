'use client';

import React, { useState, useEffect } from 'react';
import {
  Student,
  JobWithDetails,
  ApplicationDetail,
  Offer,
  EligibilityResult
} from '@/lib/models/types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  AlertCircle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Award,
  Calendar,
  MapPin,
  Send
} from 'lucide-react';

interface StudentPortalProps {
  onDataChanged: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onDataChanged }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1); // Default Rahul
  const [jobs, setJobs] = useState<(JobWithDetails & { eligibility?: EligibilityResult })[]>([]);
  const [applications, setApplications] = useState<ApplicationDetail[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeTab, setActiveTab] = useState<'DRIVES' | 'APPLICATIONS' | 'OFFERS'>('DRIVES');
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [acceptingOfferId, setAcceptingOfferId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const selectedStudent = students.find(s => s.student_id === selectedStudentId);

  const loadStudentData = async () => {
    try {
      // 1. Fetch all students for the switcher
      const stuRes = await fetch('/api/students');
      const stuData = await stuRes.json();
      setStudents(stuData.students || []);

      // 2. Fetch jobs with eligibility evaluated for current student
      const jobRes = await fetch(`/api/jobs?student_id=${selectedStudentId}`);
      const jobData = await jobRes.json();
      setJobs(jobData.jobs || []);

      // 3. Fetch applications for current student
      const appRes = await fetch(`/api/applications?student_id=${selectedStudentId}`);
      const appData = await appRes.json();
      setApplications(appData.applications || []);

      // 4. Fetch offers for current student
      const offRes = await fetch(`/api/offers?student_id=${selectedStudentId}`);
      const offData = await offRes.json();
      setOffers(offData.offers || []);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [selectedStudentId]);

  const handleApply = async (jobId: number) => {
    try {
      setApplyingJobId(jobId);
      setMessage(null);
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudentId,
          job_id: jobId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Application submission failed');
      }

      setMessage({
        text: `Application submitted successfully for ${data.application.job.role_title}!`,
        type: 'success'
      });
      loadStudentData();
      onDataChanged();
      setActiveTab('APPLICATIONS');
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleAcceptOffer = async (offerId: number) => {
    if (!confirm('Are you sure you want to accept this offer? Acceptance is final and registers you as placed for the 2026–27 season.')) {
      return;
    }

    try {
      setAcceptingOfferId(offerId);
      setMessage(null);
      const res = await fetch('/api/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          student_id: selectedStudentId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Offer acceptance failed');
      }

      setMessage({
        text: `🎉 Congratulations! You have officially accepted the offer (${data.package_lpa} LPA). You are now registered as PLACED!`,
        type: 'success'
      });
      loadStudentData();
      onDataChanged();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setAcceptingOfferId(null);
    }
  };

  const stepsOrder = [
    'APPLIED',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'INTERVIEWED',
    'OFFERED',
    'ACCEPTED'
  ];

  return (
    <div className="space-y-6">
      {/* Student Profile & Switcher Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/30">
              {selectedStudent?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-slate-900">{selectedStudent?.full_name}</h1>
                {selectedStudent?.has_accepted_offer ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PLACED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SEEKING PLACEMENT</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-mono mt-0.5">
                USN: {selectedStudent?.usn} · {selectedStudent?.email}
              </p>
            </div>
          </div>

          {/* Student Switcher Selector */}
          <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Switch Student:</span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(parseInt(e.target.value, 10))}
              className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {students.map(s => (
                <option key={s.student_id} value={s.student_id}>
                  {s.full_name} ({s.branch}, CGPA {s.cgpa}, {s.active_backlogs} bl) {s.has_accepted_offer ? '✓ Placed' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Academic Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Branch</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{selectedStudent?.branch}</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {Number(selectedStudent?.cgpa || 0).toFixed(2)}
              <span className="text-xs text-slate-500 font-normal"> / 10.0</span>
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Backlogs</span>
            <p className={`text-lg font-bold mt-0.5 ${
              (selectedStudent?.active_backlogs || 0) > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {selectedStudent?.active_backlogs || 0}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cleared Backlogs</span>
            <p className="text-lg font-bold text-slate-700 mt-0.5">
              {selectedStudent?.cleared_backlogs || 0}
              <span className="text-[10px] text-slate-500 block font-normal leading-tight">Does not affect eligibility</span>
            </p>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('DRIVES')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'DRIVES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Open Placement Drives ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`flex items-center space-x-2 pb-3 px-4 text-sm font-semibold border-b-2 transition ${
            activeTab === 'APPLICATIONS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>My Applications ({applications.length})</span>
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
          <span>Official Offers ({offers.length})</span>
        </button>
      </div>

      {/* TAB 1: DRIVES & JOBS */}
      {activeTab === 'DRIVES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map(job => {
            const isApplied = applications.some(a => a.job_id === job.job_id);
            const isExpanded = expandedJobId === job.job_id;
            const evalResult = job.eligibility;
            const isEligible = evalResult?.eligible ?? false;

            return (
              <div
                key={job.job_id}
                className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${
                  isApplied
                    ? 'border-slate-300 bg-slate-50/50'
                    : isEligible
                    ? 'border-indigo-200 ring-1 ring-indigo-100 hover:shadow-md'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
                      {job.company_name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{job.role_title}</h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Drive Date: {new Date(job.drive_date).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div>
                    {isApplied ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>APPLIED</span>
                      </span>
                    ) : isEligible ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ELIGIBLE</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>INELIGIBLE</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Criteria Pills */}
                <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium text-slate-600">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    Min CGPA: <strong>{Number(job.min_cgpa).toFixed(2)}</strong>
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    Max Backlogs: <strong>{job.max_backlogs}</strong>
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    Allowed: <strong>{job.allowed_branches.length ? job.allowed_branches.join(', ') : 'All Branches (Pool)'}</strong>
                  </span>
                </div>

                {/* Eligibility Breakdown Accordion */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedJobId(isExpanded ? null : job.job_id)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
                  >
                    <span>Check 4-Step Eligibility Rules</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isExpanded && evalResult && (
                    <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                      <p className="font-semibold text-slate-800">{evalResult.reason}</p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                        <div className="flex items-center space-x-1.5">
                          {evalResult.breakdown.cgpa_check.pass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                          <span>CGPA Check ({evalResult.breakdown.cgpa_check.student_cgpa} ≥ {evalResult.breakdown.cgpa_check.min_cgpa})</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {evalResult.breakdown.backlog_check.pass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                          <span>Backlogs ({evalResult.breakdown.backlog_check.active_backlogs} ≤ {evalResult.breakdown.backlog_check.max_backlogs})</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {evalResult.breakdown.offer_check.pass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                          <span>No Offer Accepted in Season</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {evalResult.breakdown.branch_check.pass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          )}
                          <span>Branch Permitted ({evalResult.breakdown.branch_check.student_branch})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <div className="mt-5">
                  {isApplied ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold cursor-not-allowed"
                    >
                      Application Already Submitted
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job.job_id)}
                      disabled={!isEligible || applyingJobId === job.job_id}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                        isEligible
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{applyingJobId === job.job_id ? 'Submitting Application...' : 'Apply For Drive'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MY APPLICATIONS & PROGRESS TRACKER */}
      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Browse open placement drives and apply to positions matching your eligibility.
              </p>
            </div>
          ) : (
            applications.map(app => {
              const currentStatusIndex = stepsOrder.indexOf(app.status);

              return (
                <div
                  key={app.application_id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase">
                        {app.job.company_name}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">{app.job.role_title}</h3>
                      <p className="text-xs text-slate-500">
                        Application ID: #{app.application_id} · Submitted on {new Date(app.applied_at).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        Current Status: {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual 6-Step Funnel Progress Stepper */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 block mb-3 uppercase tracking-wider">
                      Application Lifecycle Progress
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {stepsOrder.map((step, idx) => {
                        const isDone = currentStatusIndex >= idx;
                        const isCurrent = currentStatusIndex === idx;

                        return (
                          <div
                            key={step}
                            className={`p-2.5 rounded-lg border text-center transition ${
                              isCurrent
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}
                          >
                            <span className="text-[10px] font-bold block mb-0.5">Stage {idx + 1}</span>
                            <span className="text-xs font-semibold leading-tight block truncate">
                              {step.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scheduled Interviews Section */}
                  {app.interviews.length > 0 && (
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2 flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span>Scheduled Interview Rounds</span>
                      </h4>
                      <div className="space-y-2">
                        {app.interviews.map(slot => (
                          <div
                            key={slot.interview_slot_id}
                            className="bg-white p-3 rounded-lg border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-xs text-indigo-700">
                                Round {slot.round_number}:
                              </span>
                              <span className="text-xs font-medium text-slate-800 ml-1.5">
                                {slot.notes || 'Interview Evaluation'}
                              </span>
                              <p className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                                <span>{new Date(slot.scheduled_at).toLocaleString()}</span>
                                <span>·</span>
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{slot.venue}</span>
                                </span>
                              </p>
                            </div>

                            <div>
                              {slot.result === 'PASS' && (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                                  ✓ Result: PASS
                                </span>
                              )}
                              {slot.result === 'FAIL' && (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                                  ✗ Result: FAIL
                                </span>
                              )}
                              {(!slot.result || slot.result === 'PENDING') && (
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                                  ⏳ Evaluation PENDING
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Offer Notification within application */}
                  {app.offer && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-xl text-white shadow-md flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                          Official Employment Offer Received!
                        </span>
                        <p className="text-xl font-extrabold mt-0.5">
                          {Number(app.offer.package_lpa).toFixed(2)} LPA
                        </p>
                        <p className="text-xs opacity-80 font-mono mt-0.5">
                          Key: {app.offer.offer_letter_key}
                        </p>
                      </div>

                      <div>
                        {app.offer.is_accepted ? (
                          <span className="bg-white text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-extrabold shadow">
                            ✓ ACCEPTED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcceptOffer(app.offer!.offer_id)}
                            disabled={acceptingOfferId === app.offer!.offer_id}
                            className="bg-white hover:bg-slate-100 text-emerald-800 px-4 py-2 rounded-lg text-xs font-bold shadow-md transition"
                          >
                            {acceptingOfferId === app.offer!.offer_id ? 'Accepting...' : 'Accept Offer'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: OFFICIAL OFFERS */}
      {activeTab === 'OFFERS' && (
        <div className="space-y-6">
          {offers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No offers issued yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Complete interview rounds to receive official placement offers.
              </p>
            </div>
          ) : (
            offers.map(off => (
              <div
                key={off.offer_id}
                className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 shadow-sm border border-emerald-200 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Official Campus Placement Offer
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                      {Number(off.package_lpa).toFixed(2)} LPA CTC
                    </h3>
                    <p className="text-xs text-slate-500">
                      Offer ID: #{off.offer_id} · Issued on {new Date(off.issued_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    {off.is_accepted ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>OFFICIALLY ACCEPTED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>PENDING STUDENT DECISION</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-600 block mb-0.5">Private Storage Reference Key:</span>
                  <span className="font-mono text-slate-800 font-bold break-all">{off.offer_letter_key}</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Unpredictable storage key protecting offer letter confidentiality in compliance with security guidelines.
                  </p>
                </div>

                {!off.is_accepted && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleAcceptOffer(off.offer_id)}
                      disabled={acceptingOfferId === off.offer_id}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{acceptingOfferId === off.offer_id ? 'Accepting...' : 'Accept This Offer (Atomic Commitment)'}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
