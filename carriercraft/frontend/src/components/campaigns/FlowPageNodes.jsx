import { Edit3, CheckCircle2, ShieldCheck, ArrowRight, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FLOW_PAGES = [
  { type: 'HOME', label: 'Home Page', badge: 'ENTRY', desc: 'First landing canvas. CTAs & packs.' },
  { type: 'OTP', label: 'OTP Page', badge: 'VERIFY', desc: 'Mobile number & PIN verification screen.' },
  { type: 'CONFIRM', label: 'Confirm Page', badge: 'BILLING', desc: 'Plan selection & confirmation.' },
  { type: 'THANKYOU', label: 'Thank You Page', badge: 'SUCCESS', desc: 'Success confirmation & access link.' },
];

export function FlowPageNodes({ campaign, onEditPage }) {
  const navigate = useNavigate();
  const cCode = campaign?.country_code || 'IN';
  const opCode = campaign?.operator_code || 'XZ12';

  const handleEdit = (pt) => {
    if (onEditPage) {
      onEditPage(pt);
    } else {
      navigate(`/markets/${cCode}/${opCode}/campaigns/${campaign.id}/edit/${pt}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Page Sequence Nodes */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-heading font-bold text-sm text-slate-900">Funnel Canvas Pages (8 Screens)</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">GrapesJS Visual Canvas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {FLOW_PAGES.map((p) => (
            <div
              key={p.type}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900">{p.label}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-800">
                    {p.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">{p.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => handleEdit(p.type)}
                className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Page in Canvas</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Col: START config before first page */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-heading font-bold text-sm text-slate-900">START — before first page</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These run on landing (detect) before HOME / OTP is shown. Partner API URLs still come from Campaign API settings.
            </p>
          </div>

          <div className="space-y-3.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={campaign?.verification_mode !== 'OTP_ONLY'}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Header enrichment (HE)</span>
                <span className="text-[11px] text-slate-400">
                  {campaign?.verification_mode === 'OTP_ONLY'
                    ? 'Locked off for OTP_ONLY mode'
                    : 'Resolve MSISDN via carrier telco headers'}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Blocklist check</span>
                <span className="text-[11px] text-slate-400">Prevent fraudulent IP or blacklisted MSISDN</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-blue-600 focus:ring-blue-500" />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Subscriber status check</span>
                <span className="text-[11px] text-slate-400">Auto-forward active subscribers to content</span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4">
          <p className="text-[11px] text-slate-400 font-mono">
            Mode: <strong>{campaign?.verification_mode || 'OTP_ONLY'}</strong> · Layout: <strong>{campaign?.funnel_layout || 'classic'}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default FlowPageNodes;
