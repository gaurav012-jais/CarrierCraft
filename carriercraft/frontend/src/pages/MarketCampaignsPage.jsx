import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { marketsApi, campaignsApi } from '../services/api';
import { Search, Plus, ChevronRight, ArrowLeft, Pencil, X } from 'lucide-react';

function CampaignModal({ isOpen, onClose, onSave, title, initialName = '', marketInfo }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(name.trim());
      onClose();
    } catch (err) {
      alert(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {marketInfo && (
            <p className="text-xs text-slate-500">
              Creating under{' '}
              <strong className="text-slate-800">
                {marketInfo.countryName} / {marketInfo.operatorName}
              </strong>
            </p>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Wellness WAP"
              required
              autoFocus
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-xs shadow-blue-200"
            >
              {saving ? 'Saving...' : title.includes('New') ? 'Create campaign' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function MarketCampaignsPage() {
  const { countryCode, operatorCode } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const loadData = async () => {
    try {
      const res = await marketsApi.getMarketDetails(countryCode, operatorCode);
      if (res?.data) setMarket(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [countryCode, operatorCode]);

  const filtered = useMemo(() => {
    const list = market?.campaigns || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.trackingId || '').toLowerCase().includes(q)
    );
  }, [market, search]);

  const handleCreate = async (name) => {
    const res = await marketsApi.createMarketCampaign(countryCode, operatorCode, { name });
    loadData();
    if (res?.data?.id) {
      navigate(`/markets/${countryCode}/${operatorCode}/campaigns/${res.data.id}`);
    }
  };

  const handleUpdate = async (name) => {
    if (!editingCampaign) return;
    await campaignsApi.update(editingCampaign.id, { name });
    loadData();
  };

  if (loading) {
    return (
      <Layout title="Market Campaigns">
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading market campaigns...</div>
      </Layout>
    );
  }

  if (!market) {
    return (
      <Layout title="Market Not Found">
        <div className="p-12 text-center text-slate-600">
          <p className="mb-4">Market not found for {countryCode} / {operatorCode}</p>
          <button
            onClick={() => navigate('/markets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
          >
            Back to markets
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${market.countryName} / ${market.operatorName}`}>
      <div className="p-8 flex flex-col gap-6 max-w-6xl mx-auto">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate('/markets')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors w-fit font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to markets</span>
        </button>

        {/* Top Header & Breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">
              <Link to="/markets" className="hover:text-blue-600 transition-colors">Markets</Link>
              {' / '}
              <span>{market.countryCode}</span>
              {' / '}
              <span>{market.operatorCode}</span>
            </p>
            <h1 className="font-heading font-bold text-2xl text-slate-900">
              {market.countryName} / {market.operatorName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Campaigns for this country and operator
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 flex items-center gap-2 shadow-xs shadow-blue-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New campaign</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-mono uppercase text-slate-600 font-semibold">
                <th className="py-3 px-6">CAMPAIGN</th>
                <th className="py-3 px-6">TRACKING ID</th>
                <th className="py-3 px-6">STATUS</th>
                <th className="py-3 px-6">PAGES</th>
                <th className="py-3 px-6 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    {search ? 'No campaigns match your search.' : 'No campaigns yet. Click + New campaign to create one.'}
                  </td>
                </tr>
              ) : (
                filtered.map((camp) => (
                  <tr
                    key={camp.id}
                    onClick={() => navigate(`/markets/${market.countryCode}/${market.operatorCode}/campaigns/${camp.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-6 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                      {camp.name}
                    </td>
                    <td className="py-3.5 px-6">
                      <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {camp.trackingId || camp.tracking_id || '—'}
                      </code>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          camp.active
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {camp.active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        Complete
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title="Edit campaign"
                          onClick={() => setEditingCampaign(camp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CampaignModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSave={handleCreate}
        title="New campaign"
        marketInfo={market}
      />

      <CampaignModal
        isOpen={!!editingCampaign}
        onClose={() => setEditingCampaign(null)}
        onSave={handleUpdate}
        title="Edit campaign"
        initialName={editingCampaign?.name || ''}
      />
    </Layout>
  );
}

export default MarketCampaignsPage;
