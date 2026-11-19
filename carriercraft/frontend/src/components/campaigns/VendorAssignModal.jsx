import { useState, useEffect } from 'react';
import { X, Check, Copy, Radio, Plus } from 'lucide-react';
import { partnersApi, campaignsApi } from '../../services/api';

export function VendorAssignModal({ campaignId, campaignTrackingId, countryCode, operatorName, onClose, onAssigned }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [payoutUsd, setPayoutUsd] = useState('2.50');
  const [dailyCap, setDailyCap] = useState('500');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    partnersApi.listVendors().then((res) => {
      if (res?.data) {
        setVendors(res.data);
        if (res.data.length > 0) setSelectedVendorId(res.data[0].id);
      }
    }).catch(console.error);
  }, []);

  const selectedVendor = vendors.find(v => String(v.id) === String(selectedVendorId));
  const vendorCode = selectedVendor?.code || 'VID';
  const previewTrackingUrl = `${window.location.origin}/subscription?country=${countryCode}&operator=${encodeURIComponent(operatorName || '')}&tracking_campid=${campaignTrackingId}&campid={vendor_camp}&click_id={click_id}&vid=${vendorCode}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVendorId) return;
    setSaving(true);
    try {
      await campaignsApi.assignVendor(campaignId, {
        vendorId: parseInt(selectedVendorId, 10),
        payoutUsd: parseFloat(payoutUsd),
        dailyCap: parseInt(dailyCap, 10),
      });
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewTrackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">Assign Traffic Vendor</h3>
              <p className="text-xs text-slate-500">Generate affiliate tracking links and configure payouts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-sm">
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
              Select Ad Network / Vendor
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                Payout Per Sub ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={payoutUsd}
                onChange={(e) => setPayoutUsd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">
                Daily Conversion Cap
              </label>
              <input
                type="number"
                value={dailyCap}
                onChange={(e) => setDailyCap(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Generated URL Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
            <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold">Generated Dual Tracking Link</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={previewTrackingUrl}
                className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-blue-700 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 flex items-center gap-1 shrink-0 shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400">
              Paste this URL into your affiliate network campaign settings.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm shadow-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{saving ? 'Assigning...' : 'Assign Vendor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
