import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { campaignsApi, marketsApi } from '../services/api';
import { Plus, Sliders, ExternalLink, ArrowRight, Layers } from 'lucide-react';

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  // Create form state
  const [name, setName] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [mode, setMode] = useState('BOTH');
  const [layout, setLayout] = useState('classic');
  const [price, setPrice] = useState('3.5 AED/day');

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        campaignsApi.list(),
        marketsApi.getMarkets(),
      ]);
      if (cRes?.data) setCampaigns(cRes.data);
      if (mRes?.data) setMarkets(mRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await campaignsApi.create({ name, operatorId, verificationMode: mode, funnelLayout: layout, priceText: price });
    setShowCreate(false);
    setName('');
    loadData();
  };

  return (
    <Layout title="Campaigns & Offer Funnels">
      <div className="p-8 flex flex-col gap-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">Campaigns Control Hub</h1>
            <p className="text-sm text-slate-500 mt-1">Manage active carrier billing funnels, verification modes, layouts, and 8-screen canvas pages.</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 flex items-center gap-2 shadow-xs shadow-blue-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-400 uppercase bg-slate-50">
                <th className="py-3 px-6">Campaign Offer</th>
                <th className="py-3 px-6">Tracking ID</th>
                <th className="py-3 px-6">Market</th>
                <th className="py-3 px-6">Verification Mode</th>
                <th className="py-3 px-6">Layout</th>
                <th className="py-3 px-6">Price</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {campaigns.map((camp) => (
                <tr
                  key={camp.id}
                  onClick={() => navigate(`/campaigns/${camp.id}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6 font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {camp.name}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-blue-700 font-bold">{camp.tracking_id}</td>
                  <td className="py-4 px-6 text-slate-700">
                    <span className="font-medium">{camp.operator_name}</span> ({camp.country_name})
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {camp.verification_mode}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-600">
                      {camp.funnel_layout || 'classic'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-slate-700">{camp.price_text}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-xs font-semibold text-blue-600 flex items-center justify-end gap-1 group-hover:underline">
                      <span>Control Hub</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal: Create Campaign */}
        {showCreate && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200">
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-4">Create Campaign Offer</h3>
              <form onSubmit={handleCreate} className="flex flex-col gap-3 text-sm">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">Offer Name</label>
                  <input placeholder="e.g. Gamerz Hub VIP" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">Select Telecom Operator</label>
                  <select value={operatorId} onChange={(e) => setOperatorId(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium bg-white">
                    <option value="">Choose Operator...</option>
                    {markets.map((m) => (
                      <option key={m.operatorId || m.id} value={m.operatorId || m.id}>
                        {m.countryName} — {m.operatorName} ({m.countryCode}-{m.operatorCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">Verification Mode</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium bg-white">
                    <option value="BOTH">BOTH (Smart HE with SMS Fallback)</option>
                    <option value="OTP_ONLY">OTP_ONLY (Manual Mobile Number & PIN)</option>
                    <option value="HEADER_INJECTION">HEADER_INJECTION (Strict Mobile Data Only)</option>
                    <option value="NONE">NONE (Null-Flow Carrier Gateway Redirect)</option>
                    <option value="UNIVERSE_DCB">UNIVERSE_DCB (Operator DCB PIN Protocol)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">Funnel Layout</label>
                  <select value={layout} onChange={(e) => setLayout(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium bg-white">
                    <option value="classic">Classic (HOME ➔ OTP ➔ CONFIRM)</option>
                    <option value="packs_on_home">Checks Before Home (1-Step Fast Checkout)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-700 uppercase mb-1">Price Tag</label>
                  <input placeholder="e.g. 3.5 AED/day" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium" />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-xs shadow-blue-200">Save Campaign</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
