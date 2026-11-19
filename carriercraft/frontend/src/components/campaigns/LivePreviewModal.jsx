import { useState } from 'react';
import { X, ExternalLink, RefreshCw, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function LivePreviewModal({ isOpen, onClose, campaign }) {
  const [activeTab, setActiveTab] = useState('interactive');
  const [reloadKey, setReloadKey] = useState(0);

  if (!isOpen || !campaign) return null;

  const cCode = campaign.country_code || 'IN';
  const opCode = campaign.operator_code || 'XZ12';
  const trackingCampid = campaign.tracking_id || `${cCode}-${opCode}-${campaign.id}`;
  const previewUrl = `/subscription?country=${cCode}&operator=${opCode}&tracking_campid=${trackingCampid}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[740px] max-h-[90vh]">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">Live Funnel Preview</h3>
              <p className="text-xs text-slate-500 font-mono">{trackingCampid}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              title="Restart Test Funnel"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.open(previewUrl, '_blank')}
              title="Open full page in new tab"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Tab</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Funnel Iframe View */}
        <div className="flex-1 bg-slate-100 flex items-center justify-center p-3 overflow-hidden">
          <iframe
            key={reloadKey}
            src={previewUrl}
            title="Carrier Billing Live Funnel"
            className="w-full h-full rounded-2xl border border-slate-300 bg-white shadow-inner"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Simulation Mode: Active</span>
          <span className="text-blue-700 font-bold">{cCode} · {opCode}</span>
        </div>
      </div>
    </div>
  );
}

export default LivePreviewModal;
