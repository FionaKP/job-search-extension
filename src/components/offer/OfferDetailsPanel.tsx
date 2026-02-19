import { useState, useMemo } from 'react';
import {
  Posting,
  OfferDetails,
  WorkLocation,
  WORK_LOCATION_LABELS,
  COMMON_BENEFITS,
} from '@/types';

interface OfferDetailsPanelProps {
  posting: Posting;
  onUpdate: (updates: Partial<Posting>) => void;
  onStatusChange: (status: 'accepted' | 'rejected' | 'withdrawn') => void;
}

/**
 * Panel for recording and viewing offer details
 * Displayed for 'offer' status postings
 */
export function OfferDetailsPanel({
  posting,
  onUpdate,
  onStatusChange,
}: OfferDetailsPanelProps) {
  const [isEditing, setIsEditing] = useState(!posting.offerDetails?.baseSalary);

  const offerDetails = posting.offerDetails || {
    benefits: [],
    notes: '',
  };

  // Calculate deadline info
  const deadlineInfo = useMemo(() => {
    if (!offerDetails.deadline) {
      return { daysRemaining: null, status: 'none' as const };
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const deadline = new Date(offerDetails.deadline);
    deadline.setHours(0, 0, 0, 0);

    const daysRemaining = Math.floor(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: 'urgent' | 'soon' | 'ok' | 'expired' = 'ok';
    if (daysRemaining < 0) {
      status = 'expired';
    } else if (daysRemaining <= 2) {
      status = 'urgent';
    } else if (daysRemaining <= 5) {
      status = 'soon';
    }

    return { daysRemaining, status };
  }, [offerDetails.deadline]);

  // Calculate total compensation
  const totalComp = useMemo(() => {
    const base = offerDetails.baseSalary || 0;
    let bonus = 0;
    if (offerDetails.bonus) {
      bonus = offerDetails.bonus.type === 'percentage'
        ? base * (offerDetails.bonus.value / 100)
        : offerDetails.bonus.value;
    }
    const equity = offerDetails.equity?.value || 0;
    const signOn = offerDetails.signOn || 0;

    return {
      base,
      bonus,
      equity,
      signOn,
      yearOne: base + bonus + equity + signOn,
      annual: base + bonus + equity,
    };
  }, [offerDetails]);

  const handleUpdateDetails = (updates: Partial<OfferDetails>) => {
    onUpdate({
      offerDetails: {
        ...offerDetails,
        ...updates,
      },
    });
  };

  const handleToggleBenefit = (benefit: string) => {
    const currentBenefits = offerDetails.benefits || [];
    const newBenefits = currentBenefits.includes(benefit)
      ? currentBenefits.filter((b) => b !== benefit)
      : [...currentBenefits, benefit];
    handleUpdateDetails({ benefits: newBenefits });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status colors for deadline
  const deadlineColors = {
    urgent: 'text-flatred bg-flatred-50 border-flatred-200',
    soon: 'text-pandora-600 bg-pandora-50 border-pandora-200',
    ok: 'text-teal-600 bg-teal-50 border-teal-200',
    expired: 'text-wine/60 bg-champagne-100 border-sage/30',
    none: 'text-wine/60 bg-champagne-50 border-sage/20',
  };

  return (
    <div className="rounded-lg border border-sage/20 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-champagne-50 border-b border-sage/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-wine" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-wine">Offer Details</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs text-flatred hover:text-flatred-600"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Deadline Warning */}
        {offerDetails.deadline && deadlineInfo.daysRemaining !== null && (
          <div className={`p-3 rounded-lg border ${deadlineColors[deadlineInfo.status]}`}>
            <div className="flex items-center gap-2">
              {deadlineInfo.status === 'expired' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : deadlineInfo.status === 'urgent' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">
                {deadlineInfo.status === 'expired'
                  ? `Offer expired ${Math.abs(deadlineInfo.daysRemaining)} day${Math.abs(deadlineInfo.daysRemaining) !== 1 ? 's' : ''} ago`
                  : deadlineInfo.daysRemaining === 0
                    ? 'Decision due today!'
                    : `${deadlineInfo.daysRemaining} day${deadlineInfo.daysRemaining !== 1 ? 's' : ''} to decide`}
              </span>
            </div>
          </div>
        )}

        {/* Compensation Summary (View Mode) */}
        {!isEditing && offerDetails.baseSalary && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-wine/60">Base Salary</p>
                <p className="font-semibold text-wine">{formatCurrency(totalComp.base)}</p>
              </div>
              {totalComp.bonus > 0 && (
                <div>
                  <p className="text-wine/60">Bonus</p>
                  <p className="font-semibold text-wine">{formatCurrency(totalComp.bonus)}</p>
                </div>
              )}
              {totalComp.equity > 0 && (
                <div>
                  <p className="text-wine/60">Equity (annual)</p>
                  <p className="font-semibold text-wine">{formatCurrency(totalComp.equity)}</p>
                </div>
              )}
              {totalComp.signOn > 0 && (
                <div>
                  <p className="text-wine/60">Sign-on Bonus</p>
                  <p className="font-semibold text-wine">{formatCurrency(totalComp.signOn)}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-sage/20">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-wine">Total Comp (Year 1)</span>
                <span className="text-lg font-bold text-teal-600">{formatCurrency(totalComp.yearOne)}</span>
              </div>
              {totalComp.signOn > 0 && (
                <p className="text-xs text-wine/50 text-right mt-1">
                  Annual: {formatCurrency(totalComp.annual)}
                </p>
              )}
            </div>

            {/* Work arrangement */}
            <div className="flex flex-wrap gap-2">
              {offerDetails.workLocation && (
                <span className="px-2 py-1 text-xs rounded-full bg-champagne-100 text-wine">
                  {WORK_LOCATION_LABELS[offerDetails.workLocation]}
                </span>
              )}
              {offerDetails.pto && (
                <span className="px-2 py-1 text-xs rounded-full bg-champagne-100 text-wine">
                  {offerDetails.pto} PTO
                </span>
              )}
            </div>

            {/* Benefits */}
            {offerDetails.benefits.length > 0 && (
              <div>
                <p className="text-xs font-medium text-wine/50 uppercase tracking-wide mb-2">Benefits</p>
                <div className="flex flex-wrap gap-1">
                  {offerDetails.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="px-2 py-0.5 text-xs rounded bg-teal-50 text-teal-700 border border-teal-200"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <div className="space-y-4">
            {/* Base Salary */}
            <div>
              <label className="text-sm font-medium text-wine">Base Salary</label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wine/50">$</span>
                <input
                  type="number"
                  value={offerDetails.baseSalary || ''}
                  onChange={(e) => handleUpdateDetails({ baseSalary: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="150000"
                  className="w-full pl-7 pr-3 py-2 rounded-md border border-sage/30 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
                />
              </div>
            </div>

            {/* Bonus */}
            <div>
              <label className="text-sm font-medium text-wine">Bonus</label>
              <div className="mt-1 flex gap-2">
                <select
                  value={offerDetails.bonus?.type || 'percentage'}
                  onChange={(e) => handleUpdateDetails({
                    bonus: {
                      type: e.target.value as 'percentage' | 'fixed',
                      value: offerDetails.bonus?.value || 0,
                    }
                  })}
                  className="rounded-md border border-sage/30 px-2 py-2 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">$</option>
                </select>
                <input
                  type="number"
                  value={offerDetails.bonus?.value || ''}
                  onChange={(e) => handleUpdateDetails({
                    bonus: {
                      type: offerDetails.bonus?.type || 'percentage',
                      value: e.target.value ? Number(e.target.value) : 0,
                    }
                  })}
                  placeholder={offerDetails.bonus?.type === 'fixed' ? '20000' : '15'}
                  className="flex-1 px-3 py-2 rounded-md border border-sage/30 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
                />
              </div>
            </div>

            {/* Equity */}
            <div>
              <label className="text-sm font-medium text-wine">Equity (annual value)</label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wine/50">$</span>
                <input
                  type="number"
                  value={offerDetails.equity?.value || ''}
                  onChange={(e) => handleUpdateDetails({
                    equity: {
                      ...offerDetails.equity,
                      value: e.target.value ? Number(e.target.value) : undefined,
                    }
                  })}
                  placeholder="30000"
                  className="w-full pl-7 pr-3 py-2 rounded-md border border-sage/30 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
                />
              </div>
            </div>

            {/* Sign-on */}
            <div>
              <label className="text-sm font-medium text-wine">Sign-on Bonus</label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wine/50">$</span>
                <input
                  type="number"
                  value={offerDetails.signOn || ''}
                  onChange={(e) => handleUpdateDetails({ signOn: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="20000"
                  className="w-full pl-7 pr-3 py-2 rounded-md border border-sage/30 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
                />
              </div>
            </div>

            {/* Work Location */}
            <div>
              <label className="text-sm font-medium text-wine">Work Location</label>
              <div className="mt-1 flex gap-2">
                {(['remote', 'hybrid', 'onsite'] as WorkLocation[]).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleUpdateDetails({ workLocation: offerDetails.workLocation === loc ? undefined : loc })}
                    className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                      offerDetails.workLocation === loc
                        ? 'bg-wine text-white border-wine'
                        : 'border-sage/30 text-wine/70 hover:border-wine'
                    }`}
                  >
                    {WORK_LOCATION_LABELS[loc]}
                  </button>
                ))}
              </div>
            </div>

            {/* PTO */}
            <div>
              <label className="text-sm font-medium text-wine">PTO</label>
              <input
                type="text"
                value={offerDetails.pto || ''}
                onChange={(e) => handleUpdateDetails({ pto: e.target.value || undefined })}
                placeholder="Unlimited, 20 days, etc."
                className="mt-1 w-full px-3 py-2 rounded-md border border-sage/30 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="text-sm font-medium text-wine">Decision Deadline</label>
              <input
                type="date"
                value={offerDetails.deadline || ''}
                onChange={(e) => handleUpdateDetails({ deadline: e.target.value || undefined })}
                className="mt-1 w-full px-3 py-2 rounded-md border border-sage/30 text-sm text-wine focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine"
              />
            </div>

            {/* Benefits */}
            <div>
              <label className="text-sm font-medium text-wine">Benefits</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COMMON_BENEFITS.map((benefit) => (
                  <button
                    key={benefit}
                    onClick={() => handleToggleBenefit(benefit)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      offerDetails.benefits.includes(benefit)
                        ? 'bg-teal-50 text-teal-700 border-teal-300'
                        : 'bg-champagne-50 text-wine/60 border-sage/20 hover:border-sage/40'
                    }`}
                  >
                    {offerDetails.benefits.includes(benefit) && '✓ '}{benefit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-3 border-t border-sage/20 space-y-2">
          <p className="text-xs font-medium text-wine/50 uppercase tracking-wide">Decision</p>

          <button
            onClick={() => onStatusChange('accepted')}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Accept Offer
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange('rejected')}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-wine/60 hover:text-wine border border-sage/20 hover:border-sage/40 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Decline
            </button>
            <button
              onClick={() => onStatusChange('withdrawn')}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-wine/60 hover:text-wine border border-sage/20 hover:border-sage/40 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferDetailsPanel;
