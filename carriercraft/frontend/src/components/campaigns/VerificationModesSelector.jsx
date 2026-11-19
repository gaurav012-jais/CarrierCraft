import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

export const VERIFICATION_MODES = [
  {
    id: 'HEADER_INJECTION',
    label: 'Header Injection',
    hint: 'Resolve number from carrier header / ISP, then HOME. If missing — Error page.',
  },
  {
    id: 'OTP_ONLY',
    label: 'OTP only',
    hint: 'No landing HE. OTP first (or HOME first), then HOME pack CTAs — or expose public send/verify APIs.',
  },
  {
    id: 'BOTH',
    label: 'Header Injection + OTP',
    hint: 'HE first: Hit → HOME. Miss → OTP → HOME.',
  },
  {
    id: 'UNIVERSE_DCB',
    label: 'Universe Telecom DCB',
    hint: 'WAP funnel with PIN + pack, or API expose for vendor billing PIN send/confirm (no pages).',
  },
  {
    id: 'ORANGE_BF',
    label: 'Orange Burkina Faso',
    hint: 'Multi-step French VAS flow for Orange BF (+226) with CheckSub auto-forward, Auth OTP & async Unsub.',
  },
  {
    id: 'NONE',
    label: 'None (null / CG redirect)',
    hint: 'No HE/OTP. If a CG URL is set → redirect there on landing with click_id.',
  },
  {
    id: 'CG_HOME',
    label: 'CG via HOME (no HE)',
    hint: 'No HE/OTP. Show HOME first. Subscribe redirects to CG URL with click_id.',
  },
];

export const LANDING_PAGE_OPTIONS = [
  {
    id: 'HOME',
    title: 'HOME first',
    hint: 'Show intro, then OTP, then HOME packs.',
  },
  {
    id: 'OTP',
    title: 'OTP first',
    hint: 'Skip HOME on landing — PIN first, then HOME packs.',
  },
  {
    id: 'API_EXPOSE',
    title: 'API expose',
    hint: 'No WAP pages — expose public OTP send/verify URLs.',
  },
];

export function VerificationModesSelector({
  currentMode = 'OTP_ONLY',
  landingOption = 'API_EXPOSE',
  isLocked = false,
  onModeChange,
  onLandingChange,
  onResetLayout,
  onResetPages,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* 1. Verification Mode Grid */}
      <div>
        <p className="text-xs font-semibold text-slate-800 mb-3">Verification mode</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VERIFICATION_MODES.map((m) => {
            const isSelected = currentMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                disabled={isLocked}
                onClick={() => onModeChange?.(m.id)}
                className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                } ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}
              >
                <p className="text-sm font-bold text-slate-900">{m.label}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{m.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Landing Page Options */}
      <div>
        <p className="text-xs font-semibold text-slate-800 mb-3">Landing page</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LANDING_PAGE_OPTIONS.map((opt) => {
            const isSelected = landingOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isLocked}
                onClick={() => onLandingChange?.(opt.id)}
                className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                } ${isLocked ? 'cursor-not-allowed opacity-75' : ''}`}
              >
                <p className="text-sm font-bold text-slate-900">{opt.title}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{opt.hint}</p>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Vendor send/verify APIs are in the Vendors tab. Configure Partner OTP in Campaign API.
        </p>
      </div>

      {/* 3. Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onResetLayout}
          disabled={isLocked}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
        >
          Reset layout to default for this mode
        </button>
        <button
          type="button"
          onClick={onResetPages}
          disabled={isLocked}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset pages to default</span>
        </button>
      </div>
    </div>
  );
}

export default VerificationModesSelector;
